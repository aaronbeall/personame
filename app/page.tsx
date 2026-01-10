import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, TrendingUp, Clock, Users } from 'lucide-react'

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-600 bg-clip-text text-transparent">
            Create Personality Quizzes That Matter
          </h1>
          <p className="text-xl text-muted-700 mb-8 max-w-2xl mx-auto">
            Design custom personality assessments with powerful metrics and archetypes.
            Share them with the world and discover insights about your audience.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/create">
              <Button size="lg">
                Start Creating
              </Button>
            </Link>
            <Link href="#explore">
              <Button size="lg" variant="outline">
                Explore Quizzes
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border-2 border-primary-200 bg-primary-50/70 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle className="text-primary-900">Custom Metrics</CardTitle>
              <CardDescription className="text-primary-800">
                Define your own personality dimensions and scales to measure what matters to you
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-secondary-200 bg-secondary-50/70 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <CardTitle className="text-secondary-900">Rich Archetypes</CardTitle>
              <CardDescription className="text-secondary-800">
                Create compelling personality types with emojis, colors, and detailed descriptions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-accent-200 bg-accent-50/70 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent-600" />
              </div>
              <CardTitle className="text-accent-900">Deep Insights</CardTitle>
              <CardDescription className="text-accent-800">
                Track anonymous analytics and see how participants score across your metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Trending Quizzes */}
        <div id="explore" className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary-900">Trending Personames</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
              <Button variant="ghost" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Recent
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards - will be populated from API */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎭</span>
                  <span className="text-sm text-muted-600">Big Five Personality</span>
                </div>
                <CardTitle>Which personality type are you?</CardTitle>
                <CardDescription>
                  Discover your scores across the five major personality dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-600">
                  <span>1.2k completions</span>
                  <span>5 archetypes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧠</span>
                  <span className="text-sm text-muted-600">Learning Styles</span>
                </div>
                <CardTitle>How do you learn best?</CardTitle>
                <CardDescription>
                  Identify your optimal learning strategies and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-600">
                  <span>856 completions</span>
                  <span>4 archetypes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💼</span>
                  <span className="text-sm text-muted-600">Work Personality</span>
                </div>
                <CardTitle>What's your work style?</CardTitle>
                <CardDescription>
                  Understand your professional strengths and collaboration preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-600">
                  <span>632 completions</span>
                  <span>6 archetypes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to create your first Personame?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators building engaging personality quizzes
          </p>
          <Link href="/create">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-600">
          <p>&copy; 2026 Personame. Built with ❤️ and 🍌 by <a href="https://metamodernmonkey.com" target="_blank" rel="noopener noreferrer">MetaModernMonkey</a></p>
        </div>
      </footer>
    </div>
  )
}
