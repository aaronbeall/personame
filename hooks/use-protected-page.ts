import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook to protect pages that require authentication.
 * Redirects to sign-in page if user is not authenticated.
 * Includes the current URL as a callback to return user after auth.
 */
export function useProtectedPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
      const callbackUrl = encodeURIComponent(returnUrl)
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
    }
  }, [status, router])

  return status
}
