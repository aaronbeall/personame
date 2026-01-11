'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ErrorBanner } from '@/components/ui/error-banner'

export default function CreatePage() {
  const router = useRouter()
  const { status } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const createPersonaMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await fetch('/api/personames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to create persona' }))
        throw new Error(error.error ?? 'Failed to create persona')
      }

      return res.json()
    },
    onSuccess: (persona) => {
      localStorage.removeItem('personame-draft')
      router.push(`/create/${persona.id}/metrics`)
    },
  })

  // Restore draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('personame-draft')
    if (draft) {
      try {
        const { title: savedTitle, description: savedDescription } = JSON.parse(draft)
        if (savedTitle) setTitle(savedTitle)
        if (savedDescription) setDescription(savedDescription)
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

  // Save draft to localStorage whenever title/description changes
  useEffect(() => {
    if (title || description) {
      localStorage.setItem('personame-draft', JSON.stringify({ title, description }))
    }// Clear draft after successful creation
    localStorage.removeItem('personame-draft')

  }, [title, description])

  const handleCreate = async () => {
    if (!title.trim()) return
    // Require authentication before creating a persona
    if (status !== 'authenticated') {
      router.push('/auth/signin?callbackUrl=/create')
      return
    }

    createPersonaMutation.mutate({ title, description })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-primary-900">Create Your Personame</h1>
            <p className="text-muted-700">Start by giving your personality quiz a name and description</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Choose a catchy name that describes what your quiz is about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ErrorBanner error={createPersonaMutation.error} />
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Quiz Title *
                </label>
                <Input
                  id="title"
                  placeholder="e.g., What's Your Personality Type?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe what participants will learn from taking your quiz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={!title.trim() || createPersonaMutation.isPending}
                size="lg"
                className="w-full"
              >
                {createPersonaMutation.isPending ? 'Creating...' : 'Continue to Metrics'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2 text-primary-900">💡 What&apos;s next?</h3>
            <p className="text-sm text-primary-800">
              After naming your quiz, you&apos;ll define the personality metrics (like &quot;Extraversion&quot; or &quot;Creativity&quot;),
              create archetypes (personality types), and build questions that measure these traits.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
