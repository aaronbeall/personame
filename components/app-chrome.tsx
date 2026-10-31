'use client'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AppHeader } from './app-header'
import { AppFooter } from './app-footer'

export function AppChrome({ children }: { children: ReactNode }) {
  const path = usePathname()
  const participant = path.startsWith('/quiz/')
  const studio = /^\/create\/[^/]+\/questions$/.test(path)
  if (participant) return <div className="participant-shell"><header className="participant-brand"><Link href="/" aria-label="Personame home"><Image src="/logo.png" alt="" width={23} height={23} /><span>Personame</span></Link><span>A little curiosity. A new side of you.</span></header>{children}<footer className="participant-footer"><span>Made with <Link href="/">Personame</Link></span><Link href="/create">Make something of your own ↗</Link></footer></div>
  return <><AppHeader />{children}{!studio && <AppFooter />}</>
}
