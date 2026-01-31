'use client'

import { useConversationSettings } from '@/contexts/ConversationSettingsContext'

interface ConversationSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConversationSettingsPanel({ isOpen, onClose }: ConversationSettingsPanelProps) {
  const { settings, toggleAutoTTS, toggleAutoRecord, setInputMode } = useConversationSettings()

  if (!isOpen) return null

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#e5e5e5] rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h3 className="font-medium">대화 설정</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#8a8a8a] hover:text-[#1a1a1a]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 설정 내용 */}
        <div className="px-6 py-6 space-y-6 pb-safe">
          {/* AI 응답 읽어주기 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">AI 응답 읽어주기</p>
              <p className="text-xs text-[#8a8a8a] mt-0.5">AI가 대답하면 자동으로 읽어줘요</p>
            </div>
            <button
              onClick={toggleAutoTTS}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.autoTTS ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.autoTTS ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 자동 음성 입력 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">자동 음성 입력</p>
              <p className="text-xs text-[#8a8a8a] mt-0.5">AI 응답 후 자동으로 녹음 시작</p>
            </div>
            <button
              onClick={toggleAutoRecord}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.autoRecord ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.autoRecord ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 입력 방식 */}
          <div>
            <p className="font-medium text-sm mb-3">입력 방식</p>
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('voice')}
                className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
                  settings.inputMode === 'voice'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-[#f5f5f5] text-[#8a8a8a]'
                }`}
              >
                음성만
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
                  settings.inputMode === 'text'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-[#f5f5f5] text-[#8a8a8a]'
                }`}
              >
                텍스트만
              </button>
              <button
                onClick={() => setInputMode('both')}
                className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
                  settings.inputMode === 'both'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-[#f5f5f5] text-[#8a8a8a]'
                }`}
              >
                둘 다
              </button>
            </div>
          </div>
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
          .pb-safe {
            padding-bottom: max(24px, env(safe-area-inset-bottom));
          }
        `}</style>
      </div>
    </>
  )
}
