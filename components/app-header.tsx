'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { LoadingIndicator, Skeleton } from './ui/loading'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { requestJson } from '@/lib/client-api'
import { usePathname } from 'next/navigation'
import { EntityIcon } from './entity-icon'
import { Compass, LogOut } from 'lucide-react'
import { CreateQuizLink } from './create-quiz-link'
import { Button } from './ui/button'
import * as Popover from '@radix-ui/react-popover'


/** Original vector pen stroke: stays crisp and draws itself on route activation. */
function NavFlourish() {
  return (
    <svg className="header-nav-flourish" viewBox="0 0 140 20" fill="none" aria-hidden="true">
      <path className="nav-pen-main" pathLength="1" d="M5 12C30 6 78 5 117 8C134 9 138 13 129 15C121 17 112 13 117 9" />
      <path className="nav-pen-tail" pathLength="1" d="M18 16C46 12 75 12 98 13" />
    </svg>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const isCreating = pathname === '/create' || pathname.startsWith('/create/')
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const countsQuery = useQuery({
    queryKey: ['personal', 'count', session?.user?.email],
    queryFn: () =>
      requestJson<{ count: number; selvesCount: number }>('/api/me/counts'),
    enabled: status === 'authenticated',
    staleTime: 60_000,
  })
  const counts = countsQuery.data
  const quizCount = counts?.count
  const selvesCount = counts?.selvesCount

  const publishedQuery = useQuery({
    queryKey: ['discover', 'count'],
    queryFn: () => requestJson<{ count: number }>('/api/personames/count'),
    staleTime: 60_000,
  })
  const publishedCount = publishedQuery.data?.count

  const userImage = session?.user?.image
  const userName = session?.user?.name ?? 'User'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <header className="site-header w-full border-b border-muted-200 bg-white/95 backdrop-blur-sm">
      <div className="site-header-inner container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 relative">
            <Image
              src="/logo.png"
              alt="Personame"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>
          <span className="hidden sm:inline text-xl font-bold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Personame
          </span>
        </Link>

        <div className="site-header-actions flex items-center gap-3">
          <nav className="header-primary-nav" aria-label="Main navigation">
            <Link
              href="/explore"
              className="header-nav-item header-explore"
              aria-label="Explore quizzes"
              aria-describedby={
                publishedCount !== undefined ? 'header-explore-count' : undefined
              }
              aria-current={
                pathname === '/explore' || pathname.startsWith('/explore/')
                  ? 'page'
                  : undefined
              }
            >
              <Compass size={17} strokeWidth={1.75} aria-hidden="true" />
              <span className="header-explore-label">Explore</span>
              {(pathname === '/explore' || pathname.startsWith('/explore/')) && <NavFlourish key={pathname} />}
              {publishedQuery.isPending && (
                <span className="header-quiz-count header-explore-loading">
                  <LoadingIndicator label="Loading published quiz count…" />
                </span>
              )}
              {publishedCount !== undefined && (
                <span
                  className="header-quiz-count"
                  id="header-explore-count"
                  title={`${publishedCount.toLocaleString('en')} published quizzes`}
                >
                  {new Intl.NumberFormat('en', {
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  }).format(publishedCount)}
                  <span className="sr-only"> published quizzes</span>
                </span>
              )}
            </Link>
            {status === 'authenticated' && (
              <>
                <Link
                  href="/quizzes"
                  className="header-nav-item header-your-quizzes"
                  aria-label="Your quizzes"
                  aria-current={
                    pathname === '/quizzes' ||
                    pathname.startsWith('/quizzes/')
                      ? 'page'
                      : undefined
                  }
                  aria-describedby={
                    quizCount !== undefined ? 'header-quiz-count' : undefined
                  }
                >
                  <EntityIcon kind="quiz" size={17} />
                  {(pathname === '/quizzes' || pathname.startsWith('/quizzes/')) && <NavFlourish key={pathname} />}
                  <span className="header-space-label">Your quizzes</span>
                  <span className="header-space-short" aria-hidden="true">
                    Quizzes
                  </span>
                  {countsQuery.isPending && (
                    <span className="header-quiz-count">
                      <LoadingIndicator label="Loading your quiz count…" />
                    </span>
                  )}
                  {quizCount !== undefined && (
                    <span className="header-quiz-count" id="header-quiz-count">
                      {quizCount > 999 ? '999+' : quizCount}
                      <span className="sr-only"> quizzes</span>
                    </span>
                  )}
                </Link>
                <Link
                  href="/selves"
                  className="header-nav-item header-your-quizzes header-selves"
                  aria-label="Your many selves"
                  aria-describedby={
                    selvesCount !== undefined ? 'header-selves-count' : undefined
                  }
                  aria-current={
                    pathname === '/selves' || pathname.startsWith('/selves/')
                      ? 'page'
                      : undefined
                  }
                >
                  <EntityIcon kind="archetype" size={17} />
                  {(pathname === '/selves' || pathname.startsWith('/selves/')) && <NavFlourish key={pathname} />}
                  <span className="header-space-label">Your many selves</span>
                  <span className="header-space-short" aria-hidden="true">
                    Selves
                  </span>
                  {countsQuery.isPending && (
                    <span className="header-quiz-count">
                      <LoadingIndicator label="Loading your discovery count…" />
                    </span>
                  )}
                  {selvesCount !== undefined && (
                    <span className="header-quiz-count" id="header-selves-count">
                      {selvesCount > 999 ? '999+' : selvesCount}
                      <span className="sr-only">
                        {selvesCount === 1 ? ' discovery' : ' discoveries'}
                      </span>
                    </span>
                  )}
                </Link>
              </>
            )}
            <CreateQuizLink
              className="header-nav-item header-create-link"
              aria-current={isCreating ? 'page' : undefined}
            >
              Create
              {isCreating && <NavFlourish key={pathname} />}
            </CreateQuizLink>
          </nav>
          {status === 'loading' ? (
            <div
              className="flex items-center gap-3"
              aria-label="Loading account"
              role="status"
            >
              <Skeleton className="skeleton-account-action" />
              <Skeleton className="skeleton-avatar" />
            </div>
          ) : status === 'authenticated' ? (
            <>
              <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                  <button
                    aria-label="User menu"
                    className="h-9 w-9 rounded-full overflow-hidden border border-muted-300 flex items-center justify-center bg-muted-100 hover:opacity-80 transition-opacity"
                  >
                    {userImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userImage}
                        alt="avatar"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-primary-700">
                        {initial}
                      </span>
                    )}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="w-56 rounded-lg border border-muted-200 bg-white shadow-lg p-0 z-50"
                    sideOffset={8}
                    align="end"
                  >
                    <div className="px-4 py-3 border-b border-muted-200">
                      <p className="text-xs text-muted-600">Signed in as</p>
                      <p className="text-sm font-medium text-primary-900 truncate">
                        {userName}
                      </p>
                    </div>
                    <nav className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setOpen(false)
                          signOut()
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-muted-700 hover:bg-muted-50 rounded transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </nav>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
