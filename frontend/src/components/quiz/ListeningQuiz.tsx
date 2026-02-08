'use client'

import { useState, useMemo } from 'react'
import { SavedWord } from '@/lib/savedWords'
import { useTTS } from '@/contexts/TTSContext'

interface ListeningQuizProps {
  word: SavedWord
  allWords: SavedWord[]
  onResult: (quality: number) => void
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ListeningQuiz({
  word,
  allWords,
  onResult,
}: ListeningQuizProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const { speak, isSpeaking } = useTTS()

  const choices = useMemo(() => {
    const others = allWords.filter(
      (w) => w.word.toLowerCase() !== word.word.toLowerCase()
    )
    const shuffledOthers = shuffleArray(others)
    const wrongAnswers = shuffledOthers.slice(0, 3).map((w) => w.meaning)

    while (wrongAnswers.length < 3) {
      wrongAnswers.push(`(${wrongAnswers.length + 1}) ${word.meaning}`)
    }

    return shuffleArray([word.meaning, ...wrongAnswers])
  }, [word, allWords])

  const correctIndex = choices.indexOf(word.meaning)

  const handlePlay = () => {
    speak(word.word)
    setHasPlayed(true)
  }

  const handleSelect = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)

    const isCorrect = index === correctIndex

    setTimeout(() => {
      onResult(isCorrect ? 4 : 1)
    }, 1200)
  }

  const getButtonStyle = (index: number) => {
    if (!answered) {
      return 'bg-white border-2 border-gray-200 hover:border-[#0D9488] active:scale-[0.98]'
    }
    if (index === correctIndex) {
      return 'bg-emerald-50 border-2 border-emerald-400'
    }
    if (index === selected && index !== correctIndex) {
      return 'bg-red-50 border-2 border-red-400'
    }
    return 'bg-white border-2 border-gray-200 opacity-50'
  }

  const getTextColor = (index: number) => {
    if (!answered) return '#1a1a1a'
    if (index === correctIndex) return '#059669'
    if (index === selected && index !== correctIndex) return '#ef4444'
    return '#999'
  }

  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Play Button */}
      <div className="flex flex-col items-center mt-8 mb-8">
        <p className="text-sm font-medium mb-4" style={{ color: '#8a8a8a' }}>
          발음을 듣고 뜻을 고르세요
        </p>
        <button
          onClick={handlePlay}
          disabled={isSpeaking}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isSpeaking
              ? 'bg-[#0D9488] animate-pulse'
              : 'bg-[#f0fdfa] hover:bg-[#e0f5f0]'
          }`}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M16.5 7.5L9.75 13.5H4.5V22.5H9.75L16.5 28.5V7.5Z"
              fill="#0D9488"
            />
            <path
              d="M23.31 12.69C24.71 14.09 25.5 15.99 25.5 18C25.5 20.01 24.71 21.91 23.31 23.31M27.54 8.46C30.01 10.93 31.5 14.35 31.5 18C31.5 21.65 30.01 25.07 27.54 27.54"
              stroke="#0D9488"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {hasPlayed && !answered && (
          <button
            onClick={handlePlay}
            disabled={isSpeaking}
            className="mt-3 text-sm font-medium text-[#0D9488] hover:underline"
          >
            다시 듣기
          </button>
        )}
      </div>

      {/* Choices */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={answered || !hasPlayed}
            className={`w-full p-4 rounded-2xl text-left transition-all ${
              !hasPlayed
                ? 'bg-gray-50 border-2 border-gray-100 cursor-not-allowed'
                : getButtonStyle(index)
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  answered && index === correctIndex
                    ? 'bg-emerald-400 text-white'
                    : answered && index === selected && index !== correctIndex
                    ? 'bg-red-400 text-white'
                    : 'bg-gray-100 text-[#666]'
                }`}
              >
                {index + 1}
              </div>
              <span
                className="text-base font-medium"
                style={{ color: !hasPlayed ? '#ccc' : getTextColor(index) }}
              >
                {choice}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {answered && (
        <div className="mt-6 flex flex-col items-center animate-fade-in">
          {selected === correctIndex ? (
            <p className="text-emerald-600 font-bold text-base">정답!</p>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <p className="text-red-500 font-medium text-sm">
                정답: {word.meaning}
              </p>
              <p className="text-sm font-bold" style={{ color: '#0D9488' }}>
                {word.word}
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
