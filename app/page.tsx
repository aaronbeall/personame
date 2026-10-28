import './home-motion.css'
import { HomeMotion } from '@/components/home-motion'
import { HomeClosingCta } from '@/components/home-closing-cta'
import { DiscoverQuizzes } from '@/components/discover-quizzes'
import { ExploreLink } from '@/components/explore-link'
import { QuizCreationWalkthrough } from '@/components/quiz-creation-walkthrough'
import { CreateQuizLink } from '@/components/create-quiz-link'
import { ArtActionIcon } from '@/components/art-action-icon'
import Image from 'next/image'

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
                Your questions. Your wonderfully specific personality types.
                Create a quiz for your people and give them a little “that’s so
                me” moment.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <CreateQuizLink className="hero-cta hero-cta-primary">
                  Create a quiz
                </CreateQuizLink>
                <ExploreLink className="hero-cta hero-cta-secondary">
                  <ArtActionIcon kind="explore" />
                  Explore quizzes
                </ExploreLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-content container mx-auto px-4">
        <QuizCreationWalkthrough />

        {/* Editorial shelves of published quizzes. */}
        <div className="mb-20">
          <DiscoverQuizzes />
        </div>

        <HomeClosingCta />
      </div>
    </HomeMotion>
  )
}
