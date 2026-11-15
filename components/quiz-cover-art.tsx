import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'
import { getColorTheme } from '@/lib/colors'
import { artworkSrc, type Artwork } from '@/lib/quiz-artwork'
import type { QuizBooklet } from '@/lib/quiz-presentation'
import { QuizCoverMark } from './quiz-cover-mark'

/** Shared illustrated book presentation for quiz shelves and previews. */
export function QuizCoverArt({ emoji, color, art = 'islands', artwork, booklet, children }: {
  emoji?: string | null; color?: string | null; art?: string; artwork?: Artwork | null; booklet?: QuizBooklet; children?: ReactNode
}) {
  const theme = getColorTheme(color || '#8b5cf6')
  return <div className="shelf-quiz-art" aria-hidden="true" style={{ '--shelf-color': theme.hex, '--shelf-accent': theme.colors.at(-1) } as CSSProperties}>
    <Image
      src={artwork ? artworkSrc(artwork, 640) : `/images/decor/${art}.webp`}
      unoptimized={artwork?.asset.source === 'unsplash'}
      fill
      sizes="(max-width: 600px) 100vw, 280px"
      alt=""
      className={artwork ? 'shelf-quiz-image' : 'shelf-quiz-scene'}
    />
    <span className="shelf-quiz-category">Personality quiz</span>
    <QuizCoverMark emoji={emoji} color={color} booklet={booklet} />
    {children}
  </div>
}
