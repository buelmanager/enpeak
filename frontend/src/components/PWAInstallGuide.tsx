'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallGuide() {
  const [showGuide, setShowGuide] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // 이미 PWA로 설치된 경우 감지
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // navigator.standalone은 iOS Safari에서 PWA 모드 감지
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true)
      return
    }

    // 이미 가이드를 닫은 적이 있는지 확인 (24시간 동안 다시 안 보여줌)
    const dismissed = localStorage.getItem('pwa-guide-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        return
      }
    }

    // 기기 감지
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    const isAndroidDevice = /android/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)

    setIsIOS(isIOSDevice && isSafari)
    setIsAndroid(isAndroidDevice)

    // Android: beforeinstallprompt 이벤트 리스닝
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowGuide(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // iOS Safari에서 바로 가이드 표시
    if (isIOSDevice && isSafari) {
      setTimeout(() => setShowGuide(true), 2000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowGuide(false)
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowGuide(false)
    localStorage.setItem('pwa-guide-dismissed', Date.now().toString())
  }

  if (isInstalled || !showGuide) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">앱 설치하기</h2>
          <button
            onClick={handleDismiss}
            className="p-2 -mr-2 text-[#8a8a8a] hover:text-[#1a1a1a]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* App Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-[#f5f5f5] rounded-2xl">
          <div className="w-14 h-14 bg-[#f5f5f5] rounded-xl overflow-hidden flex items-center justify-center border border-[#e5e5e5]">
            <svg className="w-8 h-8 text-[#8a8a8a]" viewBox="0 0 512 512">
              <path d="M160 88v240c0 17.7-21.4 26.6-34 14.1L72.9 289.8C70.3 287.3 66.8 286 63.2 286H32c-17.7 0-32-14.3-32-32V162c0-17.7 14.3-32 32-32h31.2c3.6 0 7.1-1.3 9.6-3.8l53.2-52.3C139.6 60.4 160 70.3 160 88z" fill="currentColor"/>
              <path d="M192 144c0-8.8 7.2-16 16-16s16 7.2 16 16v128c0 8.8-7.2 16-16 16s-16-7.2-16-16V144z" fill="currentColor"/>
              <path d="M256 112c0-8.8 7.2-16 16-16s16 7.2 16 16v192c0 8.8-7.2 16-16 16s-16-7.2-16-16V112z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">EnPeak</h3>
            <p className="text-sm text-[#8a8a8a]">AI 영어 학습 앱</p>
          </div>
        </div>

        {/* iOS Instructions */}
        {isIOS && (
          <div className="space-y-4">
            <p className="text-sm text-[#666]">
              홈 화면에 추가하면 앱처럼 사용할 수 있어요
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    하단의 <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mx-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </span> 공유 버튼을 탭하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">"홈 화면에 추가"</span>를 탭하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    오른쪽 상단의 <span className="font-medium">"추가"</span>를 탭하세요
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-medium"
            >
              확인
            </button>
          </div>
        )}

        {/* Android / Chrome Instructions */}
        {(isAndroid || deferredPrompt) && (
          <div className="space-y-4">
            <p className="text-sm text-[#666]">
              홈 화면에 추가하면 앱처럼 빠르게 접속할 수 있어요
            </p>

            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-medium"
              >
                앱 설치하기
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      브라우저 메뉴 <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2"/>
                          <circle cx="12" cy="12" r="2"/>
                          <circle cx="12" cy="19" r="2"/>
                        </svg>
                      </span> 를 탭하세요
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">"홈 화면에 추가"</span> 또는 <span className="font-medium">"앱 설치"</span>를 탭하세요
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleDismiss}
              className="w-full py-3 border border-[#e5e5e5] rounded-xl text-sm"
            >
              나중에
            </button>
          </div>
        )}

        {/* Desktop fallback */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <div className="space-y-4">
            <p className="text-sm text-[#666]">
              모바일 기기에서 접속하시면 앱으로 설치하실 수 있어요
            </p>
            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-medium"
            >
              확인
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
