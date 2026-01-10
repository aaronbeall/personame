'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

        <div className="flex items-center gap-3 relative">
          {status === 'authenticated' ? (
            <>
              <Link href="/create">
                <Button variant="outline">Create</Button>
              </Link>
              <button
                aria-label="User menu"
                onClick={() => setOpen((v) => !v)}
                className="h-9 w-9 rounded-full overflow-hidden border border-muted-300 flex items-center justify-center bg-muted-100"
              >
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userImage} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-primary-700">{initial}</span>
                )}
              </button>
              {open && (
                <div className="absolute right-0 top-12 w-48 rounded-md border bg-white shadow-md">
                  <div className="px-3 py-2 text-sm text-muted-700">Signed in as<br />
                    <span className="font-medium text-primary-900">{userName}</span>
                  </div>
                  <div className="border-t border-muted-200" />
                  <Link href="/dashboard" className="block px-3 py-2 text-sm hover:bg-muted-50">Dashboard</Link>
                  <button
                    onClick={() => {
                      setOpen(false)
                      signOut()
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
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
