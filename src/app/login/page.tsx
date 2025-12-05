'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSiteUrl } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
        </div>

        <button
            onClick={handleGoogleLogin}
            className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
            <svg className="mr-2 h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path
                    d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.65-.05-1.2833-.15-1.9h-8.3v3.8h4.75c-.2167 1.1-.85 2.0333-1.8167 2.6833v2.2334h2.9334c1.7166-1.5834 2.7166-3.9167 2.7166-6.6167 0-.6667-.0666-1.3167-.1833-1.95h-8.4v3.9h4.8333c-.2166 1.1667-.8833 2.1667-1.8833 2.8333v2.35h3.05c1.7833-1.6333 2.8-4.0333 2.8-6.7667 0-.6666-.0833-1.3166-.2167-1.95h-12.2v24h24c0 6.6274-5.3726 12-12 12s-12-5.3726-12-12 5.3726-12 12-12c3.0575 0 5.8417 1.15 7.9667 3.0333l-2.85 2.85c-1.35-1.2833-3.1333-2.0833-5.1167-2.0833-3.9666 0-7.1833 3.2167-7.1833 7.1834 0 3.9666 3.2167 7.1833 7.1833 7.1833z"
                    fill="#4285F4"
                    fillRule="evenodd"
                />
                 <path
                    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                    fill="#4285F4"
                    fillOpacity="0"
                />
                <path
                    d="M20.64 12.2045C20.64 11.5664 20.5827 10.9527 20.4764 10.3636H12V13.8377H16.8436C16.635 14.9627 16.0005 15.9164 15.0477 16.5545V18.8118H17.9564C19.6582 17.2455 20.64 14.9391 20.64 12.2045Z"
                    fill="#4285F4"
                />
                <path
                    d="M12 21.0001C14.4327 21.0001 16.4727 20.1928 17.9645 18.8119L15.0559 16.5546C14.2486 17.0946 13.2191 17.4137 12 17.4137C9.65455 17.4137 7.66909 15.8292 6.96001 13.7046H3.95455V16.0364C5.43546 18.9792 8.49 21.0001 12 21.0001Z"
                    fill="#34A853"
                />
                <path
                    d="M6.95998 13.7046C6.77998 13.1646 6.6818 12.5919 6.6818 12.0001C6.6818 11.4083 6.77998 10.8355 6.95998 10.2955V7.96371H3.95453C3.34362 9.18007 3 10.5546 3 12.0001C3 13.4455 3.34362 14.8201 3.95453 16.0364L6.95998 13.7046Z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 6.58643C13.3227 6.58643 14.5145 7.04189 15.4473 7.93371L18.0218 5.35916C16.4645 3.90825 14.4245 3.00007 12 3.00007C8.49 3.00007 5.43546 5.02098 3.95455 7.96371L6.96001 10.2955C7.66909 8.17098 9.65455 6.58643 12 6.58643Z"
                    fill="#EA4335"
                />
            </svg>
            Google
        </button>

        <div className="text-center text-sm">
          <a href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
