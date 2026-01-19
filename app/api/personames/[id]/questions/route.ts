import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, QuizPage, Question, Answer, AnswerWeight } from '@prisma/client'
import { z } from 'zod'
import { ZodPrismaSchema } from '@/lib/zod-prisma'

// Zod schema constrained by Prisma model types
const answerWeightSchema = z.object({
  metricId: z.string().min(1),
  value: z.number(),
} satisfies ZodPrismaSchema<Omit<AnswerWeight, 'id' | 'answerId' | 'createdAt' | 'updatedAt'>>)

const answerSchema = z.object({
  text: z.string().min(1),
  order: z.number(),
  emoji: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  weights: z.array(answerWeightSchema),
} satisfies ZodPrismaSchema<Omit<Answer, 'id' | 'questionId' | 'createdAt' | 'updatedAt'>>)

const questionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'SLIDER', 'SCALE']),
  order: z.number(),
  required: z.boolean().optional(),
  emoji: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  answers: z.array(answerSchema),
} satisfies ZodPrismaSchema<Omit<Question, 'id' | 'pageId' | 'createdAt' | 'updatedAt'>>)

const quizPageSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  order: z.number(),
  hidden: z.boolean().optional(),
  emoji: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  questions: z.array(questionSchema),
} satisfies ZodPrismaSchema<Omit<QuizPage, 'id' | 'personaId' | 'createdAt' | 'updatedAt'>>)

const quizPagesSchema = z.object({
  pages: z.array(quizPageSchema),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pages = await prisma.quizPage.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
              include: {
                weights: {
                  orderBy: { metricId: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching quiz pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const { pages } = quizPagesSchema.parse(json)

    // Get existing page IDs to delete related data
    const existingPageIds = await prisma.quizPage.findMany({
      where: { personaId: id },
      select: { id: true },
    })

    await prisma.$transaction(async tx => {
      // Delete existing data in correct order
      if (existingPageIds.length > 0) {
        const pageIds = existingPageIds.map(p => p.id)

        // Get question IDs
        const questionIds = await tx.question.findMany({
          where: { pageId: { in: pageIds } },
          select: { id: true },
        })
        const qIds = questionIds.map(q => q.id)

        if (qIds.length > 0) {
          // Get answer IDs
          const answerIds = await tx.answer.findMany({
            where: { questionId: { in: qIds } },
            select: { id: true },
          })
          const aIds = answerIds.map(a => a.id)

          if (aIds.length > 0) {
            // Delete answer weights first
            await tx.answerWeight.deleteMany({
              where: { answerId: { in: aIds } },
            })
          }

          // Delete answers
          await tx.answer.deleteMany({
            where: { questionId: { in: qIds } },
          })
        }

        // Delete questions
        await tx.question.deleteMany({
          where: { pageId: { in: pageIds } },
        })
      }

      // Delete pages
      await tx.quizPage.deleteMany({
        where: { personaId: id },
      })

      // Create new pages with nested data
      for (const page of pages) {
        await tx.quizPage.create({
          data: {
            title: page.title ?? null,
            description: page.description ?? null,
            order: page.order,
            hidden: page.hidden ?? false,
            emoji: page.emoji ?? null,
            color: page.color ?? null,
            style: page.style ?? null,
            icon: page.icon ?? null,
            personaId: id,
            questions: {
              create: page.questions.map(question => ({
                text: question.text,
                type: question.type,
                order: question.order,
                required: question.required ?? true,
                emoji: question.emoji ?? null,
                color: question.color ?? null,
                style: question.style ?? null,
                icon: question.icon ?? null,
                answers: {
                  create: question.answers.map(answer => ({
                    text: answer.text,
                    order: answer.order,
                    emoji: answer.emoji ?? null,
                    color: answer.color ?? null,
                    style: answer.style ?? null,
                    icon: answer.icon ?? null,
                    weights: {
                      create: answer.weights.map(weight => ({
                        metricId: weight.metricId,
                        value: weight.value,
                      })),
                    },
                  })),
                },
              })),
            },
          },
        })
      }
    })

    // Fetch and return the new pages
    const newPages = await prisma.quizPage.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
              include: {
                weights: {
                  orderBy: { metricId: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(newPages)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database validation error', details: error.message }, { status: 400 })
    }
    console.error('Error saving quiz pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
