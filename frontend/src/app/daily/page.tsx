'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface DailyExpression {
  expression: string
  meaning: string
  example: string
  example_ko: string
  category: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export default function DailyExpressionPage() {
  const [expression, setExpression] = useState<DailyExpression | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMeaning, setShowMeaning] = useState(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    fetchDailyExpression()
  }, [])

  const fetchDailyExpression = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/rag/daily-expression`)
      if (response.ok) {
        const data = await response.json()
        setExpression(data)
      } else {
        // 폴백: 하드코딩된 표현
        setExpression({
          expression: "break the ice",
          meaning: "어색한 분위기를 깨다, 대화를 시작하다",
          example: "I tried to break the ice by asking about his hobbies.",
          example_ko: "나는 그의 취미에 대해 물어보며 어색한 분위기를 깨려고 했다.",
          category: "daily"
        })
      }
    } catch {
      setExpression({
        expression: "break the ice",
        meaning: "어색한 분위기를 깨다, 대화를 시작하다",
        example: "I tried to break the ice by asking about his hobbies.",
        example_ko: "나는 그의 취미에 대해 물어보며 어색한 분위기를 깨려고 했다.",
        category: "daily"
      })
    } finally {
      setLoading(false)
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const handleRefresh = () => {
    setShowMeaning(false)
    setShowExample(false)
    fetchDailyExpression()
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Header */}
      <header className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-medium">오늘의 표현</h1>
          <button onClick={handleRefresh} className="p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : expression ? (
          <>
            {/* Expression Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#f0f0f0]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#8a8a8a] tracking-wide uppercase">
                  {expression.category}
                </span>
                <button
                  onClick={() => speakText(expression.expression)}
                  className="p-2 -mr-2 text-[#666]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
              <h2 className="text-2xl font-medium mb-2">{expression.expression}</h2>

              {/* Meaning Section */}
              <button
                onClick={() => setShowMeaning(!showMeaning)}
                className="w-full text-left mt-4"
              >
                <div className="flex items-center justify-between py-3 border-t border-[#f0f0f0]">
                  <span className="text-sm text-[#666]">뜻 보기</span>
                  <svg
                    className={`w-5 h-5 text-[#8a8a8a] transition-transform ${showMeaning ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {showMeaning && (
                <p className="text-[#1a1a1a] pb-2">{expression.meaning}</p>
              )}
            </div>

            {/* Example Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#f0f0f0]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#8a8a8a] tracking-wide uppercase">Example</span>
                <button
                  onClick={() => speakText(expression.example)}
                  className="p-2 -mr-2 text-[#666]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
              <p className="text-lg leading-relaxed">{expression.example}</p>

              {/* Translation Section */}
              <button
                onClick={() => setShowExample(!showExample)}
                className="w-full text-left mt-4"
              >
                <div className="flex items-center justify-between py-3 border-t border-[#f0f0f0]">
                  <span className="text-sm text-[#666]">해석 보기</span>
                  <svg
                    className={`w-5 h-5 text-[#8a8a8a] transition-transform ${showExample ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {showExample && (
                <p className="text-[#666] pb-2">{expression.example_ko}</p>
              )}
            </div>

            {/* Practice Button */}
            <Link href="/chat" className="block">
              <button className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl font-medium">
                이 표현으로 대화 연습하기
              </button>
            </Link>
          </>
        ) : (
          <div className="text-center py-20 text-[#8a8a8a]">
            표현을 불러올 수 없습니다
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
