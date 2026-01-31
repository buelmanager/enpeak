'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'chat-settings-guide-shown'

interface ChatSettingsGuideProps {
  onOpenSettings: () => void
}

export default function ChatSettingsGuide({ onOpenSettings }: ChatSettingsGuideProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 처음 방문한 사용자인지 확인
    const hasSeenGuide = localStorage.getItem(STORAGE_KEY)
    if (!hasSeenGuide) {
      // 약간의 딜레이 후 표시 (페이지 로드 후)
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
  }

  const handleOpenSettings = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
    onOpenSettings()
  }

  if (!isVisible) return null

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleDismiss}
      />

      {/* 가이드 팝업 */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl z-50 shadow-xl max-w-sm mx-auto animate-fade-in">
        {/* 헤더 이미지/아이콘 영역 */}
        <div className="pt-8 pb-4 flex justify-center">
          <div className="relative">
            {/* 배경 원 */}
            <div className="w-20 h-20 rounded-full bg-[#f5f5f5] flex items-center justify-center">
              {/* 설정 아이콘 */}
              <svg className="w-10 h-10 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {/* 포인터 화살표 */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 텍스트 내용 */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">
            대화 설정을 확인해보세요
          </h3>
          <p className="text-sm text-[#8a8a8a] leading-relaxed mb-6">
            우측 상단의 설정 버튼을 눌러<br />
            더 편리하게 대화할 수 있어요
          </p>

          {/* 기능 목록 */}
          <div className="bg-[#faf9f7] rounded-2xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a1a]">AI 응답 읽어주기</p>
                <p className="text-xs text-[#8a8a8a]">AI가 영어로 대답을 읽어줘요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a1a]">자동 음성 입력</p>
                <p className="text-xs text-[#8a8a8a]">AI 응답 후 자동으로 말할 수 있어요</p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 text-sm text-[#8a8a8a] rounded-xl border border-[#e5e5e5] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
            >
              나중에
            </button>
            <button
              onClick={handleOpenSettings}
              className="flex-1 py-3 text-sm text-white bg-[#1a1a1a] rounded-xl hover:bg-[#333] transition-colors"
            >
              설정 열기
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
