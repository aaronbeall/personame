'use client'
import { LoadingState } from '@/components/ui/loading'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { ResultView } from '@/components/result-view'
import { requestJson } from '@/lib/client-api'
import type { ResultSnapshot } from '@/lib/quiz-scoring'
export default function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string; resultId: string }>
}) {
  const { slug, resultId } = use(params)
  const query = useQuery({
    queryKey: ['result', resultId],
    queryFn: () =>
      requestJson<{ snapshot: ResultSnapshot }>(
        `/api/quiz/${slug}/results/${resultId}`,
      ),
    retry: false,
  })
  return (
    <AppLayoutBackground>
      <div className="max-w-3xl mx-auto">
        {query.isPending ? (
          <LoadingState variant="result" label="Opening your result…" />
        ) : query.error ? (
          <div className="notice error" role="alert">
            {query.error.message}{' '}
            <Link href={`/quiz/${slug}`} className="underline">
              Back to quiz
            </Link>
          </div>
        ) : (
          <ResultView result={query.data.snapshot} />
        )}
      </div>
    </AppLayoutBackground>
  )
}
