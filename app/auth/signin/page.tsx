'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FaGoogle, FaGithub, FaFacebook, FaApple, FaLinkedin } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }>>({})
  const callbackUrl = searchParams.get('callbackUrl') || '/create'

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/providers')
        if (res.ok) {
          const data = await res.json()
          setProviders(data)
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 via-white to-secondary-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-linear-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to Personame</CardTitle>
          <CardDescription>Sign in to create and save your personality quizzes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.google && (
            <Button
              onClick={() => signIn('google', { callbackUrl })}
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
              onClick={() => signIn('facebook', { callbackUrl })}
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
              onClick={() => signIn('apple', { callbackUrl })}
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
              onClick={() => signIn('linkedin', { callbackUrl })}
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
              onClick={() => signIn('github', { callbackUrl })}
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
