'use client'

import { useState, useCallback } from 'react'
import { SavedWord } from '@/lib/savedWords'
import FlashcardQuiz from './FlashcardQuiz'
import MultipleChoiceQuiz from './MultipleChoiceQuiz'
import SpellingQuiz from './SpellingQuiz'
import ListeningQuiz from './ListeningQuiz'

interface WordQuizOverlayProps {
  words: SavedWord[]
  mode: 'flashcard' | 'multiple-choice' | 'spelling' | 'listening'
  onClose: () => void
  onComplete: (results: { word: string; quality: number }[]) => void
}

export default function WordQuizOverlay({
  words,
  mode,
  onClose,
  onComplete,
}: WordQuizOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<{ word: string; quality: number }[]>([])
  const [showResults, setShowResults] = useState(false)

  const total = words.length
  const currentWord = words[currentIndex]

  const handleResult = useCallback(
    (quality: number) => {
      const newResults = [...results, { word: currentWord.word, quality }]
      setResults(newResults)

      if (currentIndex + 1 < total) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setShowResults(true)
      }
    },
    [currentIndex, currentWord, results, total]
  )

  const correctCount = results.filter((r) => r.quality >= 3).length
  const wrongCount = results.filter((r) => r.quality < 3).length
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0

  // Circumference for score circle (r=54)
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (circumference * scorePercent) / 100

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 bg-[#faf9f7] flex flex-col items-center justify-center px-6">
        {/* Score Circle */}
        <div className="relative w-36 h-36 mb-8">
          <svg width="144" height="144" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r="54"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="10"
            />
            <circle
              cx="72"
              cy="72"
              r="54"
              fill="none"
              stroke="#0D9488"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 72 72)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
              {scorePercent}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0D9488]" />
            <span className="text-sm" style={{ color: '#666' }}>
              맞음 {correctCount}개
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-sm" style={{ color: '#666' }}>
              틀림 {wrongCount}개
            </span>
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={() => onComplete(results)}
          className="w-full max-w-xs py-3.5 rounded-2xl bg-[#0D9488] text-white font-bold text-base active:scale-95 transition-transform"
        >
          완료
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#faf9f7] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-medium" style={{ color: '#666' }}>
          {currentIndex + 1} / {total}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-4">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 flex flex-col px-4 pb-6 overflow-y-auto">
        {mode === 'flashcard' && (
          <FlashcardQuiz
            key={currentIndex}
            word={currentWord}
            onResult={handleResult}
          />
        )}
        {mode === 'multiple-choice' && (
          <MultipleChoiceQuiz
            key={currentIndex}
            word={currentWord}
            allWords={words}
            onResult={handleResult}
          />
        )}
        {mode === 'spelling' && (
          <SpellingQuiz
            key={currentIndex}
            word={currentWord}
            onResult={handleResult}
          />
        )}
        {mode === 'listening' && (
          <ListeningQuiz
            key={currentIndex}
            word={currentWord}
            allWords={words}
            onResult={handleResult}
          />
        )}
      </div>
    </div>
  )
}
