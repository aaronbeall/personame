'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ErrorBanner } from '@/components/ui/error-banner'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { StepProgress } from '@/components/step-progress'
import { ArchetypeRow } from './archetype-row'
import { Metric, Archetype, ArchetypeMetric } from '@prisma/client'
import { ArchetypeEditor } from './archetype-editor'
import { cn, getTempId } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'
import { getColorTheme } from '@/lib/colors'
import { MetricTooltip } from './metric-tooltip'

type ArchetypeWithMetrics = Archetype & { metrics: ArchetypeMetric[] }

export default function ArchetypesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  useProtectedPage()
  const { id } = use(params)
  const [archetypes, setArchetypes] = useState<ArchetypeWithMetrics[]>([])

  // Fetch metrics
  const metricsQuery = useQuery({
    queryKey: ['metrics', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/metrics`)
      if (!res.ok) throw new Error('Failed to fetch metrics')
      return res.json() as Promise<Metric[]>
    },
  })

  // Fetch archetypes
  const archetypesQuery = useQuery({
    queryKey: ['archetypes', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/archetypes`)
      if (!res.ok) throw new Error('Failed to fetch archetypes')
      return res.json() as Promise<ArchetypeWithMetrics[]>
    },
  })

  // Mirror only archetypes to local state for optimistic updates
  useEffect(() => {
    if (archetypesQuery.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setArchetypes(archetypesQuery.data)
    }
  }, [archetypesQuery.data])

  const saveArchetypesMutation = useMutation({
    mutationFn: async (archetypesToSave: ArchetypeWithMetrics[]) => {
      const res = await fetch(`/api/personames/${id}/archetypes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archetypes: archetypesToSave }),
      })

      if (!res.ok) {
        throw new Error('Failed to save archetypes')
      }

      return res.json()
    },
    onSuccess: () => {
      router.push(`/create/${id}/questions`)
    },
  })

  const handleAddArchetype = () => {
    const archetypeId = getTempId()
    const newArchetype: ArchetypeWithMetrics = {
      id: archetypeId,
      name: '',
      description: null,
      emoji: null,
      color: null,
      imageUrl: null,
      order: archetypes.length,
      style: null,
      icon: null,
      personaId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: (metricsQuery.data ?? []).map(m => ({
        id: getTempId(),
        archetypeId: archetypeId,
        metricId: m.id,
        targetValue: 50,
        relevance: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    }
    setArchetypes([...archetypes, newArchetype])
  }

  const handleSaveArchetype = (updatedArchetype: ArchetypeWithMetrics) => {
    setArchetypes(archetypes.map(a => a.id === updatedArchetype.id ? updatedArchetype : a))
  }

  const handleDeleteArchetype = (id: string) => {
    setArchetypes(archetypes.filter(a => a.id !== id))
  }

  const saveArchetypes = () => {
    if (archetypes.length === 0) {
      return
    }

    saveArchetypesMutation.mutate(archetypes)
  }

  const isValid = archetypes.length >= 1 && archetypes.every(a => a.name.trim())

  return (
    <AppLayoutBackground>
      <div className="max-w-4xl mx-auto">
        <StepProgress
          steps={[
            { number: 1, label: 'Metrics', completed: true },
            { number: 2, label: 'Archetypes', active: true },
            { number: 3, label: 'Questions' },
          ]}
          title="Define Your Archetypes"
          description="Create personality types that quiz takers will match against (minimum 2, suggested 3-5)"
        />

        {metricsQuery.data && metricsQuery.data.length > 0 && (
          <Card className="mb-6 border-muted-200 bg-muted-50">
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-muted-600 mb-3 uppercase">Your Metrics</p>
              <div className="flex flex-wrap gap-2">
                {metricsQuery.data.map(metric => (
                  <MetricTooltip key={metric.id} metric={metric}>
                    <button
                      className={
                        cn("px-3 py-1.5 rounded-lg border border-opacity-20 text-xs font-medium text-white cursor-help transition-opacity hover:opacity-90",
                          getColorTheme(metric.color).class
                        )
                      }
                    >
                      {metric.emoji && <span className="mr-1">{metric.emoji}</span>}
                      {metric.name}
                    </button>
                  </MetricTooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personality Archetypes</CardTitle>
            <CardDescription>
              Archetypes are personality types that describe different combinations of your metrics.
              For example: "The Leader", "The Creator", "The Analytical Mind"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ErrorBanner error={saveArchetypesMutation.error} />

            <div className="space-y-6">
              {archetypes.map(archetype => (
                <div key={archetype.id}>
                  <ArchetypeRow
                    archetype={archetype}
                    metrics={metricsQuery.data ?? []}
                    onSave={handleSaveArchetype}
                    onDelete={() => handleDeleteArchetype(archetype.id)}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleAddArchetype}
              className="w-full cursor-pointer border-2 border-dashed border-muted-300 rounded-xl p-8 bg-white/50 hover:bg-white hover:border-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex flex-col items-center gap-3 text-muted-600 group-hover:text-primary-700">
                <div className="h-12 w-12 rounded-lg border-2 border-muted-300 group-hover:border-primary-400 flex items-center justify-center transition-colors">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="font-medium">Add Archetype</span>
                <span className="text-xs text-muted-500">Click to create a new personality type</span>
              </div>
            </button>
          </CardContent>
        </Card>

        <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-800">
            💡 Tip: Each archetype should represent a unique personality profile. Define target values
            for each metric and mark which metrics are most important (high relevance).
          </p>
        </div>

        <div className="flex justify-between">
          <Link href={`/create/${id}/metrics`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            onClick={saveArchetypes}
            disabled={!isValid || saveArchetypesMutation.isPending}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-600 hover:to-secondary-600 text-white shadow-md"
          >
            {saveArchetypesMutation.isPending ? 'Saving...' : 'Continue to Questions'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayoutBackground>
  )
}
