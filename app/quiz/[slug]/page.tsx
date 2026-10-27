'use client'
import { LoadingState } from '@/components/ui/loading'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { QuizPlayer } from '@/components/quiz-player'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { requestJson } from '@/lib/client-api'
import type { publicQuiz } from '@/lib/personas'
export default function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const query = useQuery({
    queryKey: ['public-quiz', slug],
    queryFn: () =>
      requestJson<ReturnType<typeof publicQuiz>>(`/api/quiz/${slug}`),
    retry: false,
  })
  return (
    <AppLayoutBackground>
      <div className="max-w-3xl mx-auto">
        {query.isPending ? (
          <LoadingState variant="quiz" label="Getting your quiz ready…" />
        ) : query.error ? (
          <div className="surface empty-state">
            <h1>Quiz unavailable</h1>
            <p className="muted">{query.error.message}</p>
            <Link href="/" className="button-link secondary mt-5">
              Explore other quizzes
            </Link>
          </div>
        ) : (
          <QuizPlayer quiz={query.data} />
        )}
      </div>
    </AppLayoutBackground>
  )
}
