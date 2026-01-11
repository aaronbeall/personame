'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Plus, Trash2, ArrowRight, ArrowLeft, Lightbulb, Tag, FileText, ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { getMetricColor } from '@/lib/metric-colors'
import { ErrorBanner } from '@/components/error-banner'

interface Metric {
  id: string
  name: string
  description: string
  minLabel: string
  maxLabel: string
  order: number
}

export default function MetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { status } = useSession()
  const { id } = use(params)
  const [metrics, setMetrics] = useState<Metric[]>([])

  const { data: fetchedMetrics } = useQuery({
    queryKey: ['metrics', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/metrics`)
      if (!res.ok) throw new Error('Failed to fetch metrics')
      return res.json() as Promise<Metric[]>
    },
    enabled: status === 'authenticated',
  })

  useEffect(() => {
    if (fetchedMetrics) {
      setMetrics(fetchedMetrics)
    }
  }, [fetchedMetrics])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const saveMetricsMutation = useMutation({
    mutationFn: async (metricsToSave: Metric[]) => {
      const res = await fetch(`/api/personames/${id}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsToSave }),
      })

      if (!res.ok) {
        throw new Error('Failed to save metrics')
      }

      return res.json()
    },
    onSuccess: () => {
      router.push(`/create/${id}/archetypes`)
    },
  })

  const addMetric = () => {
    const newMetric: Metric = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      minLabel: '',
      maxLabel: '',
      order: metrics.length,
    }
    setMetrics([...metrics, newMetric])
  }

  const updateMetric = (id: string, field: keyof Metric, value: string) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const removeMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id))
  }

  const saveMetrics = () => {
    if (metrics.length === 0) {
      return
    }

    if (metrics.some(m => !m.name.trim() || !m.minLabel.trim() || !m.maxLabel.trim())) {
      return
    }

    saveMetricsMutation.mutate(metrics)
  }

  const isValid = metrics.length >= 1 && metrics.every(m => m.name.trim() && m.minLabel.trim() && m.maxLabel.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">


        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">1</div>
                <span className="font-semibold text-primary-900">Metrics</span>
              </div>
              <div className="h-px flex-1 bg-muted-300" />
              <div className="flex items-center gap-2 text-muted-600">
                <div className="h-8 w-8 rounded-full bg-muted-300 text-muted-700 flex items-center justify-center font-semibold">2</div>
                <span>Archetypes</span>
              </div>
              <div className="h-px flex-1 bg-muted-300" />
              <div className="flex items-center gap-2 text-muted-600">
                <div className="h-8 w-8 rounded-full bg-muted-300 text-muted-700 flex items-center justify-center font-semibold">3</div>
                <span>Questions</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-primary-900">Define Your Metrics</h1>
            <p className="text-muted-700">Create personality dimensions to measure (minimum 1, suggested 3-5)</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personality Metrics</CardTitle>
              <CardDescription>
                These are the scales you&apos;ll use to measure personality traits (e.g., Openness, Extraversion, Creativity)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ErrorBanner error={saveMetricsMutation.error} />
              {metrics.map((metric, index) => {
                return (
                  <div key={metric.id} className="relative border border-border rounded-xl p-5 space-y-4 bg-gradient-to-br from-white to-primary-50/30 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${getMetricColor(index)} flex items-center justify-center text-white font-bold shadow-sm`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-900">Metric {index + 1}</h3>
                          <p className="text-xs text-muted-500">Personality dimension</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMetric(metric.id)}
                        className="text-destructive-600 hover:text-destructive-700 hover:bg-destructive-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700">
                          <Tag className="h-4 w-4 text-primary" />
                          Name *
                        </label>
                        <Input
                          placeholder="e.g., Extraversion"
                          value={metric.name}
                          onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700">
                          <FileText className="h-4 w-4 text-secondary" />
                          Description
                        </label>
                        <Input
                          placeholder="What this measures..."
                          value={metric.description}
                          onChange={(e) => updateMetric(metric.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700">
                          <ArrowDown className="h-4 w-4 text-muted-500" />
                          Low End Label *
                        </label>
                        <Input
                          placeholder="e.g., Introverted"
                          value={metric.minLabel}
                          onChange={(e) => updateMetric(metric.id, 'minLabel', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700">
                          <ArrowUp className="h-4 w-4 text-muted-500" />
                          High End Label *
                        </label>
                        <Input
                          placeholder="e.g., Extraverted"
                          value={metric.maxLabel}
                          onChange={(e) => updateMetric(metric.id, 'maxLabel', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={addMetric}
                disabled={metrics.length >= 8}
                className="w-full cursor-pointer border-2 border-dashed border-muted-300 rounded-xl p-8 bg-white/50 hover:bg-white hover:border-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex flex-col items-center gap-3 text-muted-600 group-hover:text-primary-700">
                  <div className="h-12 w-12 rounded-lg border-2 border border-muted-300 group-hover:border-primary-400 flex items-center justify-center transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="font-medium">Add Metric</span>
                  <span className="text-xs text-muted-500">Click to add a new personality dimension</span>
                </div>
              </button>
            </CardContent>
          </Card>

          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-primary-800 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              At least 1 metric required, 3-5 recommended
            </p>
          </div>

          <div className="flex justify-between">
            <Link href="/create">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button
              onClick={saveMetrics}
              disabled={!isValid || saveMetricsMutation.isPending}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary-600 hover:to-secondary-600 text-white shadow-md"
            >
              {saveMetricsMutation.isPending ? 'Saving...' : 'Continue to Archetypes'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
