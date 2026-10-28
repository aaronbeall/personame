import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authOptions } from './auth'
import { prisma } from './prisma'

export const quizInclude = {
  dimensions: { orderBy: { order: 'asc' } },
  archetypes: { orderBy: { order: 'asc' }, include: { dimensions: true } },
  pages: {
    orderBy: { order: 'asc' },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          answers: { orderBy: { order: 'asc' }, include: { weights: true } },
        },
      },
    },
  },
} satisfies Prisma.PersonaInclude
export type FullQuiz = Prisma.PersonaGetPayload<{ include: typeof quizInclude }>
export class WorkflowError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}
export async function currentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    throw new WorkflowError('Sign in to continue.', 401)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) throw new WorkflowError('Account not found.', 401)
  return user
}
export async function ownedQuiz(id: string) {
  const user = await currentUser()
  const quiz = await prisma.persona.findFirst({
    where: { id, creatorId: user.id },
    include: quizInclude,
  })
  if (!quiz) throw new WorkflowError('Quiz not found.', 404)
  return quiz
}
export function apiError(error: unknown) {
  if (error instanceof WorkflowError)
    return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    )
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ['P2034', 'P2002'].includes(error.code)
  )
    return NextResponse.json(
      {
        error:
          'Another update finished at the same time. Please try again; your changes are still here.',
      },
      { status: 409 },
    )
  if (error instanceof z.ZodError)
    return NextResponse.json(
      { error: error.issues.map((i) => i.message).join(' ') },
      { status: 400 },
    )
  console.error(error)
  return NextResponse.json(
    { error: 'Unable to complete this request. Please try again.' },
    { status: 500 },
  )
}
export function publicQuiz(quiz: FullQuiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    description: quiz.description,
    emoji: quiz.emoji,
    color: quiz.color,
    revision: quiz.updatedAt.toISOString(),
    pages: quiz.pages
      .filter((p) => !p.hidden)
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        emoji: p.emoji,
        style: p.style,
        order: p.order,
        questions: p.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
          emoji: q.emoji,
          answers: q.answers.map((a) => ({
            id: a.id,
            text: a.text,
            emoji: a.emoji,
          })),
        })),
      })),
  }
}
