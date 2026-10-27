import { DiscoverQuizzes } from '@/components/discover-quizzes'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, TrendingUp, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="relative h-[600px] w-full">
          <Image
            src="/images/scene1.png"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-3xl mx-auto px-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                Create Your Own Personality Quiz, or Whatever
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-lg">
                Design custom personality assessments with your own dimensions and archetypes.
                Share them with the world and discover insights about your audience.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/create">
                  <Button size="lg" className="rounded-full bg-linear-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Creating
                  </Button>
                </Link>
                <Link href="#explore">
                  <Button size="lg" variant="outline" className="rounded-full bg-white/90 hover:bg-white border-2 shadow-lg">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Explore Quizzes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border-2 border-primary-200 bg-primary-50/70 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle className="text-primary-900 drop-shadow-sm">Custom Dimensions</CardTitle>
              <CardDescription className="text-primary-800 drop-shadow-sm">
                Define your own personality dimensions and scales to measure what matters to you
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-secondary-200 bg-secondary-50/70 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <CardTitle className="text-secondary-900 drop-shadow-sm">Rich Archetypes</CardTitle>
              <CardDescription className="text-secondary-800 drop-shadow-sm">
                Create compelling personality types with emojis, colors, and detailed descriptions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-accent-200 bg-accent-50/70 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent-600" />
              </div>
              <CardTitle className="text-accent-900 drop-shadow-sm">Deep Insights</CardTitle>
              <CardDescription className="text-accent-800 drop-shadow-sm">
                Give participants a thoughtful archetype result with a visual breakdown of their personality dimensions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Live published quizzes, in place of the old sample listings. */}
        <div className="mb-20"><DiscoverQuizzes /></div>

        {/* CTA */}
        <div className="text-center bg-linear-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to create your first Personame?</h2>
          <p className="text-xl mb-8 opacity-90">
            Turn your curiosity into a personality quiz worth sharing
          </p>
          <Link href="/create">
            <Button size="lg" variant="secondary" className="rounded-full">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
