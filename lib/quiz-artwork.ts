import { z } from 'zod'

export const curatedArtwork = {
  islands: 'Floating islands',
  party: 'Celebration',
  science: 'Curious laboratory',
  creation: 'Creative world',
  'tree-house': 'Tree house',
  'pirate-ship': 'Pirate ship',
  'galaxy-expansion': 'Galaxy',
  explorer: 'Explorer',
  scholar: 'Scholar',
  caregiver: 'Caregiver',
  rebel: 'Rebel',
  dreamer: 'Dreamer',
  inventor: 'Inventor',
} as const

const portraits = new Set(['explorer', 'scholar', 'caregiver', 'rebel', 'dreamer', 'inventor'])
export const curatedBackgrounds = (Object.keys(curatedArtwork) as (keyof typeof curatedArtwork)[])
  .filter(id => !portraits.has(id))
export function curatedArtworkSrc(id: keyof typeof curatedArtwork) {
  return `/images/${portraits.has(id) ? 'personas' : 'decor'}/${id}.webp`
}

function httpsUrl(host: string) {
  return z.url().max(1500).refine(value => URL.canParse(value) && new URL(value).origin === `https://${host}`)
}

export const unsplashPhotoSchema = z.object({
  source: z.literal('unsplash'),
  id: z.string().regex(/^[\w-]{1,80}$/),
  url: httpsUrl('images.unsplash.com'),
  photographer: z.string().min(1).max(200),
  profile: httpsUrl('unsplash.com'),
  description: z.string().max(500),
})

export const artworkSchema = z.object({
  asset: z.discriminatedUnion('source', [
    z.object({ source: z.literal('curated'), id: z.enum(Object.keys(curatedArtwork) as [keyof typeof curatedArtwork, ...(keyof typeof curatedArtwork)[]]) }),
    unsplashPhotoSchema,
  ]),
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(100).default(50),
  alt: z.string().max(500).default(''),
})
export type Artwork = z.infer<typeof artworkSchema>
export type UnsplashPhoto = z.infer<typeof unsplashPhotoSchema>

const prefix = 'artwork:'

// Question and answer styles and archetype image references are stored as strings.
export function encodeArtwork(artwork: Artwork | null) {
  return artwork ? prefix + JSON.stringify(artwork) : null
}

export function readArtwork(value: unknown): Artwork | null {
  if (typeof value === 'string') {
    if (!value.startsWith(prefix) || value.length > 5000) return null
    try { value = JSON.parse(value.slice(prefix.length)) } catch { return null }
  }
  const parsed = artworkSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export function artworkSrc(artwork: Artwork, width: number) {
  if (artwork.asset.source === 'curated') return curatedArtworkSrc(artwork.asset.id)
  const url = new URL(artwork.asset.url)
  url.searchParams.set('w', String(width))
  url.searchParams.set('auto', 'format')
  return url.href
}

export function unsplashCredit(url: string) {
  const link = new URL(url)
  link.searchParams.set('utm_source', 'personame')
  link.searchParams.set('utm_medium', 'referral')
  return link.href
}
