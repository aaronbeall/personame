'use client'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { LoadingState } from './ui/loading'
import { Check } from 'lucide-react'
import { AppLayoutBackground } from './app-layout-background'
import { PageIntro } from './page-intro'
import { StepProgress } from './step-progress'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { ErrorBanner } from './ui/error-banner'
import { EntityIcon, type EntityKind } from './entity-icon'
import { QuizCoverMark } from './quiz-cover-mark'
import { StyleEditors } from './style-editors'
import { BuilderSaveActions } from './builder-save-actions'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { useBuilderDraft } from '@/hooks/use-builder-draft'
import { requestJson } from '@/lib/client-api'
import { COLOR_THEME, getColorTheme } from '@/lib/colors'

type Details = {
  title: string
  description: string
  emoji: string | null
  color: string
}
const empty: Details = {
  title: '',
  description: '',
  emoji: null,
  color: '#8b5cf6',
}
const starterEmojis = [
  '✨',
  '🧠',
  '🌈',
  '🦋',
  '🪄',
  '🌻',
  '🚀',
  '🦊',
  '🐙',
  '🍄',
  '🎨',
  '🪐',
]

export function NameStep({ quizId }: { quizId?: string }) {
  const auth = useProtectedPage()
  const router = useRouter(),
    cache = useQueryClient()
  const [local, setLocal] = useState<Details>()
  const [savingAdvance, setSavingAdvance] = useState(false)
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<Error | null>(null),
    [message, setMessage] = useState('')
  const query = useQuery({
    queryKey: ['quiz-details', quizId],
    enabled: !!quizId && auth === 'authenticated',
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const q = await requestJson<Details>(`/api/personames/${quizId}`)
      return {
        title: q.title,
        description: q.description || '',
        emoji: q.emoji || null,
        color: getColorTheme(q.color || '#8b5cf6').hex,
      }
    },
  })
  useEffect(() => {
    if (quizId) return
    const initial: Details = {
      ...empty,
      emoji: starterEmojis[Math.floor(Math.random() * starterEmojis.length)],
      color: COLOR_THEME[Math.floor(Math.random() * COLOR_THEME.length)].hex,
    }
    // Discard the former autosaved naming draft. New means new; saved quizzes live in the dashboard.
    try {
      localStorage.removeItem('personame-draft')
    } catch {}
    setLocal(initial)
  }, [quizId])
  const draft = useBuilderDraft(
    quizId ? query.data : local,
    quizId || 'new-quiz',
  )
  const values = draft.value || empty
  function update(next: Partial<Details>) {
    draft.update({ ...values, ...next })
    setMessage('')
    setError(null)
  }
  async function save(advance: boolean) {
    if (!values.title.trim() || busy) return
    if (quizId && !draft.dirty) {
      if (advance) router.push(`/create/${quizId}/dimensions`)
      return
    }
    setSavingAdvance(advance)
    setBusy(true)
    setError(null)
    setMessage('')
    try {
      const saved = await requestJson<Details & { id: string }>(
        quizId ? `/api/personames/${quizId}` : '/api/personames',
        {
          method: quizId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      )
      const canonical = {
        title: saved.title,
        description: saved.description || '',
        emoji: saved.emoji || null,
        color: getColorTheme(saved.color).hex,
      }
      draft.accept(canonical)
      cache.setQueryData(['quiz-details', saved.id], canonical)
      cache.invalidateQueries({ queryKey: ['review', saved.id] })
      cache.invalidateQueries({ queryKey: ['dashboard'] })
      if (advance) router.push(`/create/${saved.id}/dimensions`)
      else if (!quizId) router.replace(`/create/${saved.id}/name`)
      else setMessage('Saved. Your changes are in the draft.')
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error('Unable to save. Please try again.'),
      )
    } finally {
      setBusy(false)
    }
  }
  function reset() {
    if (quizId) draft.reset()
    else
      draft.accept({
        ...empty,
        emoji: local?.emoji ?? null,
        color: local?.color ?? '#8b5cf6',
      })
    setMessage('')
    setError(null)
  }
  if (!draft.ready && !query.error)
    return (
      <AppLayoutBackground>
        <div className="create-setup">
          <LoadingState label="Preparing your quiz details…" />
        </div>
      </AppLayoutBackground>
    )

  return (
    <AppLayoutBackground>
      <div className="create-setup">
        {quizId ? (
          <StepProgress
            steps={[]}
            title="What’s your quiz about?"
            description="Give your quiz a name and a look that feels like you."
          />
        ) : (
          <PageIntro
            title="What’s your quiz about?"
            description="Give your quiz a name. Turn that spark into personality types, thoughtful questions, and delightful discoveries."
            art="creation"
            eyebrow="A new idea"
          />
        )}
        <form
          className="quiz-setup-form"
          aria-label="New quiz details"
          onSubmit={(e) => {
            e.preventDefault()
            save(true)
          }}
        >
          <fieldset
            disabled={busy || !draft.ready}
            className="name-step-fields"
          >
            <div className="name-style-column">
              <StyleEditors
                emoji={values.emoji}
                color={values.color}
                onEmojiChange={(emoji) => update({ emoji })}
                onColorChange={(color) => update({ color })}
              >
                <QuizCoverMark emoji={values.emoji} color={values.color} />
              </StyleEditors>
            </div>
            <div className="quiz-setup-fields">
              <ErrorBanner error={error || query.error} />
              <div className="quiz-setup-field">
                <label htmlFor="title">Quiz title</label>
                <Input
                  id="title"
                  placeholder="e.g., What kind of weekend wanderer are you?"
                  value={values.title}
                  onChange={(e) => update({ title: e.target.value })}
                  maxLength={200}
                  required
                  aria-describedby="title-hint"
                />
                <p id="title-hint">
                  The first thing people see when they discover your quiz.
                </p>
              </div>
              <div className="quiz-setup-field">
                <label htmlFor="description">
                  Description <span className="field-optional">(optional)</span>
                </label>
                <Textarea
                  id="description"
                  placeholder="A little taste of what they’ll discover…"
                  value={values.description}
                  onChange={(e) => update({ description: e.target.value })}
                  maxLength={2000}
                  rows={3}
                  aria-describedby="description-hint"
                />
                <p id="description-hint">Set the mood in a sentence or two.</p>
              </div>
            </div>
          </fieldset>
          <div className="quiz-setup-footer name-step-footer">
            <p role="status">
              <Check size={15} />
              {message ||
                'Next: Dimensions. You can change these details later.'}
            </p>
            <BuilderSaveActions
              dirty={
                draft.dirty ||
                (!quizId && (!!values.title || !!values.description))
              }
              valid={draft.ready && !!values.title.trim()}
              validationMessages={
                draft.ready && !values.title.trim()
                  ? ['Enter a quiz name to continue.']
                  : []
              }
              busy={busy}
              busyAction={savingAdvance ? 'continue' : 'save'}
              onReset={reset}
              onSave={save}
            />
          </div>
        </form>
        {!quizId && (
          <nav className="quiz-setup-progress" aria-label="Quiz setup progress">
            <ol>
              {[
                'Name',
                'Dimensions',
                'Archetypes',
                'Questions',
                'Preview & publish',
              ].map((step, i) => (
                <li key={step} aria-current={i === 0 ? 'step' : undefined}>
                  <span className="quiz-setup-step-number">{i + 1}</span>
                  <span className="setup-step-text">
                    {i < 3 && (
                      <EntityIcon
                        kind={
                          (['quiz', 'dimension', 'archetype'] as EntityKind[])[
                            i
                          ]
                        }
                        size={13}
                      />
                    )}{' '}
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </AppLayoutBackground>
  )
}
