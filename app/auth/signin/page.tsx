'use client'

import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FaGoogle,
  FaGithub,
  FaFacebook,
  FaApple,
  FaLinkedin,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoadingIndicator } from '@/components/ui/loading'
import { Sparkles } from 'lucide-react'

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="workspace">
          <div className="notice mx-auto max-w-md flex items-center gap-2">
            <LoadingIndicator label="Preparing sign-in…" />
            Preparing sign-in…
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
function SignInForm() {
  const searchParams = useSearchParams()
  const [providers, setProviders] = useState<
    Record<string, { id: string; name: string }>
  >({})
  const [providersLoading, setProvidersLoading] = useState(true)
  const [pendingProvider, setPendingProvider] = useState<string | null>(null)
  const [error, setError] = useState('')
  const callbackUrl = searchParams.get('callbackUrl') || '/create'

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/providers')
        if (!res.ok)
          throw new Error(
            'Unable to load sign-in options. Please refresh and try again.',
          )
        setProviders(await res.json())
      } catch {
        setError(
          'Unable to load sign-in options. Please refresh and try again.',
        )
      } finally {
        setProvidersLoading(false)
      }
    }
    load()
  }, [])

  async function connect(provider: string) {
    setPendingProvider(provider)
    setError('')
    try {
      await signIn(provider, { callbackUrl })
    } catch {
      setPendingProvider(null)
      setError('Unable to connect. Please try again.')
    }
  }

  return (
    <div className="signin-scene workspace-auth">
      <div className="signin-landscape" aria-hidden="true" />
      <Image
        src="/images/decor/islands.webp"
        width={1200}
        height={960}
        alt=""
        className="signin-art"
      />
      <Card className="signin-panel w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Personame</CardTitle>
          <CardDescription>
            Sign in to create and save your personality quizzes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providersLoading && (
            <div className="loading-caption">
              <LoadingIndicator label="Loading sign-in options…" />
              Loading sign-in options…
            </div>
          )}
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
          {providers.google && (
            <Button
              onClick={() => connect('google')}
              loading={pendingProvider === 'google'}
              disabled={!!pendingProvider}
              className="w-full text-white"
              size="lg"
              style={{ backgroundColor: '#4285F4' }}
            >
              <FaGoogle className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>
          )}

          {providers.facebook && (
            <Button
              onClick={() => connect('facebook')}
              loading={pendingProvider === 'facebook'}
              disabled={!!pendingProvider}
              className="w-full text-white"
              size="lg"
              style={{ backgroundColor: '#1877F2' }}
            >
              <FaFacebook className="h-5 w-5 mr-2" />
              Continue with Facebook
            </Button>
          )}

          {providers.apple && (
            <Button
              onClick={() => connect('apple')}
              loading={pendingProvider === 'apple'}
              disabled={!!pendingProvider}
              className="w-full text-white"
              size="lg"
              style={{ backgroundColor: '#000000' }}
            >
              <FaApple className="h-5 w-5 mr-2" />
              Continue with Apple
            </Button>
          )}

          {providers.linkedin && (
            <Button
              onClick={() => connect('linkedin')}
              loading={pendingProvider === 'linkedin'}
              disabled={!!pendingProvider}
              className="w-full text-white"
              size="lg"
              style={{ backgroundColor: '#0A66C2' }}
            >
              <FaLinkedin className="h-5 w-5 mr-2" />
              Continue with LinkedIn
            </Button>
          )}

          {providers.github && (
            <Button
              onClick={() => connect('github')}
              loading={pendingProvider === 'github'}
              disabled={!!pendingProvider}
              className="w-full text-white"
              size="lg"
              style={{ backgroundColor: '#333333' }}
            >
              <FaGithub className="h-5 w-5 mr-2" />
              Continue with GitHub
            </Button>
          )}

          <div className="text-center text-sm text-gray-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
