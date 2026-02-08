'use client'

import { useState, useRef, useEffect } from 'react'
import { SavedSentence } from '@/lib/savedSentences'
import { useTTS } from '@/contexts/TTSContext'

interface TranslationQuizProps {
  sentence: SavedSentence
  onResult: (quality: number) => void
}

function calculateWordOverlap(userText: string, correctText: string): number {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,!?;:'"()\-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 0)

  const userWords = normalize(userText)
  const correctWords = normalize(correctText)

  if (correctWords.length === 0) return 0
  if (userWords.length === 0) return 0

  let matchCount = 0
  const used = new Set<number>()

  for (const uWord of userWords) {
    for (let i = 0; i < correctWords.length; i++) {
      if (!used.has(i) && correctWords[i] === uWord) {
        matchCount++
        used.add(i)
        break
      }
    }
  }

  // Use the larger word count as denominator for fairness
  const denominator = Math.max(userWords.length, correctWords.length)
  return (matchCount / denominator) * 100
}

export default function TranslationQuiz({
  sentence,
  onResult,
}: TranslationQuizProps) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [overlap, setOverlap] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { speak } = useTTS()

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 300)
  }, [])

  const handleSubmit = () => {
    if (!input.trim() || submitted) return
    setSubmitted(true)

    const pct = calculateWordOverlap(input, sentence.sentence)
    setOverlap(pct)

    speak(sentence.sentence)

    let quality: number
    if (pct >= 80) {
      quality = 5
    } else if (pct >= 50) {
      quality = 3
    } else {
      quality = 1
    }

    setTimeout(() => onResult(quality), 2000)
  }

  const getResultLabel = () => {
    if (overlap >= 80) return { text: '훌륭해요!', color: 'text-emerald-600' }
    if (overlap >= 50) return { text: '거의 맞았어요!', color: 'text-amber-600' }
    return { text: '다시 도전해보세요', color: 'text-red-500' }
  }

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="flex flex-col items-center mt-6 mb-6">
        <p className="text-sm font-medium mb-2" style={{ color: '#8a8a8a' }}>
          한국어를 보고 영어로 작성하세요
        </p>
      </div>

      {/* Korean Translation */}
      <div className="w-full max-w-sm p-5 rounded-2xl bg-white shadow-sm mb-6">
        <p
          className="text-lg font-bold text-center leading-relaxed"
          style={{ color: '#1a1a1a' }}
        >
          {sentence.translation}
        </p>
      </div>

      {/* Text Input */}
      <div className="w-full max-w-sm mb-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          placeholder="영어 문장을 입력하세요"
          rows={3}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full px-4 py-3 rounded-2xl text-base outline-none border-2 resize-none transition-colors ${
            submitted
              ? overlap >= 80
                ? 'border-emerald-400 bg-emerald-50'
                : overlap >= 50
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

      {/* Result */}
      {submitted && (
        <div className="w-full max-w-sm flex flex-col items-center mt-4 animate-fade-in">
          {/* Feedback */}
          <div className="flex items-center gap-2 mb-3">
            <p className={`font-bold text-base ${getResultLabel().color}`}>
              {getResultLabel().text}
            </p>
            <span className="text-sm font-medium" style={{ color: '#8a8a8a' }}>
              ({Math.round(overlap)}%)
            </span>
          </div>

          {/* Correct Sentence */}
          <div className="w-full p-4 rounded-2xl bg-[#f0fdfa]">
            <p className="text-xs font-medium mb-1" style={{ color: '#8a8a8a' }}>
              정답
            </p>
            <p className="text-base font-medium leading-relaxed" style={{ color: '#0D9488' }}>
              {sentence.sentence}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
