import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Link2 } from 'lucide-react'
import { ArchetypeBadge, DimensionSymbol } from './entity-identity'
import { QuizCoverMark } from './quiz-cover-mark'

const stages = [
  {
    title: 'Start with your idea',
    description: 'Give your quiz a name and a look that feels like you.',
    art: 'creation',
  },
  {
    title: 'Choose your dimensions',
    description:
      'Decide what makes people different. A little cautious or wildly curious?',
    art: 'science',
  },
  {
    title: 'Dream up the types',
    description:
      'Create the characters people can become, each with its own mix of traits.',
    art: 'islands',
  },
  {
    title: 'Ask your questions',
    description:
      'Turn small choices into clues. Connect each answer to your dimensions.',
    art: 'creation',
  },
  {
    title: 'Let your people in',
    description:
      'Try it out, publish, and share your quiz. Let the discoveries begin.',
    art: 'galaxy-expansion',
  },
]

/** Illustrative previews, not interactive builder controls. */
function StageIllustration({ stage }: { stage: number }) {
  switch (stage) {
    case 0:
      return (
        <div className="walkthrough-cover">
          <QuizCoverMark emoji="🪐" color="#2563eb,#7c3aed" />
          <div>
            <small>Your next quiz</small>
            <strong>
              Your place
              <br />
              in space
            </strong>
            <span>A crew of curious characters.</span>
          </div>
        </div>
      )
    case 1:
      return (
        <div className="walkthrough-dimensions">
          <div>
            <DimensionSymbol name="Curiosity" emoji="🔭" color="#14b8a6" />
            <strong>Curiosity</strong>
          </div>
          <div className="walkthrough-scale">
            <i />
            <b />
          </div>
          <div className="walkthrough-scale-ends">
            <span>Cautious</span>
            <span>Curious</span>
          </div>
          <div className="walkthrough-second-trait">
            <span>✦</span> A little sense of adventure
          </div>
        </div>
      )
    case 2:
      return (
        <div className="walkthrough-types">
          <div className="walkthrough-side-badge">
            <ArchetypeBadge
              name="The Navigator"
              emoji="🧭"
              color="#0f766e,#38bdf8"
              size={52}
              label={false}
            />
          </div>
          <ArchetypeBadge
            name="The Stargazer"
            emoji="🔭"
            color="#2563eb,#7c3aed"
            size={76}
          />
          <div className="walkthrough-side-badge">
            <ArchetypeBadge
              name="The Explorer"
              emoji="🚀"
              color="#c2410c,#f59e0b"
              size={52}
              label={false}
            />
          </div>
        </div>
      )
    case 3:
      return (
        <div className="walkthrough-question">
          <small>A signal from the unknown…</small>
          <strong>What do you do?</strong>
          <span>
            <i />
            Check the star charts
          </span>
          <span className="walkthrough-answer-selected">
            <i>
              <Check size={10} />
            </i>
            Follow the signal
          </span>
          <em>✦ A little more curious</em>
        </div>
      )
    default:
      return (
        <div className="walkthrough-result">
          <span className="walkthrough-ready">
            <Check size={10} /> Ready to share
          </span>
          <ArchetypeBadge
            name="The Stargazer"
            emoji="🔭"
            color="#2563eb,#7c3aed"
            size={58}
            label={false}
          />
          <strong>You’re the Stargazer.</strong>
          <span className="walkthrough-share">
            <Link2 size={11} /> Your quiz. Your people.
          </span>
        </div>
      )
  }
}

export function QuizCreationWalkthrough() {
  return (
    <section
      className="quiz-walkthrough"
      aria-labelledby="quiz-walkthrough-title"
    >
      <header className="quiz-walkthrough-intro">
        <p className="eyebrow" data-reveal>
          How it comes together
        </p>
        <h2
          id="quiz-walkthrough-title"
          data-reveal
          style={{ transitionDelay: '90ms' }}
        >
          A spark of an idea.
          <br />A quiz only you could make.
        </h2>
        <p data-reveal style={{ transitionDelay: '170ms' }}>
          You bring the perspective. Build the questions and personalities
          around it, one step at a time.
        </p>
      </header>
      <ol className="quiz-walkthrough-stages">
        {stages.map((stage, index) => (
          <li
            key={stage.title}
            data-reveal="step"
            style={{ animationDelay: `${index * 180}ms` }}
          >
            <div className="walkthrough-stage-art" aria-hidden="true">
              <Image
                src={`/images/decor/${stage.art}.webp`}
                alt=""
                fill
                sizes="(max-width: 600px) 90vw, (max-width: 1050px) 45vw, 240px"
                className="walkthrough-artwork"
              />
              <StageIllustration stage={index} />
            </div>
            <div className="walkthrough-step-number">
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3>{stage.title}</h3>
            <p>{stage.description}</p>
          </li>
        ))}
      </ol>
      <Link href="/create" className="walkthrough-create-link">
        Make your first quiz <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  )
}
