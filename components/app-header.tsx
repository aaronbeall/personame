'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Skeleton } from './ui/loading'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { requestJson } from '@/lib/client-api'
import { usePathname } from 'next/navigation'
import { EntityIcon } from './entity-icon'
import { LogOut } from 'lucide-react'
import { CreateQuizLink } from './create-quiz-link'
import { Button } from './ui/button'
import * as Popover from '@radix-ui/react-popover'

export function AppHeader() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const counts = useQuery({
    queryKey: ['personal', 'count', session?.user?.email],
    queryFn: () =>
      requestJson<{ count: number; selvesCount: number }>('/api/me/counts'),
    enabled: status === 'authenticated',
    staleTime: 60_000,
  }).data
  const quizCount = counts?.count
  const selvesCount = counts?.selvesCount

  const userImage = session?.user?.image
  const userName = session?.user?.name ?? 'User'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <header className="w-full border-b border-muted-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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

        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="header-explore"
            aria-current={pathname === '/explore' ? 'page' : undefined}
          >
            Explore
          </Link>
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
              <Link
                href="/quizzes"
                className="header-your-quizzes whitespace-nowrap text-sm text-muted-600 hover:text-primary-700"
                aria-label="Your quizzes"
                aria-current={
                  pathname === '/quizzes' || pathname.startsWith('/create')
                    ? 'page'
                    : undefined
                }
                aria-describedby={
                  quizCount !== undefined ? 'header-quiz-count' : undefined
                }
              >
                <EntityIcon kind="quiz" size={17} />
                <span className="header-space-label">Your quizzes</span>
                <span className="header-space-short" aria-hidden="true">
                  Quizzes
                </span>
                {quizCount !== undefined && (
                  <span className="header-quiz-count" id="header-quiz-count">
                    {quizCount > 999 ? '999+' : quizCount}
                    <span className="sr-only"> quizzes</span>
                  </span>
                )}
              </Link>
              <Link
                href="/selves"
                className="header-your-quizzes header-selves whitespace-nowrap text-sm text-muted-600 hover:text-primary-700"
                aria-label="Your many selves"
                aria-describedby={
                  selvesCount !== undefined ? 'header-selves-count' : undefined
                }
                aria-current={pathname === '/selves' ? 'page' : undefined}
              >
                <EntityIcon kind="archetype" size={17} />
                <span className="header-space-label">Your many selves</span>
                <span className="header-space-short" aria-hidden="true">
                  Selves
                </span>
                {selvesCount !== undefined && (
                  <span className="header-quiz-count" id="header-selves-count">
                    {selvesCount > 999 ? '999+' : selvesCount}
                    <span className="sr-only">
                      {selvesCount === 1 ? ' discovery' : ' discoveries'}
                    </span>
                  </span>
                )}
              </Link>
              <CreateQuizLink className="header-create-link">
                Create
              </CreateQuizLink>
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
