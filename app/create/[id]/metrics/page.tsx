'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
  const [isSaving, setIsSaving] = useState(false)

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`/api/personames/${id}/metrics`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMetrics()
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status])

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

  const saveMetrics = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/personames/${id}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
      })

      if (res.ok) {
        router.push(`/create/${id}/archetypes`)
      } else {
        alert('Failed to save metrics')
      }
    } catch (error) {
      console.error('Error saving metrics:', error)
      alert('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const isValid = metrics.length >= 3 && metrics.every(m => m.name.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">


        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">1</div>
                <span className="font-semibold">Metrics</span>
              </div>
              <div className="h-px flex-1 bg-gray-300" />
              <div className="flex items-center gap-2 text-gray-400">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold">2</div>
                <span>Archetypes</span>
              </div>
              <div className="h-px flex-1 bg-gray-300" />
              <div className="flex items-center gap-2 text-gray-400">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold">3</div>
                <span>Questions</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Define Your Metrics</h1>
            <p className="text-gray-600">Create 3-5 personality dimensions to measure</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personality Metrics</CardTitle>
              <CardDescription>
                These are the scales you&apos;ll use to measure personality traits (e.g., Openness, Extraversion, Creativity)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {metrics.map((metric, index) => (
                <div key={metric.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">Metric {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMetric(metric.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <Input
                        placeholder="e.g., Extraversion"
                        value={metric.name}
                        onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Input
                        placeholder="What this measures..."
                        value={metric.description}
                        onChange={(e) => updateMetric(metric.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Low End Label</label>
                      <Input
                        placeholder="e.g., Introverted"
                        value={metric.minLabel}
                        onChange={(e) => updateMetric(metric.id, 'minLabel', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">High End Label</label>
                      <Input
                        placeholder="e.g., Extraverted"
                        value={metric.maxLabel}
                        onChange={(e) => updateMetric(metric.id, 'maxLabel', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={addMetric}
                variant="outline"
                className="w-full"
                disabled={metrics.length >= 8}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Metric
              </Button>
            </CardContent>
          </Card>

          {metrics.length < 3 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ You need at least 3 metrics to continue. We recommend 3-5 for best results.
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Link href="/create">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button
              onClick={saveMetrics}
              disabled={!isValid || isSaving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSaving ? 'Saving...' : 'Continue to Archetypes'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
