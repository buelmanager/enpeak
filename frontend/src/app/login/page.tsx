'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail
} from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { user, error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password)

    setLoading(false)

    if (error) {
      setError(error)
    } else if (user) {
      router.push('/')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    const { user, error } = await signInWithGoogle()
    setLoading(false)

    if (error) {
      setError(error)
    } else if (user) {
      router.push('/')
    }
  }

  const handleAppleLogin = async () => {
    setError('')
    setLoading(true)
    const { user, error } = await signInWithApple()
    setLoading(false)

    if (error) {
      setError(error)
    } else if (user) {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-14 pb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#8a8a8a] text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </header>

      <div className="flex-1 px-6 flex flex-col">
        {/* Title */}
        <div className="mb-12">
          <p className="text-[#8a8a8a] text-xs tracking-[0.2em] uppercase mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </p>
          <h1 className="text-3xl font-medium tracking-tight">
            {isSignUp ? '회원가입' : '로그인'}
          </h1>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-[#1a1a1a] p-4 flex items-center justify-center gap-3 transition-all active:bg-[#1a1a1a] active:text-white disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm tracking-wide">Google로 계속하기</span>
          </button>

          <button
            onClick={handleAppleLogin}
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white p-4 flex items-center justify-center gap-3 transition-all active:bg-[#333] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="text-sm tracking-wide">Apple로 계속하기</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-[10px] text-[#8a8a8a] tracking-[0.2em] uppercase">Or</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="text-[10px] text-[#8a8a8a] tracking-[0.1em] uppercase block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-[#e5e5e5] p-4 bg-transparent text-sm tracking-wide placeholder:text-[#c5c5c5] focus:border-[#1a1a1a] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-[#8a8a8a] tracking-[0.1em] uppercase block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#e5e5e5] p-4 bg-transparent text-sm tracking-wide placeholder:text-[#c5c5c5] focus:border-[#1a1a1a] focus:outline-none transition-colors"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs tracking-wide">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-[#1a1a1a] p-4 text-sm tracking-wide font-medium transition-all active:bg-[#1a1a1a] active:text-white disabled:opacity-50"
          >
            {loading ? '...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="text-sm text-[#8a8a8a] tracking-wide"
          >
            {isSignUp ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
            <span className="text-[#1a1a1a] underline underline-offset-2">
              {isSignUp ? '로그인' : '회원가입'}
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8">
        <p className="text-[10px] text-[#c5c5c5] text-center tracking-wide">
          로그인 시 이용약관 및 개인정보처리방침에 동의합니다
        </p>
      </footer>
    </main>
  )
}
