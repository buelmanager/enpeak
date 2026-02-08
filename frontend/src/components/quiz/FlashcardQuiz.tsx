'use client'

import { useState } from 'react'
import { SavedWord } from '@/lib/savedWords'
import { useTTS } from '@/contexts/TTSContext'

interface FlashcardQuizProps {
  word: SavedWord
  onResult: (quality: number) => void
}

export default function FlashcardQuiz({ word, onResult }: FlashcardQuizProps) {
  const [flipped, setFlipped] = useState(false)
  const { speak } = useTTS()

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(word.word)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Card */}
      <div
        className="w-full max-w-sm cursor-pointer perspective-1000"
        onClick={() => !flipped && setFlipped(true)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="w-full min-h-[240px] flex flex-col items-center justify-center p-8 rounded-2xl bg-white shadow-md"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-3xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
              {word.word}
            </p>
            {word.pronunciation && (
              <p className="text-sm mb-4" style={{ color: '#8a8a8a' }}>
                {word.pronunciation}
              </p>
            )}
            <button
              onClick={handleSpeak}
              className="p-3 rounded-full bg-[#f0fdfa] text-[#0D9488] hover:bg-[#e0f5f0] active:scale-95 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <p className="text-sm mt-6" style={{ color: '#8a8a8a' }}>
              탭하여 뜻 보기
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute top-0 left-0 w-full min-h-[240px] flex flex-col items-center justify-center p-8 rounded-2xl bg-white shadow-md"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-lg font-bold mb-2" style={{ color: '#1a1a1a' }}>
              {word.word}
            </p>
            <p className="text-xl mb-4" style={{ color: '#0D9488' }}>
              {word.meaning}
            </p>
            {word.example && (
              <p className="text-sm text-center leading-relaxed" style={{ color: '#666' }}>
                {word.example}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rating Buttons (shown after flip) */}
      {flipped && (
        <div className="flex gap-3 mt-8 w-full max-w-sm animate-fade-in">
          <button
            onClick={() => onResult(1)}
            className="flex-1 py-3 rounded-2xl bg-red-50 text-red-500 font-medium text-sm active:scale-95 transition-transform"
          >
            모르겠어요
          </button>
          <button
            onClick={() => onResult(3)}
            className="flex-1 py-3 rounded-2xl bg-amber-50 text-amber-600 font-medium text-sm active:scale-95 transition-transform"
          >
            어렵지만 맞았어요
          </button>
          <button
            onClick={() => onResult(5)}
            className="flex-1 py-3 rounded-2xl bg-[#f0fdfa] text-[#0D9488] font-medium text-sm active:scale-95 transition-transform"
          >
            알아요
          </button>
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
