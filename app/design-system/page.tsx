import type { Metadata } from 'next'
import { DesignReference } from './reference'

export const metadata: Metadata = {
  title: 'Personame — Brand & design system',
  robots: { index: false, follow: false },
}

export default function DesignSystemPage() {
  return <DesignReference />
}
