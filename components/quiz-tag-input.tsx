'use client'

import { useId, useState } from 'react'
import { X } from 'lucide-react'
import { maxQuizTagLength, maxQuizTags, normalizeQuizTag } from '@/lib/quiz-tags'

export function QuizTagInput({ tags, onChange, disabled }: {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
}) {
  const id = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const full = tags.length >= maxQuizTags
  function add(raw: string) {
    const additions = [...new Set(raw.split(',').map(normalizeQuizTag))]
      .filter(tag => tag && !tags.includes(tag))
    if (additions.some(tag => tag.length > maxQuizTagLength)) {
      setError(`Tags can be up to ${maxQuizTagLength} characters.`)
      return
    }
    if (tags.length + additions.length > maxQuizTags) {
      setError(`A quiz can have up to ${maxQuizTags} tags.`)
      return
    }
    if (additions.length) onChange([...tags, ...additions])
    setValue('')
    setError('')
  }
  return <div className="quiz-tag-editor">
    <label htmlFor={id}>Tags</label>
    <div className="quiz-tag-entry">
      {tags.map(tag => <span className="quiz-tag-chip" key={tag}>{tag}<button type="button" disabled={disabled} aria-label={`Remove tag ${tag}`}
        onClick={() => { setError(''); onChange(tags.filter(item => item !== tag)) }}><X size={13} /></button></span>)}
      <input id={id} value={value} disabled={disabled || full} placeholder="Add a tag"
        aria-describedby={`${id}-hint`} onChange={event => { setValue(event.target.value); setError('') }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing || (event.key !== 'Enter' && event.key !== ',')) return
          event.preventDefault()
          add(value)
        }} />
    </div>
    <p id={`${id}-hint`}>{full ? `All ${maxQuizTags} tags added.` : 'Press Enter or use a comma to add a tag.'}</p>
    {error && <p role="alert">{error}</p>}
  </div>
}
