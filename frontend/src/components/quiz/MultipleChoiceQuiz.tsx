'use client'

import { useState, useMemo } from 'react'
import { SavedWord } from '@/lib/savedWords'
import { useTTS } from '@/contexts/TTSContext'

interface MultipleChoiceQuizProps {
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

export default function MultipleChoiceQuiz({
  word,
  allWords,
  onResult,
}: MultipleChoiceQuizProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const { speak } = useTTS()

  const choices = useMemo(() => {
    // Get wrong answers from other words
    const others = allWords.filter(
      (w) => w.word.toLowerCase() !== word.word.toLowerCase()
    )
    const shuffledOthers = shuffleArray(others)
    const wrongAnswers = shuffledOthers.slice(0, 3).map((w) => w.meaning)

    // If not enough wrong answers, create variations
    while (wrongAnswers.length < 3) {
      wrongAnswers.push(`(${wrongAnswers.length + 1}) ${word.meaning}`)
    }

    // Combine and shuffle
    const allChoices = shuffleArray([word.meaning, ...wrongAnswers])
    return allChoices
  }, [word, allWords])

  const correctIndex = choices.indexOf(word.meaning)

  const handleSelect = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)

    const isCorrect = index === correctIndex
    speak(word.word)

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
      {/* Word Display */}
      <div className="flex flex-col items-center mt-8 mb-10">
        <p className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
          {word.word}
        </p>
        {word.pronunciation && (
          <p className="text-sm" style={{ color: '#8a8a8a' }}>
            {word.pronunciation}
          </p>
        )}
      </div>

      {/* Choices */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={answered}
            className={`w-full p-4 rounded-2xl text-left transition-all ${getButtonStyle(index)}`}
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
                style={{ color: getTextColor(index) }}
              >
                {choice}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {answered && (
        <div className="mt-6 animate-fade-in">
          {selected === correctIndex ? (
            <p className="text-emerald-600 font-bold text-base">정답!</p>
          ) : (
            <p className="text-red-500 font-medium text-sm">
              정답: {word.meaning}
            </p>
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
