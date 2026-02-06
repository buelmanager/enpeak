'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const { isAuthenticated, isReady } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingForAuth, setWaitingForAuth] = useState(false)

  // 로그인 성공 후 인증 상태가 준비되면 리다이렉트
  useEffect(() => {
    if (waitingForAuth && isReady && isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [waitingForAuth, isReady, isAuthenticated, redirectTo, router])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { user, error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password)

    if (error) {
      setError(error)
      setLoading(false)
    } else if (user) {
      // 로그인 성공 - 인증 상태 안정화 대기
      setWaitingForAuth(true)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    const { user, error } = await signInWithGoogle()

    if (error) {
      setError(error)
      setLoading(false)
    } else if (user) {
      // 로그인 성공 - 인증 상태 안정화 대기
      setWaitingForAuth(true)
    }
  }

  // 로그인 처리 중 로딩 화면
  if (waitingForAuth) {
    return (
      <main className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#8a8a8a]">Signing in...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] flex flex-col">
      {/* Top safe area */}
      <div className="bg-[#faf9f7] flex-shrink-0" style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Header */}
      <header className="px-6 pt-6 pb-8">
        <Link href="/talk" className="inline-flex items-center gap-2 text-[#8a8a8a] text-sm">
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
              placeholder="********"
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7] flex items-center justify-center"><p className="text-[#8a8a8a]">로딩 중...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}
