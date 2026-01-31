'use client'

interface ListeningIndicatorProps {
  isActive: boolean
  onCancel?: () => void
}

export default function ListeningIndicator({ isActive, onCancel }: ListeningIndicatorProps) {
  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-2xl">
        {/* 파동 애니메이션 */}
        <div className="relative">
          {/* 외부 파동 1 */}
          <div className="absolute inset-[-20px] rounded-full border-2 border-[#1a1a1a] opacity-20 animate-ping" style={{ animationDuration: '1.5s' }} />
          {/* 외부 파동 2 */}
          <div className="absolute inset-[-10px] rounded-full border-2 border-[#1a1a1a] opacity-30 animate-pulse" />
          {/* 중앙 원 */}
          <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-lg">
            {/* 마이크 아이콘 */}
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        </div>

        {/* 텍스트 */}
        <p className="text-base text-[#1a1a1a] font-medium tracking-wide">듣고 있어요...</p>

        {/* 취소 버튼 */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-8 py-2.5 text-sm text-[#8a8a8a] border border-[#e5e5e5] rounded-full hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
          >
            취소
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
