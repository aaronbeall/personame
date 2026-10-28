import { ExploreLink } from './explore-link'
import Image from 'next/image'
import { CreateQuizLink } from './create-quiz-link'

export function HomeClosingCta() {
  return (
    <section className="home-closing-cta" aria-labelledby="closing-cta-title">
      <Image
        src="/images/decor/party.webp"
        width={640}
        height={512}
        sizes="(max-width: 640px) 340px, 520px"
        alt=""
        className="home-closing-art"
      />
      <div className="home-closing-copy" data-reveal>
        <p className="eyebrow">Your turn to make something</p>
        <h2 id="closing-cta-title">
          What will your
          <br />
          people discover?
        </h2>
        <p>
          There’s a quiz only you could make. Bring it to life, one question at
          a time.
        </p>
        <div className="home-closing-actions">
          <CreateQuizLink className="walkthrough-create-link">
            Create your quiz
          </CreateQuizLink>
          <ExploreLink className="home-closing-secondary">
            Explore a little first
          </ExploreLink>
        </div>
      </div>
    </section>
  )
}
