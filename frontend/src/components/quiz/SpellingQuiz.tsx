'use client'

import { useState, useRef, useEffect } from 'react'
import { SavedWord } from '@/lib/savedWords'

interface SpellingQuizProps {
  word: SavedWord
  onResult: (quality: number) => void
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  )

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

export default function SpellingQuiz({ word, onResult }: SpellingQuizProps) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [resultType, setResultType] = useState<'correct' | 'close' | 'wrong' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  // Replace word in example with blanks
  const maskedExample = word.example
    ? word.example.replace(
        new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        '___'
      )
    : null

  const handleSubmit = () => {
    if (!input.trim() || submitted) return
    setSubmitted(true)

    const userAnswer = input.trim().toLowerCase()
    const correctAnswer = word.word.toLowerCase()

    if (userAnswer === correctAnswer) {
      setResultType('correct')
      setTimeout(() => onResult(5), 1200)
    } else {
      const distance = levenshteinDistance(userAnswer, correctAnswer)
      if (distance <= 2) {
        setResultType('close')
        setTimeout(() => onResult(3), 1500)
      } else {
        setResultType('wrong')
        setTimeout(() => onResult(1), 1500)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Meaning */}
      <div className="flex flex-col items-center mt-8 mb-6">
        <p className="text-sm font-medium mb-2" style={{ color: '#8a8a8a' }}>
          뜻을 보고 영단어를 입력하세요
        </p>
        <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
          {word.meaning}
        </p>
      </div>

      {/* Masked Example */}
      {maskedExample && (
        <div className="w-full max-w-sm p-4 mb-6 rounded-2xl bg-white">
          <p className="text-sm text-center leading-relaxed" style={{ color: '#666' }}>
            {maskedExample}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="w-full max-w-sm mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          placeholder="영단어 입력"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full px-5 py-4 rounded-2xl text-center text-lg font-medium outline-none border-2 transition-colors ${
            submitted
              ? resultType === 'correct'
                ? 'border-emerald-400 bg-emerald-50'
                : resultType === 'close'
                ? 'border-amber-400 bg-amber-50'
                : 'border-red-400 bg-red-50'
              : 'border-gray-200 bg-white focus:border-[#0D9488]'
          }`}
          style={{ color: '#1a1a1a' }}
        />
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={`w-full max-w-sm py-3.5 rounded-2xl font-bold text-base transition-all ${
            input.trim()
              ? 'bg-[#0D9488] text-white active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          확인
        </button>
      )}

      {/* Result Feedback */}
      {submitted && (
        <div className="flex flex-col items-center mt-4 animate-fade-in">
          {resultType === 'correct' && (
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#059669" />
                <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-emerald-600 font-bold text-base">정답!</p>
            </div>
          )}
          {resultType === 'close' && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-amber-600 font-bold text-base">거의 맞았어요!</p>
              <p className="text-sm" style={{ color: '#666' }}>
                정답: <span className="font-bold text-[#0D9488]">{word.word}</span>
              </p>
            </div>
          )}
          {resultType === 'wrong' && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-red-500 font-bold text-base">틀렸어요</p>
              <p className="text-sm" style={{ color: '#666' }}>
                정답: <span className="font-bold text-[#0D9488]">{word.word}</span>
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
