import './home-motion.css'
import { HomeMotion } from '@/components/home-motion'
import { HomeClosingCta } from '@/components/home-closing-cta'
import { DiscoverQuizzes } from '@/components/discover-quizzes'
import { Button } from '@/components/ui/button'
import { QuizCreationWalkthrough } from '@/components/quiz-creation-walkthrough'
import { Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  return (
    <HomeMotion>
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
            <div className="home-hero-copy text-center max-w-3xl mx-auto px-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                Make a personality quiz that’s full of you.
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-lg">
                Your questions. Your wonderfully specific personality types. Create a quiz
                for your people and give them a little “that’s so me” moment.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/create">
                  <Button size="lg" className="rounded-full bg-linear-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create a quiz
                  </Button>
                </Link>
                <Link href="#explore">
                  <Button size="lg" variant="outline" className="rounded-full bg-white/90 hover:bg-white border-2 shadow-lg">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Explore quizzes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-content container mx-auto px-4">

        <QuizCreationWalkthrough />

        {/* Editorial shelves of published quizzes. */}
        <div className="mb-20"><DiscoverQuizzes /></div>

        <HomeClosingCta />
      </div>
    </HomeMotion>
  )
}
