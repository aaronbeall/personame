'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight, Check, Copy, Sparkles } from 'lucide-react'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { PageIntro } from '@/components/page-intro'
import { LoadingState } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EntityIcon } from '@/components/entity-icon'
import { QuizCoverMark } from '@/components/quiz-cover-mark'
import { StyleEditors } from '@/components/style-editors'
import { AddItemButton } from '@/components/add-item-button'
import { BuilderFooter } from '@/components/builder-footer'
import { QuestionInput, type PlayerQuestion } from '@/components/question-input'
import type { ResponseValue } from '@/lib/quiz-scoring'
import {
  ArchetypeBadge,
  DimensionTag,
  DimensionSymbol,
} from '@/components/entity-identity'

const palette = [
  ['action', 'Next step', 'Primary actions'],
  ['ink-strong', 'Deep indigo', 'Page titles'],
  ['ink', 'Warm ink', 'Essential text'],
  ['text-secondary', 'Supporting ink', 'Descriptions'],
  ['text-muted', 'Quiet ink', 'Helper text'],
  ['canvas', 'Lavender canvas', 'Page atmosphere'],
  ['surface', 'Working white', 'Forms and panels'],
  ['field', 'Soft field', 'Editable controls'],
  ['header', 'Illustrated base', 'Behind card texture'],
  ['border', 'Quiet boundary', 'Panel borders'],
  ['positive', 'Ready', 'Positive states'],
  ['negative', 'Needs attention', 'Errors'],
] as const
const artwork = [
  ['creation', 'A new idea', 'Setup and questions'],
  ['science', 'Curiosity at work', 'Dimensions and quiz-taking'],
  ['tree-house', 'Room to grow', 'Dashboard and archetypes'],
  ['galaxy-expansion', 'Out into the world', 'Review and publishing'],
  ['party', 'A little celebration', 'Results'],
  ['islands', 'A warm welcome', 'Sign-in and covers'],
] as const
const sections = [
  'Principles',
  'Foundations',
  'Artwork',
  'Components',
  'Patterns',
]

export function DesignReference() {
  const [feedback, setFeedback] = useState('')
  const [title, setTitle] = useState('What kind of weekend wanderer are you?')
  const [description, setDescription] = useState(
    'A tiny adventure, a scenic detour, or a very good nap.',
  )
  const [emoji, setEmoji] = useState<string | null>('🌱')
  const [color, setColor] = useState('green')
  const [records, setRecords] = useState(0)
  const [questionType, setQuestionType] =
    useState<PlayerQuestion['type']>('MULTIPLE_CHOICE')
  const [responses, setResponses] = useState<
    Partial<Record<PlayerQuestion['type'], ResponseValue>>
  >({})
  const [copied, setCopied] = useState('')
  const choices =
    questionType === 'SCALE'
      ? ['Stay close', 'Go far', '1', '2', '3', '4', '5']
      : ['A familiar favorite', 'Somewhere entirely new']
  const question: PlayerQuestion = {
    id: 'reference-question',
    text: 'Where would your curiosity take you?',
    type: questionType,
    required: true,
    emoji: null,
    answers: choices.map((text, i) => ({
      id: `example-${i}`,
      text,
      emoji: null,
    })),
  }
  return (
    <AppLayoutBackground className="design-workspace">
      <div className="design-reference">
        <PageIntro
          title="Curiosity, with a little polish."
          description="The Personame brand and design system. Expressive little worlds, paired with a clear and thoughtful interface."
          eyebrow="Our shared design language"
          art="creation"
        />
        <nav
          className="design-reference-nav"
          aria-label="Design reference sections"
        >
          {sections.map((section) => (
            <a key={section} href={`#${section.toLowerCase()}`}>
              {section}
            </a>
          ))}
        </nav>

        <section id="principles" className="design-section">
          <div className="design-section-heading">
            <p className="eyebrow">01 / Point of view</p>
            <h2>A delightful moment of recognition.</h2>
            <p className="muted">
              Help people make something wonderfully specific, then make every
              next step feel obvious.
            </p>
          </div>
          <div className="design-three-up">
            {[
              [
                'Curious, not clinical',
                'Invite discovery. A personality result reflects someone’s answers; it does not define who they are.',
              ],
              [
                'Expressive art, composed UI',
                'Let the illustrations bring the surprise. Let the controls bring clarity, consistency, and trust.',
              ],
              [
                'One clear next step',
                'Introduce the task once. Keep help close to the decision and give the main action room to stand out.',
              ],
            ].map(([heading, text]) => (
              <article className="surface" key={heading}>
                <h3>{heading}</h3>
                <p className="muted">{text}</p>
              </article>
            ))}
          </div>
          <div className="surface design-voice">
            <div>
              <p className="eyebrow">Voice in practice</p>
              <h3>“What’s your quiz about?”</h3>
              <p className="muted">
                Warm and inviting in the introduction. Direct and specific in
                the controls.
              </p>
            </div>
            <div className="design-copy-examples">
              <span>
                Continue to Dimensions <ArrowRight size={14} aria-hidden="true" />
              </span>
              <span>Set the mood in a sentence or two.</span>
              <span>We couldn’t save your changes. Please try again.</span>
            </div>
          </div>
        </section>

        <section id="foundations" className="design-section">
          <div className="design-section-heading">
            <p className="eyebrow">02 / Foundations</p>
            <h2>Soft surroundings. Clear decisions.</h2>
            <p className="muted">
              Semantic colors follow their purpose. Select a swatch to copy its
              current computed value.
            </p>
          </div>
          <div className="design-palette">
            {palette.map(([token, name, usage]) => (
              <button
                key={token}
                className="design-swatch"
                aria-label={`Copy ${name} color`}
                onClick={async () => {
                  const value = getComputedStyle(document.documentElement)
                    .getPropertyValue(`--pn-${token}`)
                    .trim()
                  try {
                    await navigator.clipboard.writeText(value)
                    setCopied(token)
                    setFeedback(`${name}: copied ${value}.`)
                  } catch {
                    setFeedback(`${name}: ${value}. Copy this value manually.`)
                  }
                }}
              >
                <span
                  className="design-swatch-color"
                  style={{ background: `var(--pn-${token})` }}
                />
                <span className="design-swatch-name">
                  {name}
                  {copied === token ? <Check size={13} /> : <Copy size={12} />}
                </span>
                <small>{usage}</small>
                <code>--pn-{token}</code>
              </button>
            ))}
          </div>
          <div className="design-two-up">
            <article className="surface design-type">
              <p className="eyebrow">Typography / Inter</p>
              <h3 className="design-type-title">A little curiosity.</h3>
              <p className="design-type-section">A lot of personality.</p>
              <p className="muted">
                Use a short, confident heading, a comfortable reading rhythm,
                and clear labels. The illustration supplies the expressive
                contrast.
              </p>
              <div className="design-spec-row">
                <span>
                  Page title <b>28–36 / 700</b>
                </span>
                <span>
                  Section <b>19–20 / 600</b>
                </span>
                <span>
                  Body <b>14–16 / 400</b>
                </span>
                <span>
                  Label <b>14 / 600</b>
                </span>
              </div>
            </article>
            <article className="surface">
              <p className="eyebrow">Space & shape</p>
              <h3>A consistent rhythm.</h3>
              <div className="design-spacing">
                {[1, 2, 3, 4, 6, 8, 12].map((unit) => (
                  <div key={unit}>
                    <span style={{ width: `var(--pn-space-${unit})` }} />
                    <code>{unit * 4}px</code>
                  </div>
                ))}
              </div>
              <div className="design-spec-row">
                <span>
                  Control <b>10px radius</b>
                </span>
                <span>
                  Record <b>14px radius</b>
                </span>
                <span>
                  Panel <b>18px radius</b>
                </span>
              </div>
            </article>
          </div>
        </section>

        <section id="artwork" className="design-section">
          <div className="design-section-heading">
            <p className="eyebrow">03 / Illustration & identity</p>
            <h2>Keep the wonderfully peculiar.</h2>
            <p className="muted">
              Use transparent artwork as a silhouette that can escape the
              header. Fade the fine background texture toward the title.
            </p>
          </div>
          <div className="surface design-logo">
            <Image
              src="/logo.png"
              alt="Personame symbol"
              width={54}
              height={54}
            />
            <div>
              <strong>Personame</strong>
              <p className="muted">
                One word. Capital P. Keep its proportions and give it room to
                breathe.
              </p>
            </div>
          </div>
          <div className="design-art-grid">
            {artwork.map(([key, title, usage]) => (
              <figure className="design-art-card" key={key}>
                <div>
                  <Image
                    src={`/images/decor/${key}.webp`}
                    width={300}
                    height={240}
                    alt=""
                  />
                </div>
                <figcaption>
                  <strong>{title}</strong>
                  <span>{usage}</span>
                  <code>{key}.webp</code>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          className="design-section"
          aria-labelledby="entity-language-title"
        >
          <div className="design-section-heading">
            <p className="eyebrow">Three layers of personality</p>
            <h2 id="entity-language-title">
              Covers, instruments, and characters.
            </h2>
            <p className="muted">
              Dimensions measure. Archetypes embody. Their shapes make the
              difference clear.
            </p>
          </div>
          <div className="design-two-up">
            <article className="surface">
              <h3 className="entity-heading">
                <EntityIcon kind="quiz" size={20} />
                Quizzes
              </h3>
              <p className="muted mt-2">
                An authored booklet: paper cover, colored spine, page edges, and
                an editorial label. The container for dimensions and archetypes.
              </p>
              <div className="flex items-center gap-6 mt-6">
                <QuizCoverMark emoji="✨" color="purple" />
                <QuizCoverMark emoji="🌊" color="teal" size="sm" />
              </div>
            </article>
            <article className="surface">
              <h3 className="entity-heading">
                <EntityIcon kind="dimension" size={20} />
                Dimensions
              </h3>
              <p className="muted mt-2">
                Faceted, solid, vibrant, precise. Soft diamond symbols,
                sleek tags, and diamond value markers on crisp scales.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <DimensionSymbol name="Curiosity" emoji="🧠" color="purple" />
                <DimensionTag name="Curiosity" color="purple" />
                <DimensionTag name="Adventure" color="teal" />
              </div>
            </article>
            <article className="surface">
              <h3 className="entity-heading">
                <EntityIcon kind="archetype" size={20} />
                Archetypes
              </h3>
              <p className="muted mt-2">
                Circular, bold, framed, patterned. A distinct color and portrait
                for each personality.
              </p>
              <div className="flex items-center gap-8 mt-8 mb-4">
                <ArchetypeBadge
                  name="The Explorer"
                  emoji="🦊"
                  color="orange"
                  size={80}
                />
                <ArchetypeBadge
                  name="The Dreamer"
                  emoji="🪐"
                  color="purple"
                  size={80}
                />
              </div>
            </article>
          </div>
        </section>

        <section id="components" className="design-section">
          <div className="design-section-heading">
            <p className="eyebrow">04 / Working parts</p>
            <h2>The real components, in miniature.</h2>
            <p className="muted">
              These examples use the same controls as the app. Try their focus,
              selected, disabled, and popover states.
            </p>
          </div>
          <div className="design-two-up">
            <article className="surface">
              <h3>Actions & states</h3>
              <div className="page-actions">
                <Button
                  onClick={() =>
                    setFeedback('Primary action activated in the preview.')
                  }
                >
                  <Sparkles size={15} /> Preview action
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFeedback('Secondary action activated in the preview.')
                  }
                >
                  Secondary
                </Button>
                <Button disabled>Not ready</Button>
                <Button loading>Saving…</Button>
              </div>
              <div className="design-status-row">
                <span className="status-tag">Draft</span>
                <span className="status-tag published">Live</span>
                <span className="status-tag">Closed</span>
              </div>
              <p className="notice">Preview answers are not saved.</p>
              <p className="notice error mt-3" role="note">
                Add a title before continuing.
              </p>
            </article>
            <article className="surface">
              <h3>Icon & color</h3>
              <p className="muted mt-2">
                A small edit button on the portrait opens its icon, color, and
                future image options.
              </p>
              <div className="design-profile-example">
                <div>
                  <StyleEditors
                    emoji={emoji}
                    color={color}
                    onEmojiChange={setEmoji}
                    onColorChange={setColor}
                  >
                    <ArchetypeBadge
                      name="The curious creator"
                      emoji={emoji}
                      color={color}
                      size={80}
                    />
                  </StyleEditors>
                </div>
                <div>
                  <strong>The curious creator</strong>
                  <p className="muted">
                    Personality belongs here. Consistent actions belong
                    everywhere.
                  </p>
                </div>
              </div>
            </article>
          </div>
          <div className="design-two-up">
            <article className="surface">
              <h3>Fields</h3>
              <div className="quiz-setup-field mt-5">
                <label htmlFor="example-title">Quiz title</label>
                <Input
                  id="example-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-describedby="example-title-hint"
                />
                <p id="example-title-hint">
                  A visible label, a helpful hint, and a clear focus state.
                </p>
              </div>
              <div className="quiz-setup-field mt-5">
                <label htmlFor="example-description">
                  Description <span className="field-optional">(optional)</span>
                </label>
                <Textarea
                  id="example-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </article>
            <article className="surface">
              <h3>Question controls</h3>
              <div
                className="design-question-types"
                role="group"
                aria-label="Example question type"
              >
                {(['MULTIPLE_CHOICE', 'SLIDER', 'SCALE'] as const).map(
                  (type, i) => (
                    <Button
                      key={type}
                      variant={questionType === type ? 'default' : 'outline'}
                      aria-pressed={questionType === type}
                      onClick={() => setQuestionType(type)}
                    >
                      {['Choice', 'Slider', 'Scale'][i]}
                    </Button>
                  ),
                )}
              </div>
              <p className="design-example-question">{question.text}</p>
              <QuestionInput
                question={question}
                value={responses[questionType]}
                onChange={(value) =>
                  setResponses({ ...responses, [questionType]: value })
                }
              />
            </article>
          </div>
        </section>

        <div className="mb-10">
          <LoadingState label="Loading preview" variant="cards" />
        </div>

        <section id="patterns" className="design-section">
          <div className="design-section-heading">
            <p className="eyebrow">05 / Put it together</p>
            <h2>Introduce. Create. Continue.</h2>
            <p className="muted">
              A working panel uses one clear action footer. Add controls stay
              compact, with help beside the decision.
            </p>
          </div>
          <div className="design-pattern-panel">
            <div className="design-pattern-content">
              <h3>Your personality profiles</h3>
              <p className="muted">
                {records
                  ? `${records} example ${records === 1 ? 'profile' : 'profiles'} added to this preview.`
                  : 'Give each profile a distinct point of view.'}
              </p>
              {records > 0 && (
                <div className="design-status-row">
                  {Array.from({ length: records }, (_, i) => (
                    <span className="status-tag" key={i}>
                      Profile {i + 1}
                    </span>
                  ))}
                </div>
              )}
              <AddItemButton
                label="Add Archetype"
                description="Create another personality profile."
                disabled={records >= 5}
                onClick={() => {
                  setRecords(records + 1)
                  setFeedback('Example profile added locally.')
                }}
              />
            </div>
            <BuilderFooter
              back={
                <Button
                  variant="outline"
                  onClick={() => {
                    setRecords(0)
                    setFeedback('Example profiles reset.')
                  }}
                >
                  Reset
                </Button>
              }
              note="Example only. Your quizzes stay unchanged."
            >
              <Button
                className="builder-primary-action"
                onClick={() =>
                  setFeedback(
                    records
                      ? 'This example is ready for its next step.'
                      : 'Add an example profile first.',
                  )
                }
                disabled={!records}
              >
                Continue <ArrowRight size={16} />
              </Button>
            </BuilderFooter>
          </div>
          <div className="design-two-up">
            <article className="surface">
              <h3>Before shipping</h3>
              <ul className="design-checklist">
                <li>One obvious next action</li>
                <li>Visible labels and keyboard focus</li>
                <li>Readable copy over the artwork</li>
                <li>Useful empty, busy, and error states</li>
                <li>Comfortable on a small screen</li>
              </ul>
            </article>
            <article className="surface">
              <h3>Keep the system together</h3>
              <p className="muted mt-3">
                Edit semantic tokens in <code>app/design-tokens.css</code>.
                Follow the brand guide for copy and artwork, and reuse the
                shared components before introducing a new pattern.
              </p>
              <div className="design-doc-paths">
                <code>docs/BRAND_GUIDE.md</code>
                <code>docs/DESIGN_SYSTEM.md</code>
                <code>docs/TESTING.md</code>
              </div>
            </article>
          </div>
        </section>
        <p className="design-feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      </div>
    </AppLayoutBackground>
  )
}
