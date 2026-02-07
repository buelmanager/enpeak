'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  minDuration?: number  // 최소 표시 시간 (ms)
}

export default function SplashScreen({ onComplete, minDuration = 1000 }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      // 페이드아웃 애니메이션 후 완료
      setTimeout(onComplete, 300)
    }, minDuration)

    return () => clearTimeout(timer)
  }, [onComplete, minDuration])

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#faf9f7] flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 로고 */}
      <div className="w-16 h-16 rounded-2xl bg-[#0D9488] flex items-center justify-center mb-5 shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>

      {/* 앱 이름 */}
      <h1 className="text-2xl font-bold text-[#1C1917] tracking-tight">
        Flu
      </h1>

      {/* 로딩 인디케이터 */}
      <div className="mt-8">
        <div className="w-6 h-6 border-2 border-[#0D9488]/20 border-t-[#0D9488] rounded-full animate-spin" />
      </div>
    </div>
  )
}
