'use client'

import Link from 'next/link'
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
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-purple-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                className="h-9 w-9 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100"
              >
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userImage} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">{initial}</span>
                )}
              </button>
              {open && (
                <div className="absolute right-0 top-12 w-48 rounded-md border bg-white shadow-md">
                  <div className="px-3 py-2 text-sm text-gray-600">Signed in as<br />
                    <span className="font-medium text-gray-900">{userName}</span>
                  </div>
                  <div className="border-t" />
                  <Link href="/dashboard" className="block px-3 py-2 text-sm hover:bg-gray-50">Dashboard</Link>
                  <button
                    onClick={() => {
                      setOpen(false)
                      signOut()
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
