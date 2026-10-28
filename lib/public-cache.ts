import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from './prisma'
import { participantSelect } from './quiz-projections'
import { publicQuiz } from './personas'

const catalogTag = 'published-catalog'
export function invalidatePublicQuiz(id: string) {
  // Immediate expiry after mutations; never cache personalized routes.
  revalidateTag(catalogTag, { expire: 0 })
  revalidateTag(`published-quiz-${id}`, { expire: 0 })
}
export const publishedListings = unstable_cache(() => prisma.persona.findMany({
  where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
  select: { id: true, title: true, slug: true, description: true, emoji: true, color: true, completions: true, publishedAt: true, _count: { select: { archetypes: true } } },
  orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }], take: 30,
}), ['published-listings-v1'], { tags: [catalogTag], revalidate: 30 })
export const publishedCount = unstable_cache(() => prisma.persona.count({
  where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
}), ['published-count-v1'], { tags: [catalogTag], revalidate: 30 })
export function publishedQuiz(id: string, revision: string) {
  return unstable_cache(async () => {
    const quiz = await prisma.persona.findFirst({
      where: { id, updatedAt: new Date(revision), status: 'PUBLISHED', visibility: 'PUBLIC' }, select: participantSelect,
    })
    return quiz ? publicQuiz(quiz) : null
  }, ['published-quiz-v1', id, revision], { tags: [`published-quiz-${id}`], revalidate: 30 })()
}
