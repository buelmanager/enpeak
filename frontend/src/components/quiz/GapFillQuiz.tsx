'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { SavedSentence } from '@/lib/savedSentences'
import { useTTS } from '@/contexts/TTSContext'

interface GapFillQuizProps {
  sentence: SavedSentence
  onResult: (quality: number) => void
}

interface GapSegment {
  type: 'text' | 'gap'
  value: string // for text: the text content; for gap: the expected answer
  index?: number // gap index
}

export default function GapFillQuiz({ sentence, onResult }: GapFillQuizProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [gapResults, setGapResults] = useState<Record<number, boolean>>({})
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { speak } = useTTS()

  const keyWords = useMemo(() => {
    return sentence.keyWords && sentence.keyWords.length > 0
      ? sentence.keyWords
      : // Fallback: pick 1-2 words of 4+ chars
        sentence.sentence
          .replace(/[.,!?;:'"()]/g, '')
          .split(/\s+/)
          .filter((w) => w.length >= 4)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
  }, [sentence])

  // Build segments: split the sentence into text and gap parts
  const segments = useMemo(() => {
    const result: GapSegment[] = []
    let remaining = sentence.sentence
    let gapIndex = 0

    for (const kw of keyWords) {
      const regex = new RegExp(
        kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      )
      const match = remaining.match(regex)
      if (match && match.index !== undefined) {
        // Text before the gap
        if (match.index > 0) {
          result.push({ type: 'text', value: remaining.slice(0, match.index) })
        }
        // The gap
        result.push({ type: 'gap', value: match[0], index: gapIndex })
        gapIndex++
        remaining = remaining.slice(match.index + match[0].length)
      }
    }

    // Remaining text
    if (remaining) {
      result.push({ type: 'text', value: remaining })
    }

    return result
  }, [sentence, keyWords])

  const gapCount = segments.filter((s) => s.type === 'gap').length

  useEffect(() => {
    // Focus first gap
    setTimeout(() => inputRefs.current[0]?.focus(), 300)
  }, [])

  const handleInputChange = (gapIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [gapIndex]: value }))
  }

  const handleKeyDown = (gapIndex: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Move to next gap or submit
      if (gapIndex < gapCount - 1) {
        inputRefs.current[gapIndex + 1]?.focus()
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = () => {
    if (submitted) return

    const results: Record<number, boolean> = {}
    let correctCount = 0

    segments.forEach((seg) => {
      if (seg.type === 'gap' && seg.index !== undefined) {
        const userAnswer = (answers[seg.index] || '').trim().toLowerCase()
        const correctAnswer = seg.value.toLowerCase()
        const isCorrect = userAnswer === correctAnswer
        results[seg.index] = isCorrect
        if (isCorrect) correctCount++
      }
    })

    setGapResults(results)
    setSubmitted(true)

    speak(sentence.sentence)

    let quality: number
    if (correctCount === gapCount) {
      quality = 5
    } else if (correctCount > 0) {
      quality = 3
    } else {
      quality = 1
    }

    setTimeout(() => onResult(quality), 1800)
  }

  const allFilled = Object.keys(answers).length === gapCount &&
    Object.values(answers).every((v) => v.trim().length > 0)

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="flex flex-col items-center mt-6 mb-6">
        <p className="text-sm font-medium mb-2" style={{ color: '#8a8a8a' }}>
          빈칸에 알맞은 단어를 입력하세요
        </p>
      </div>

      {/* Sentence with gaps */}
      <div className="w-full max-w-sm p-5 rounded-2xl bg-white shadow-sm mb-4">
        <div className="flex flex-wrap items-baseline gap-y-3 leading-relaxed text-base" style={{ color: '#1a1a1a' }}>
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return (
                <span key={i} className="font-medium">
                  {seg.value}
                </span>
              )
            }

            const gapIdx = seg.index!
            const isCorrect = gapResults[gapIdx]
            const inputWidth = Math.max(seg.value.length * 10 + 20, 60)

            return (
              <span key={i} className="inline-flex flex-col items-center mx-1">
                <input
                  ref={(el) => {
                    inputRefs.current[gapIdx] = el
                  }}
                  type="text"
                  value={answers[gapIdx] || ''}
                  onChange={(e) => handleInputChange(gapIdx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(gapIdx, e)}
                  disabled={submitted}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`px-2 py-1 text-center text-base font-medium border-b-2 outline-none bg-transparent transition-colors ${
                    submitted
                      ? isCorrect
                        ? 'border-emerald-400 text-emerald-600'
                        : 'border-red-400 text-red-500'
                      : 'border-[#0D9488] text-[#1a1a1a] focus:border-[#0D9488]'
                  }`}
                  style={{ width: `${inputWidth}px` }}
                />
                {submitted && !isCorrect && (
                  <span className="text-xs text-[#0D9488] font-medium mt-1">
                    {seg.value}
                  </span>
                )}
              </span>
            )
          })}
        </div>
      </div>

      {/* Translation hint */}
      <div className="w-full max-w-sm p-3 rounded-xl bg-[#f5f5f0] mb-6">
        <p className="text-sm text-center" style={{ color: '#666' }}>
          {sentence.translation}
        </p>
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className={`w-full max-w-sm py-3.5 rounded-2xl font-bold text-base transition-all ${
            allFilled
              ? 'bg-[#0D9488] text-white active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          확인
        </button>
      )}

      {/* Feedback */}
      {submitted && (
        <div className="mt-4 animate-fade-in">
          {Object.values(gapResults).every((v) => v) ? (
            <p className="text-emerald-600 font-bold text-base">정답!</p>
          ) : Object.values(gapResults).some((v) => v) ? (
            <p className="text-amber-600 font-bold text-base">부분 정답!</p>
          ) : (
            <p className="text-red-500 font-bold text-base">틀렸어요</p>
          )}
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
