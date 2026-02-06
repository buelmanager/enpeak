'use client'

interface ListeningIndicatorProps {
  isActive: boolean
  onCancel?: () => void
  audioLevel?: number // 0~1, 실제 오디오 레벨
  warningMessage?: string | null // 무음/소음 경고 메시지
}

export default function ListeningIndicator({ isActive, onCancel, audioLevel, warningMessage }: ListeningIndicatorProps) {
  if (!isActive) return null

  // 오디오 레벨에 따른 음파 높이 계산 (8px ~ 20px)
  const getBarHeight = (baseDelay: number) => {
    if (audioLevel === undefined || audioLevel === null) return undefined // CSS 애니메이션 사용
    // 레벨에 따라 최소 8px ~ 최대 24px
    const minHeight = 8
    const maxHeight = 24
    const variation = Math.sin(Date.now() / 300 + baseDelay) * 0.3 // 약간의 변동
    const level = Math.min(1, audioLevel + Math.max(0, variation))
    return `${minHeight + level * (maxHeight - minHeight)}px`
  }

  const useRealLevel = audioLevel !== undefined && audioLevel !== null

  return (
    <div className="flex flex-col">
      {/* 경고 메시지 */}
      {warningMessage && (
        <div className="px-6 py-2 bg-[#2a2a2a] text-center">
          <span className="text-xs text-[#ffb84d]">{warningMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-3 bg-[#1a1a1a] text-white">
        <div className="flex items-center gap-3">
          {/* 음파 애니메이션 */}
          <div className="flex items-center gap-[3px] h-5">
            {[0, 150, 300, 450, 200].map((delay, idx) => (
              <div
                key={idx}
                className={`w-[3px] bg-white rounded-full ${!useRealLevel ? 'animate-soundwave' : ''}`}
                style={{
                  ...(useRealLevel
                    ? { height: getBarHeight(delay / 150), transition: 'height 0.1s ease-out' }
                    : { animationDelay: `${delay}ms` }
                  ),
                }}
              />
            ))}
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
    </div>
  )
}
