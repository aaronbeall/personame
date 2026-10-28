import type { Metadata } from 'next'
import '../home-motion.css'
import { HomeMotion } from '@/components/home-motion'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { PageIntro } from '@/components/page-intro'
import { DiscoverQuizzes } from '@/components/discover-quizzes'

export const metadata: Metadata = {
  title: 'Explore quizzes | Personame',
  description:
    'Follow your curiosity. Explore personality quizzes and discover another side of yourself.',
}

export default function Explore() {
  return (
    <HomeMotion>
      <AppLayoutBackground className="explore-page">
        <PageIntro
          title="Who will you discover next?"
          description="A familiar feeling. An unexpected side. Find a quiz that speaks to your wonderfully particular self."
          eyebrow="Explore quizzes"
          art="galaxy-expansion"
        />
        <DiscoverQuizzes variant="page" />
      </AppLayoutBackground>
    </HomeMotion>
  )
}
