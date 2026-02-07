'use client'

import { useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SplashScreen from './SplashScreen'

const SPLASH_SHOWN_KEY = 'enpeak_splash_shown'

// 인증이 필요하지 않은 페이지들
const PUBLIC_PATHS = ['/login', '/landing']

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { loading, cachedUser, isVerified, isReady, isAuthenticated } = useAuth()
  const [showSplash, setShowSplash] = useState(false)
  const [splashComplete, setSplashComplete] = useState(false)
  const [appReady, setAppReady] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    // 이번 세션에서 이미 Splash를 보여줬는지 확인
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY)

    if (splashShown) {
      // 이미 보여줬으면 스플래시 스킵
      setSplashComplete(true)
    } else {
      // 첫 진입이면 Splash 표시
      setShowSplash(true)
    }
  }, [])

  // 스플래시 완료 후 인증 상태에 따라 라우팅
  useEffect(() => {
    if (!splashComplete) return
    if (!isReady) return // Firebase 검증이 완료될 때까지 대기

    // 로그인 페이지는 항상 접근 가능
    if (isPublicPath) {
      // 이미 로그인된 상태에서 로그인 페이지 접근 시 홈으로
      if (isAuthenticated) {
        router.replace('/')
        return
      }
      setAppReady(true)
      return
    }

    // 비로그인 상태에서 보호된 페이지 접근 시
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // 로그인 완료 상태
    setAppReady(true)
  }, [splashComplete, isReady, isAuthenticated, isPublicPath, pathname, router])

  const handleSplashComplete = () => {
    // 세션에 Splash 표시 완료 기록
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true')
    setShowSplash(false)
    setSplashComplete(true)
  }

  // Splash 표시 중
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        minDuration={cachedUser ? 800 : 1200}  // 캐시 있으면 빠르게
      />
    )
  }

  // 스플래시 완료 후 인증 체크 중 (로딩 화면)
  if (splashComplete && !appReady) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#8a8a8a]">Loading...</p>
        </div>
      </div>
    )
  }

  // 앱 준비 완료
  if (appReady) {
    return <>{children}</>
  }

  // 초기 상태 (깜빡임 방지용 빈 화면)
  return <div className="min-h-screen bg-[#faf9f7]" />
}
