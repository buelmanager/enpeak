'use client'

import { useState } from 'react'

interface QuizModeSelectorProps {
  type: 'word' | 'sentence'
  onSelect: (mode: string, options: { reviewOnly: boolean; count: number }) => void
  onClose: () => void
  reviewCount: number
  totalCount: number
}

const WORD_MODES = [
  {
    id: 'flashcard',
    title: '플래시카드',
    description: '카드를 넘기며 단어를 복습해요',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="7" y="8" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="#f0fdfa" />
      </svg>
    ),
  },
  {
    id: 'multiple-choice',
    title: '4지선다',
    description: '보기 중 올바른 뜻을 골라요',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="16" y="4" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="4" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="16" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'spelling',
    title: '스펠링',
    description: '뜻을 보고 영단어를 직접 입력해요',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 20h18M8 14l3-8h1l3 8M9.5 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 10v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'listening',
    title: '리스닝',
    description: '발음을 듣고 뜻을 맞춰요',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 12v4a8 8 0 0016 0v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="10" y="4" width="8" height="12" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M14 24v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

const SENTENCE_MODES = [
  {
    id: 'flashcard',
    title: '플래시카드',
    description: '문장을 넘기며 복습해요',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="7" y="8" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="#f0fdfa" />
      </svg>
    ),
  },
  {
    id: 'gap-fill',
    title: '빈칸 채우기',
    description: '핵심 단어를 빈칸에 넣어요',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 10h6M12 10h4M20 10h4M4 16h8M16 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="12" y="14" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: 'translation',
    title: '영작',
    description: '한국어를 보고 영어로 써요',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 7h10M9 4v3M6 7c0 3 3 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 24l3-10 3 10M17 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const COUNT_OPTIONS = [5, 10, 20]

export default function QuizModeSelector({
  type,
  onSelect,
  onClose,
  reviewCount,
  totalCount,
}: QuizModeSelectorProps) {
  const [reviewOnly, setReviewOnly] = useState(false)
  const [count, setCount] = useState(10)

  const modes = type === 'word' ? WORD_MODES : SENTENCE_MODES
  const availableCount = reviewOnly ? reviewCount : totalCount

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: '#1a1a1a' }}>
              {type === 'word' ? '단어 퀴즈' : '문장 퀴즈'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Review Toggle */}
          <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-[#f5f5f0]">
            <div>
              <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                복습 모드
              </p>
              <p className="text-xs" style={{ color: '#8a8a8a' }}>
                복습 필요 {reviewCount}개 / 전체 {totalCount}개
              </p>
            </div>
            <button
              onClick={() => setReviewOnly(!reviewOnly)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                reviewOnly ? 'bg-[#0D9488]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  reviewOnly ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Count Selector */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
              문제 수
            </p>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  disabled={n > availableCount}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                    count === n
                      ? 'bg-[#0D9488] text-white'
                      : n > availableCount
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-[#f5f5f0] text-[#666] hover:bg-[#eeeee8]'
                  }`}
                >
                  {n}문제
                </button>
              ))}
            </div>
          </div>

          {/* Mode Cards */}
          <div className="grid grid-cols-2 gap-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() =>
                  onSelect(mode.id, {
                    reviewOnly,
                    count: Math.min(count, availableCount),
                  })
                }
                disabled={availableCount === 0}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-transparent transition-all ${
                  availableCount === 0
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'bg-[#f0fdfa] text-[#0D9488] hover:border-[#0D9488] active:scale-95'
                }`}
              >
                <div className="text-[#0D9488]">{mode.icon}</div>
                <span className="text-sm font-bold" style={{ color: availableCount === 0 ? '#ccc' : '#1a1a1a' }}>
                  {mode.title}
                </span>
                <span className="text-xs text-center" style={{ color: availableCount === 0 ? '#ccc' : '#8a8a8a' }}>
                  {mode.description}
                </span>
              </button>
            ))}
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
      `}</style>
    </div>
  )
}
