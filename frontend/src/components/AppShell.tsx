'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import SplashScreen from './SplashScreen'

const SPLASH_SHOWN_KEY = 'enpeak_splash_shown'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { loading, cachedUser, isVerified } = useAuth()
  const [showSplash, setShowSplash] = useState(false)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    // 이번 세션에서 이미 Splash를 보여줬는지 확인
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY)

    if (splashShown) {
      // 이미 보여줬으면 바로 앱 표시
      setAppReady(true)
    } else {
      // 첫 진입이면 Splash 표시
      setShowSplash(true)
    }
  }, [])

  const handleSplashComplete = () => {
    // 세션에 Splash 표시 완료 기록
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true')
    setShowSplash(false)
    setAppReady(true)
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

  // 앱 준비 완료
  if (appReady) {
    return <>{children}</>
  }

  // 초기 상태 (깜빡임 방지용 빈 화면)
  return <div className="min-h-screen bg-[#faf9f7]" />
}
