'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import TTSSettingsModal from '@/components/TTSSettingsModal'
import { APP_VERSION, BUILD_DATE } from '@/lib/version'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase'

export default function MyPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showTTSSettings, setShowTTSSettings] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logOut()
    setIsLoggingOut(false)
    router.push('/')
  }

  const handleUpdate = async () => {
    setIsUpdating(true)

    try {
      // 서비스 워커 업데이트
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.update()
      }

      // 캐시 삭제
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error('Update failed:', error)
      // 실패해도 새로고침 시도
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-32">
      {/* Top safe area - 30px */}
      <div className="h-[30px] bg-[#faf9f7]" />

      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">My</h1>

        <div className="space-y-4">
          {/* Profile Section */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            {loading ? (
              <div className="flex items-center gap-4 py-2">
                <div className="w-14 h-14 bg-[#f0f0f0] rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 bg-[#f0f0f0] rounded w-24 mb-2 animate-pulse" />
                  <div className="h-4 bg-[#f0f0f0] rounded w-40 animate-pulse" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-4 py-2">
                <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-[#1a1a1a] font-medium text-lg">
                    {user.displayName || '사용자'}
                  </p>
                  <p className="text-sm text-[#8a8a8a]">{user.email}</p>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-4 py-2">
                <div className="w-14 h-14 bg-[#f5f5f5] rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[#1a1a1a] font-medium text-lg">로그인하기</p>
                  <p className="text-sm text-[#8a8a8a]">로그인하면 학습 데이터가 저장됩니다</p>
                </div>
                <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </section>
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-[#8a8a8a] mb-3">설정</h2>

            <button
              onClick={() => setShowTTSSettings(true)}
              className="w-full flex items-center justify-between py-3 border-b border-[#f0f0f0]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[#1a1a1a] font-medium">음성 설정</p>
                  <p className="text-xs text-[#8a8a8a]">TTS 음성, 속도, 높낮이 설정</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center">
                  {isUpdating ? (
                    <svg className="w-5 h-5 text-[#8a8a8a] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[#1a1a1a] font-medium">업데이트 확인</p>
                  <p className="text-xs text-[#8a8a8a]">최신 버전으로 업데이트</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </section>

          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-[#8a8a8a] mb-3">앱 정보</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#1a1a1a]">버전</span>
                <span className="text-[#8a8a8a]">{APP_VERSION}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#1a1a1a]">빌드 날짜</span>
                <span className="text-[#8a8a8a]">{BUILD_DATE}</span>
              </div>
            </div>
          </section>

          {/* Logout Button - only when logged in */}
          {user && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center gap-2 text-red-500 font-medium"
            >
              {isLoggingOut ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          )}
        </div>
      </div>

      <BottomNav />

      <TTSSettingsModal
        isOpen={showTTSSettings}
        onClose={() => setShowTTSSettings(false)}
      />
    </div>
  )
}
