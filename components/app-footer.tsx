import { ExploreLink } from './explore-link'
import Image from 'next/image'
import Link from 'next/link'

export function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link
            href="/"
            className="site-footer-logo"
            aria-label="Personame home"
          >
            <Image src="/logo.png" alt="" width={38} height={38} />
            <span>Personame</span>
          </Link>
          <p>
            A little curiosity.
            <br />A lot of personality.
          </p>
          <span>Quizzes made by you, for your people.</span>
        </div>
        <nav className="site-footer-nav" aria-label="Footer">
          <div>
            <h2>Create</h2>
            <Link href="/create">Make a quiz</Link>
            <Link href="/quizzes">Your quizzes</Link>
          </div>
          <div>
            <h2>Discover</h2>
            <Link href="/selves">Your many selves</Link>
            <ExploreLink>Explore quizzes</ExploreLink>
            <Link href="/">Home</Link>
          </div>
        </nav>
      </div>
      <div className="site-footer-credits">
        <p>&copy; 2026 Personame.</p>
        <p>
          Built with ❤️ and 🍌 by{' '}
          <a
            href="https://metamodernmonkey.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            MetaModernMonkey
          </a>
        </p>
      </div>
    </footer>
  )
}
