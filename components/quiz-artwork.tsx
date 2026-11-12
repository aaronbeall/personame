'use client'

import Image from 'next/image'
import { artworkSrc, unsplashCredit, type Artwork } from '@/lib/quiz-artwork'

export function ArtworkImage({ artwork, width = 960, decorative = false }: {
  artwork: Artwork
  width?: number
  decorative?: boolean
}) {
  const src = artworkSrc(artwork, width)
  return <Image
    key={src}
    unoptimized
    src={src}
    width={width}
    height={Math.round(width * .66)}
    alt={decorative ? '' : artwork.alt}
    className="authored-artwork-image"
    onError={event => { event.currentTarget.hidden = true }}
  />
}

export function ArtworkCredit({ artwork }: { artwork: Artwork }) {
  if (artwork.asset.source !== 'unsplash') return null
  return <small className="artwork-credit">
    Photo by <a href={unsplashCredit(artwork.asset.profile)} target="_blank" rel="noreferrer">{artwork.asset.photographer}</a>
    {' on '}<a href={unsplashCredit('https://unsplash.com')} target="_blank" rel="noreferrer">Unsplash</a>
  </small>
}

export function QuizBackground({ artwork }: { artwork: Artwork }) {
  return <div className="player-quiz-background" aria-hidden="true">
    <ArtworkImage artwork={artwork} width={1440} decorative />
  </div>
}

export function ItemBackground({ artwork }: { artwork?: Artwork | null }) {
  return artwork ? <span className="item-style-background">
    <ArtworkImage artwork={artwork} width={640} />
  </span> : null
}

export function QuizArtwork({ artwork, className, width }: {
  artwork: Artwork | null | undefined
  className?: string
  width?: number
}) {
  if (!artwork) return null
  return <figure className={className}>
    <ArtworkImage artwork={artwork} width={width} />
    <ArtworkCredit artwork={artwork} />
  </figure>
}
