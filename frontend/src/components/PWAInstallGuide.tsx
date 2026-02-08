'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type BrowserType =
  | 'ios-safari'
  | 'ios-chrome'
  | 'ios-webview'  // 카카오톡, 인스타그램, 페이스북 등
  | 'android-chrome'
  | 'android-samsung'
  | 'android-webview'
  | 'desktop'
  | 'unknown'

function detectBrowser(): BrowserType {
  if (typeof window === 'undefined') return 'unknown'

  const ua = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)

  // 웹뷰 감지 (카카오톡, 인스타그램, 페이스북, 네이버, 라인 등)
  const isKakao = /kakaotalk/i.test(ua)
  const isInstagram = /instagram/i.test(ua)
  const isFacebook = /fban|fbav|fb_iab/i.test(ua)
  const isNaver = /naver/i.test(ua)
  const isLine = /line/i.test(ua)
  const isBand = /band/i.test(ua)
  const isWebView = isKakao || isInstagram || isFacebook || isNaver || isLine || isBand

  // iOS 웹뷰 추가 감지
  const isIOSWebView = isIOS && !/(safari)/i.test(ua) && /(mobile)/i.test(ua)

  if (isIOS) {
    if (isWebView || isIOSWebView) return 'ios-webview'
    if (/crios/i.test(ua)) return 'ios-chrome'
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'ios-safari'
    return 'ios-webview'
  }

  if (isAndroid) {
    if (isWebView) return 'android-webview'
    if (/samsungbrowser/i.test(ua)) return 'android-samsung'
    if (/chrome/i.test(ua)) return 'android-chrome'
    return 'android-webview'
  }

  return 'desktop'
}

function getWebViewName(): string {
  if (typeof window === 'undefined') return ''

  const ua = window.navigator.userAgent.toLowerCase()

  if (/kakaotalk/i.test(ua)) return '카카오톡'
  if (/instagram/i.test(ua)) return '인스타그램'
  if (/fban|fbav|fb_iab/i.test(ua)) return '페이스북'
  if (/naver/i.test(ua)) return '네이버'
  if (/line/i.test(ua)) return '라인'
  if (/band/i.test(ua)) return '밴드'

  return '인앱 브라우저'
}

interface PWAInstallGuideProps {
  isOpen?: boolean       // 외부에서 강제 열기
  onClose?: () => void   // 닫기 콜백
}

export default function PWAInstallGuide({ isOpen, onClose }: PWAInstallGuideProps = {}) {
  const [showGuide, setShowGuide] = useState(false)
  const [browserType, setBrowserType] = useState<BrowserType>('unknown')
  const [webViewName, setWebViewName] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [activeTab, setActiveTab] = useState<'install' | 'homescreen'>('install')

  // 외부 isOpen prop으로 열기
  useEffect(() => {
    if (isOpen) {
      const detected = detectBrowser()
      setBrowserType(detected)
      setWebViewName(getWebViewName())
      setShowGuide(true)
    }
  }, [isOpen])

  useEffect(() => {
    // 외부에서 제어하는 경우 자동 팝업 로직 스킵
    if (isOpen !== undefined) return

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

    // 이미 가이드를 닫은 적이 있는지 확인 (영구적으로 다시 안 보여줌)
    const dismissed = localStorage.getItem('pwa-guide-dismissed')
    if (dismissed) {
      return
    }

    // 이번 세션에서 이미 표시했는지 확인 (페이지 이동 시 중복 표시 방지)
    const sessionShown = sessionStorage.getItem('pwa-guide-shown')
    if (sessionShown) {
      return
    }

    // 브라우저 타입 감지
    const detected = detectBrowser()
    setBrowserType(detected)
    setWebViewName(getWebViewName())

    // Android: beforeinstallprompt 이벤트 리스닝
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowGuide(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // 모바일에서 가이드 표시 (2초 후) - 세션에 표시 기록
    let showTimer: ReturnType<typeof setTimeout> | null = null
    if (detected !== 'desktop') {
      showTimer = setTimeout(() => {
        setShowGuide(true)
        sessionStorage.setItem('pwa-guide-shown', 'true')
      }, 2000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      if (showTimer) clearTimeout(showTimer)
    }
  }, [isOpen])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setShowGuide(false)
          setIsInstalled(true)
        }
      } catch {
        // prompt already used or dismissed
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowGuide(false)
    if (onClose) {
      onClose()
    } else {
      // 자동 팝업 모드에서만 localStorage에 기록
      localStorage.setItem('pwa-guide-dismissed', Date.now().toString())
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enpeak.web.app'

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl)
      alert('URL이 복사되었습니다. 브라우저에 붙여넣기 하세요!')
    } catch {
      // clipboard API 실패 시 fallback
      const textarea = document.createElement('textarea')
      textarea.value = appUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy') // deprecated but kept as clipboard API fallback
      document.body.removeChild(textarea)
      alert('URL이 복사되었습니다. 브라우저에 붙여넣기 하세요!')
    }
  }

  const handleOpenInBrowser = () => {
    const url = appUrl
    const ua = window.navigator.userAgent.toLowerCase()

    // 카카오톡: 전용 URL 스킴으로 외부 브라우저 열기
    if (/kakaotalk/i.test(ua)) {
      window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url)
      return
    }

    // 라인: openExternalBrowser 파라미터
    if (/\bline\b/i.test(ua)) {
      const separator = url.includes('?') ? '&' : '?'
      window.location.href = url + separator + 'openExternalBrowser=1'
      return
    }

    // Android 웹뷰 (네이버, 페이스북, 인스타그램, 밴드 등): Chrome Intent
    if (browserType === 'android-webview') {
      window.location.href = `intent://${url.replace('https://', '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`
      return
    }

    // iOS 웹뷰: 자동 열기 불가, URL 복사 안내
    handleCopyUrl()
  }

  if (!showGuide) {
    return null
  }

  // 자동 팝업 모드에서 이미 설치된 경우 숨김
  if (isInstalled && isOpen === undefined) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center" onClick={handleDismiss}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom, 0px) + 24px))' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            {browserType.startsWith('ios') ? '홈 화면에 추가하기' : '앱 설치하기'}
          </h2>
          <button
            onClick={handleDismiss}
            aria-label="닫기"
            className="p-2 -mr-2 text-[#8a8a8a] hover:text-[#1a1a1a]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* App Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-[#f5f5f5] rounded-2xl">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center border border-[#e5e5e5] bg-white">
            <img src="/icons/icon-192.png" alt="EnPeak" className="w-12 h-12" />
          </div>
          <div>
            <h3 className="font-medium">EnPeak</h3>
            <p className="text-sm text-[#8a8a8a]">AI 영어 학습 앱</p>
          </div>
        </div>

        {/* iOS/Android 웹뷰 (카카오톡, 인스타그램 등) */}
        {(browserType === 'ios-webview' || browserType === 'android-webview') && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {webViewName}에서는 직접 설치가 어려워요
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Safari 또는 Chrome 브라우저에서 열어주세요
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f8f8] rounded-xl p-4 space-y-4">
              <p className="text-sm font-medium text-center">브라우저에서 여는 방법</p>

              {browserType === 'ios-webview' ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">우측 하단 메뉴 열기</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        화면 우측 하단의 <span className="font-medium">...</span> 또는 메뉴 버튼을 탭하세요
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">"Safari로 열기" 선택</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        메뉴에서 <span className="font-medium">"Safari로 열기"</span> 또는 <span className="font-medium">"기본 브라우저로 열기"</span>를 탭하세요
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Safari에서 앱 설치</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        Safari 하단의 공유 버튼 → "홈 화면에 추가"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">우측 상단 메뉴 열기</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        화면 우측 상단의 <span className="inline-flex items-center mx-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                          </svg>
                        </span> 버튼을 탭하세요
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">"다른 브라우저로 열기" 선택</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        <span className="font-medium">"Chrome으로 열기"</span> 또는 <span className="font-medium">"다른 브라우저로 열기"</span>를 탭하세요
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Chrome에서 앱 설치</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        Chrome 메뉴 → "앱 설치" 또는 "홈 화면에 추가"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {browserType === 'android-webview' ? (
                <>
                  <button
                    onClick={handleOpenInBrowser}
                    className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    브라우저에서 열기
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="w-full py-3 border border-[#e5e5e5] rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    URL 복사하기
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCopyUrl}
                    className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    URL 복사하기
                  </button>
                  <p className="text-xs text-center text-[#8a8a8a]">
                    복사 후 브라우저 주소창에 붙여넣기
                  </p>
                </>
              )}
              <button
                onClick={handleDismiss}
                className="w-full py-3 border border-[#e5e5e5] rounded-xl text-sm"
              >
                나중에
              </button>
            </div>
          </div>
        )}

        {/* iOS Safari */}
        {browserType === 'ios-safari' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                홈 화면에 추가하면 앱처럼 사용할 수 있어요
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">하단 공유 버튼 탭</p>
                  <p className="text-xs text-[#8a8a8a] mt-1">
                    화면 하단의 <span className="inline-flex items-center mx-1">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </span> 공유 버튼을 탭하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">"홈 화면에 추가" 선택</p>
                  <p className="text-xs text-[#8a8a8a] mt-1">
                    목록에서 <span className="inline-flex items-center mx-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </span> <span className="font-medium">홈 화면에 추가</span>를 찾아 탭하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">"추가" 버튼 탭</p>
                  <p className="text-xs text-[#8a8a8a] mt-1">
                    오른쪽 상단의 <span className="font-medium text-blue-500">추가</span>를 탭하면 완료!
                  </p>
                </div>
              </div>
            </div>

            {/* 시각적 가이드 */}
            <div className="bg-[#f8f8f8] rounded-xl p-4 flex items-center justify-center">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-[#8a8a8a]">공유</p>
                </div>
                <svg className="w-4 h-4 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-[#8a8a8a]">홈 화면에 추가</p>
                </div>
                <svg className="w-4 h-4 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-[#8a8a8a]">완료!</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium"
            >
              확인했어요
            </button>
          </div>
        )}

        {/* iOS Chrome */}
        {browserType === 'ios-chrome' && (() => {
          const iosMatch = typeof navigator !== 'undefined' ? navigator.userAgent.match(/OS (\d+)_(\d+)/) : null
          const iosVersion = iosMatch ? parseFloat(`${iosMatch[1]}.${iosMatch[2]}`) : 0
          const canShareInstall = iosVersion >= 16.4

          return (
            <div className="space-y-4">
              {canShareInstall ? (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-blue-700">
                      Chrome에서도 홈 화면에 추가할 수 있어요
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">공유 버튼 탭</p>
                        <p className="text-xs text-[#8a8a8a] mt-1">
                          브라우저 우측 상단의 <span className="inline-flex items-center mx-1">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </span> 공유 버튼을 탭하세요
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">"홈 화면에 추가" 선택</p>
                        <p className="text-xs text-[#8a8a8a] mt-1">
                          목록에서 <span className="font-medium">홈 화면에 추가</span>를 탭하세요
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">"추가" 확인</p>
                        <p className="text-xs text-[#8a8a8a] mt-1">
                          <span className="font-medium text-blue-500">추가</span>를 탭하면 완료!
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium"
                  >
                    확인했어요
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      홈 화면 추가는 Safari에서 가능해요
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">아래 URL 복사</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Safari 앱 열기</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">주소창에 붙여넣기 후 홈 화면에 추가</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    URL 복사하기
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 border border-[#e5e5e5] rounded-xl text-sm"
                  >
                    나중에
                  </button>
                </>
              )}
            </div>
          )
        })()}

        {/* Android Chrome / Samsung */}
        {(browserType === 'android-chrome' || browserType === 'android-samsung') && (
          <div className="space-y-4">
            {/* Tab selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('install')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'install'
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#f5f5f5] text-[#8a8a8a]'
                }`}
              >
                앱 설치하기
              </button>
              <button
                onClick={() => setActiveTab('homescreen')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'homescreen'
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#f5f5f5] text-[#8a8a8a]'
                }`}
              >
                홈 화면에 추가
              </button>
            </div>

            {/* 앱 설치하기 탭 */}
            {activeTab === 'install' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700">
                    앱으로 설치하면 독립 앱처럼 실행돼요
                  </p>
                </div>

                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium"
                  >
                    바로 설치하기
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">메뉴 열기</p>
                        <p className="text-xs text-[#8a8a8a] mt-1">
                          브라우저 우측 상단의 <span className="inline-flex items-center mx-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="2"/>
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="12" cy="19" r="2"/>
                            </svg>
                          </span> 버튼을 탭하세요
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">"앱 설치" 선택</p>
                        <p className="text-xs text-[#8a8a8a] mt-1">
                          메뉴에서 <span className="font-medium">"앱 설치"</span>를 찾아 탭하세요
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">"설치" 확인</p>
                        <p className="text-xs text-[#8a8a8a] mt-1">
                          확인 팝업에서 <span className="font-medium">"설치"</span>를 탭하세요
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 홈 화면에 추가 탭 */}
            {activeTab === 'homescreen' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700">
                    홈 화면에 바로가기를 추가하면 빠르게 접속할 수 있어요
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">메뉴 열기</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        브라우저 우측 상단의 <span className="inline-flex items-center mx-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                          </svg>
                        </span> 버튼을 탭하세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">"홈 화면에 추가" 선택</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        메뉴에서 <span className="font-medium">"홈 화면에 추가"</span>를 찾아 탭하세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">"추가" 확인</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        확인 팝업에서 <span className="font-medium">"추가"</span>를 탭하면 완료!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium"
            >
              확인했어요
            </button>
          </div>
        )}

        {/* Desktop / Unknown fallback */}
        {(browserType === 'desktop' || browserType === 'unknown') && (
          <div className="space-y-4">
            <p className="text-sm text-[#666]">
              모바일 기기에서 접속하시면 앱으로 설치하실 수 있어요
            </p>

            <div className="bg-[#f8f8f8] rounded-xl p-4">
              <p className="text-sm font-medium mb-2">모바일에서 접속하기</p>
              <p className="text-xs text-[#8a8a8a]">
                앱 URL을 모바일 브라우저에서 열어주세요
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-medium"
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
