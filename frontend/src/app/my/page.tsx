'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import TTSSettingsModal from '@/components/TTSSettingsModal'
import PWAInstallGuide from '@/components/PWAInstallGuide'
import { APP_VERSION, BUILD_DATE } from '@/lib/version'
import { forceCheckForUpdates } from '@/lib/versionCheck'
import { forceRefresh } from '@/lib/cacheUtils'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase'


// 버전별 릴리스 노트
const RELEASE_NOTES: Record<string, string[]> = {
  '1.0.0': [
    'AI 자유 회화',
    '오늘의 표현 학습',
    '표현 연습 모드',
    '단어 연습 (A1~C2)',
    '커뮤니티 시나리오',
    'Firebase 사용자 데이터 동기화',
    'PWA 앱 설치 지원',
  ],
}

function isNewerVersion(server: string, current: string): boolean {
  const s = server.split('.').map(Number)
  const c = current.split('.').map(Number)
  for (let i = 0; i < Math.max(s.length, c.length); i++) {
    const sv = s[i] || 0
    const cv = c[i] || 0
    if (sv > cv) return true
    if (sv < cv) return false
  }
  return false
}

export default function MyPage() {
  const [showReleaseNotes, setShowReleaseNotes] = useState(false)
  const router = useRouter()
  const { user, cachedUser, loading } = useAuth()

  // Optimistic UI: 캐시된 사용자 또는 실제 사용자
  const displayUser = user || cachedUser
  const [showTTSSettings, setShowTTSSettings] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [updateResult, setUpdateResult] = useState<'latest' | 'available' | 'error' | null>(null)
  const [serverVersion, setServerVersion] = useState<string | null>(null)

  // 앱 설치 관련
  const [isStandalone, setIsStandalone] = useState(false)
  const [showInstallGuide, setShowInstallGuide] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(standalone)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logOut()
    setIsLoggingOut(false)
    router.push('/')
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    setUpdateResult(null)

    const result = await forceCheckForUpdates()

    if (result.error) {
      setUpdateResult('error')
      setIsUpdating(false)
      return
    }

    setServerVersion(result.serverVersion)

    if (!result.hasUpdate) {
      setUpdateResult('latest')
      setIsUpdating(false)
      return
    }

    setUpdateResult('available')
    setIsUpdating(false)
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-32">
      {/* Top safe area */}
      <div className="bg-[#faf9f7]" style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">My</h1>

        <div className="space-y-4">
          {/* Profile Section */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            {/* Optimistic UI: 캐시가 있으면 로딩 스피너 없이 즉시 표시 */}
            {displayUser ? (
              <div className="flex items-center gap-4 py-2">
                <div className="w-14 h-14 bg-[#0D9488] rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {displayUser.displayName?.charAt(0) || displayUser.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-[#1a1a1a] font-medium text-lg">
                    {displayUser.displayName || '사용자'}
                  </p>
                  <p className="text-sm text-[#8a8a8a]">{displayUser.email}</p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-4 py-2">
                <div className="w-14 h-14 bg-[#f0f0f0] rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 bg-[#f0f0f0] rounded w-24 mb-2 animate-pulse" />
                  <div className="h-4 bg-[#f0f0f0] rounded w-40 animate-pulse" />
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

            {/* 음성 설정 */}
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
                  <p className="text-xs text-[#8a8a8a]">HD 음성, 속도 설정</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 앱 설치 */}
            <button
              onClick={() => !isStandalone && setShowInstallGuide(true)}
              disabled={isStandalone}
              className="w-full flex items-center justify-between py-3 border-b border-[#f0f0f0]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isStandalone ? 'bg-green-50' : 'bg-[#f5f5f5]'
                }`}>
                  {isStandalone ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[#1a1a1a] font-medium">
                    {isStandalone ? '설치 완료' : '앱 설치 / 홈에 추가'}
                  </p>
                  <p className="text-xs text-[#8a8a8a]">
                    {isStandalone ? '앱이 설치되어 있습니다' : '홈 화면에 추가하면 앱처럼 사용해요'}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 업데이트 확인 */}
            <button
              onClick={updateResult === 'available' ? forceRefresh : handleUpdate}
              disabled={isUpdating}
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  updateResult === 'latest' ? 'bg-green-50' :
                  updateResult === 'available' ? 'bg-blue-50' :
                  'bg-[#f5f5f5]'
                }`}>
                  {isUpdating ? (
                    <svg className="w-5 h-5 text-[#8a8a8a] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : updateResult === 'latest' ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[#1a1a1a] font-medium">
                    {updateResult === 'latest' ? '최신 버전입니다' :
                     updateResult === 'available' ? '업데이트 적용하기' :
                     updateResult === 'error' ? '확인 실패' :
                     '업데이트 확인'}
                  </p>
                  <p className="text-xs text-[#8a8a8a]">
                    {updateResult === 'latest'
                      ? `v${APP_VERSION} (최신)`
                      : updateResult === 'available' && serverVersion
                      ? `v${APP_VERSION} → v${serverVersion}`
                      : `현재 v${APP_VERSION}`}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </section>

          {/* Feedback Section */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-[#8a8a8a] mb-3">피드백</h2>

            <Link
              href="/feedback"
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[#1a1a1a] font-medium">기능 요청</p>
                  <p className="text-xs text-[#8a8a8a]">원하는 기능을 요청하고 투표하세요</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </section>

          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-[#8a8a8a] mb-3">앱 정보</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#1a1a1a]">현재 버전</span>
                <span className="text-[#8a8a8a]">v{APP_VERSION}</span>
              </div>
              {serverVersion && isNewerVersion(serverVersion, APP_VERSION) && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#1a1a1a]">최신 버전</span>
                  <span className="text-blue-500 font-medium">v{serverVersion}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-[#1a1a1a]">빌드 날짜</span>
                <span className="text-[#8a8a8a]">{BUILD_DATE}</span>
              </div>

              {/* Release Notes */}
              <button
                onClick={() => setShowReleaseNotes(!showReleaseNotes)}
                className="w-full flex items-center justify-between py-2 border-t border-[#f0f0f0] mt-2 pt-4"
              >
                <span className="text-[#1a1a1a]">주요 기능</span>
                <svg
                  className={`w-5 h-5 text-[#8a8a8a] transition-transform ${showReleaseNotes ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showReleaseNotes && (
                <div className="space-y-4 pt-2">
                  {Object.entries(RELEASE_NOTES)
                    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
                    .map(([version, features]) => (
                      <div key={version} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1a1a1a]">v{version}</span>
                          {version === APP_VERSION && (
                            <span className="text-xs bg-[#0D9488] text-white px-2 py-0.5 rounded-full">현재</span>
                          )}
                        </div>
                        <ul className="space-y-1 pl-3">
                          {features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-[#666] flex items-start gap-2">
                              <span className="text-[#8a8a8a] mt-1">-</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>

          {/* Logout Button - only when logged in */}
          {displayUser && (
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

      {showInstallGuide && (
        <PWAInstallGuide
          isOpen={showInstallGuide}
          onClose={() => setShowInstallGuide(false)}
        />
      )}
    </div>
  )
}
