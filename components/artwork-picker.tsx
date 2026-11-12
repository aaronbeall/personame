'use client'

import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ImageIcon, ImagePlus } from 'lucide-react'
import { ArtworkCredit, ArtworkImage } from './quiz-artwork'
import { Button } from './ui/button'
import { curatedArtwork, curatedBackgrounds, type Artwork, type UnsplashPhoto } from '@/lib/quiz-artwork'
import { requestJson } from '@/lib/client-api'

function selection(asset: Artwork['asset']): Artwork {
  return { asset, x: 50, y: 50, alt: asset.source === 'unsplash' ? asset.description : '' }
}

const artworkTabs = [
  ['current', 'Current'],
  ['curated', 'Personame art'],
  ['unsplash', 'Unsplash photos'],
] as const

export function ArtworkPicker({ label, value, onChange }: {
  label: string
  value: Artwork | null
  onChange: (value: Artwork | null) => void
}) {
  const [source, setSource] = useState<(typeof artworkTabs)[number][0]>('curated')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UnsplashPhoto[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function select(asset: Artwork['asset']) {
    onChange(selection(asset))
    setSource('current')
  }

  async function search() {
    setBusy(true)
    setError('')
    setResults(null)
    try {
      setResults(await requestJson<UnsplashPhoto[]>(`/api/artwork/photos?q=${encodeURIComponent(query.trim())}`))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not search photos.')
    } finally { setBusy(false) }
  }

  async function choosePhoto(id: string) {
    setBusy(true)
    setError('')
    try {
      const photo = await requestJson<UnsplashPhoto>('/api/artwork/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      select(photo)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not select the photo.')
    } finally { setBusy(false) }
  }

  return <Popover.Root onOpenChange={open => { if (open) setSource(value ? 'current' : 'curated') }}>
    <Popover.Trigger asChild>
      <Button type="button" variant="outline" size="sm" className="artwork-picker-trigger"
        aria-label={label} title={value ? `Change ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}
        data-selected={!!value}
      >
        {value ? <>
          <ArtworkImage artwork={value} width={160} decorative />
          <span className="artwork-picker-replace" aria-hidden="true"><ImagePlus size={12} /></span>
        </> : <ImageIcon size={19} aria-hidden="true" />}
      </Button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content sideOffset={8} align="start" className="artwork-picker" aria-label={label}>
        <div className="artwork-picker-tabs" role="group" aria-label="Image picker views">
          {artworkTabs.map(([tab, name]) => (
            <Button key={tab} type="button" size="sm" variant={source === tab ? 'default' : 'ghost'} aria-pressed={source === tab} onClick={() => setSource(tab)}>{name}</Button>
          ))}
        </div>
        {source === 'current' && (value ? <div className="artwork-picker-selection">
          <ArtworkImage artwork={value} width={480} />
          <ArtworkCredit artwork={value} />
          <label>Image description<input value={value.alt} maxLength={500} onChange={event => onChange({ ...value, alt: event.target.value })} /></label>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>Remove image</Button>
        </div> : <p className="muted">No image selected.</p>)}
        {source === 'unsplash' && <div className="artwork-picker-search">
          <input aria-label="Search Unsplash photos" placeholder="Search photos" value={query} maxLength={100}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              if (!busy && query.trim().length >= 2) void search()
            }}
          />
          <Button type="button" size="sm" disabled={busy || query.trim().length < 2} onClick={search}>Search</Button>
        </div>}
        {source === 'unsplash' && busy && <p role="status">Loading photos…</p>}
        {source === 'unsplash' && error && <p role="alert">{error}</p>}
        {source === 'unsplash' && results?.length === 0 && <p>No matching photos.</p>}
        {source !== 'current' && <div className="artwork-picker-grid">
          {source === 'curated'
            ? curatedBackgrounds.map(id => (
              <button key={id} type="button" onClick={() => select({ source: 'curated', id })}>
                <ArtworkImage artwork={selection({ source: 'curated', id })} width={240} decorative />
                {curatedArtwork[id]}
              </button>
            ))
            : results?.map(photo => (
              <div key={photo.id}>
                <button type="button" disabled={busy} onClick={() => choosePhoto(photo.id)}>
                  <ArtworkImage artwork={selection(photo)} width={240} />
                  Select photo
                </button>
                <ArtworkCredit artwork={selection(photo)} />
              </div>
            ))}
        </div>}
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
}
