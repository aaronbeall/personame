'use client'
import { LoadingState } from '@/components/ui/loading'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { ResultView } from '@/components/result-view'
import { requestJson } from '@/lib/client-api'
import type { ResultComparison } from '@/lib/result-comparison'
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
      requestJson<{ snapshot: ResultSnapshot; comparison: ResultComparison }>(
        `/api/quiz/${slug}/results/${resultId}`,
      ),
    retry: false,
  })
  return (
    <main className="participant-main">
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
          <ResultView result={query.data.snapshot} comparison={query.data.comparison} />
        )}
      </div>
    </main>
  )
}
