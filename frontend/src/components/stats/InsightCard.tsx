'use client'

import { useState } from 'react'

interface InsightCardProps {
  messages: string[]
}

export default function InsightCard({ messages }: InsightCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (messages.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : messages.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev < messages.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="bg-gradient-to-r from-[#0D9488] to-[#14b8a6] rounded-2xl p-5 mb-4 text-white relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Insight</span>
      </div>

      <div className="min-h-[28px] flex items-center">
        <p className="text-base font-medium leading-snug">{messages[currentIndex]}</p>
      </div>

      {messages.length > 1 && (
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {messages.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrev} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={handleNext} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
