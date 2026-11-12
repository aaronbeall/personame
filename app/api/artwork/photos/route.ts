import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiError, currentUser, WorkflowError } from '@/lib/personas'
import { unsplashPhotoSchema } from '@/lib/quiz-artwork'

const photoResponse = z.object({
  id: z.string(),
  urls: z.object({ raw: z.string() }),
  user: z.object({ name: z.string(), links: z.object({ html: z.string() }) }),
  alt_description: z.string().nullish(),
  links: z.object({ download_location: z.string() }),
})

function toPhoto(raw: z.infer<typeof photoResponse>) {
  return unsplashPhotoSchema.parse({
    source: 'unsplash',
    id: raw.id,
    url: raw.urls.raw,
    photographer: raw.user.name,
    profile: raw.user.links.html,
    description: (raw.alt_description ?? '').slice(0, 500),
  })
}

async function unsplash(url: URL) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) throw new WorkflowError('Unsplash photo search is unavailable.', 503)
  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}` },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
    redirect: 'error',
  })
  if (!response.ok) throw new WorkflowError('Unsplash could not complete the request. Try again shortly.', 502)
  return response.json()
}

export async function GET(request: Request) {
  try {
    await currentUser()
    const query = z.string().trim().min(2).max(100).parse(new URL(request.url).searchParams.get('q'))
    const url = new URL('https://api.unsplash.com/search/photos')
    url.search = new URLSearchParams({ query, per_page: '18', content_filter: 'high' }).toString()
    const { results } = z.object({ results: z.array(photoResponse) }).parse(await unsplash(url))
    return NextResponse.json(results.map(toPhoto))
  } catch (error) { return apiError(error) }
}

export async function POST(request: Request) {
  try {
    await currentUser()
    const { id } = z.object({ id: z.string().regex(/^[\w-]{1,80}$/) }).parse(await request.json())
    const photo = photoResponse.parse(await unsplash(new URL(`https://api.unsplash.com/photos/${id}`)))
    const download = new URL(photo.links.download_location)
    if (download.origin !== 'https://api.unsplash.com' || download.pathname !== `/photos/${id}/download`)
      throw new WorkflowError('Unsplash returned an invalid photo reference.', 502)
    await unsplash(download)
    return NextResponse.json(toPhoto(photo))
  } catch (error) { return apiError(error) }
}
