'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Sparkles, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as Popover from '@radix-ui/react-popover'

export function AppHeader() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  const userImage = session?.user?.image
  const userName = session?.user?.name || 'User'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <header className="w-full border-b border-muted-200 bg-gradient-to-r from-primary-100 via-accent-100 to-secondary-100 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 relative">
            <Image src="/logo.png" alt="Personame" fill sizes="36px" className="object-contain" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Personame
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {status === 'authenticated' ? (
            <>
              <Link href="/create">
                <Button className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-md hover:shadow-lg transition-shadow px-4 h-9 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Create
                </Button>
              </Link>
              <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                  <button
                    aria-label="User menu"
                    className="h-9 w-9 rounded-full overflow-hidden border border-muted-300 flex items-center justify-center bg-muted-100 hover:opacity-80 transition-opacity"
                  >
                    {userImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userImage} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-primary-700">{initial}</span>
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
                      <p className="text-sm font-medium text-primary-900 truncate">{userName}</p>
                    </div>
                    <nav className="p-2 space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 text-sm text-muted-700 hover:bg-muted-50 rounded transition-colors"
                      >
                        Dashboard
                      </Link>
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
              <Button>
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
