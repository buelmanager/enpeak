'use client'

interface ListeningIndicatorProps {
  isActive: boolean
  onCancel?: () => void
}

export default function ListeningIndicator({ isActive, onCancel }: ListeningIndicatorProps) {
  if (!isActive) return null

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#1a1a1a] text-white">
      <div className="flex items-center gap-3">
        {/* 음파 애니메이션 */}
        <div className="flex items-center gap-[3px] h-5">
          <div className="w-[3px] bg-white rounded-full animate-soundwave" style={{ animationDelay: '0ms' }} />
          <div className="w-[3px] bg-white rounded-full animate-soundwave" style={{ animationDelay: '150ms' }} />
          <div className="w-[3px] bg-white rounded-full animate-soundwave" style={{ animationDelay: '300ms' }} />
          <div className="w-[3px] bg-white rounded-full animate-soundwave" style={{ animationDelay: '450ms' }} />
          <div className="w-[3px] bg-white rounded-full animate-soundwave" style={{ animationDelay: '200ms' }} />
        </div>
        <span className="text-sm font-medium">듣고 있어요...</span>
      </div>

      {/* 취소 버튼 */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-sm text-white/80 border border-white/30 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          취소
        </button>
      )}

      <style jsx>{`
        @keyframes soundwave {
          0%, 100% {
            height: 8px;
          }
          50% {
            height: 20px;
          }
        }
        .animate-soundwave {
          animation: soundwave 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
