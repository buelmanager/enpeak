'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { useTTS } from '@/contexts/TTSContext'

interface DailyExpression {
  expression: string
  meaning: string
  example: string
  example_ko: string
  category: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export default function DailyExpressionPage() {
  const router = useRouter()
  const { speak, stop, isSpeaking } = useTTS()
  const [expression, setExpression] = useState<DailyExpression | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMeaning, setShowMeaning] = useState(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    fetchDailyExpression()
  }, [])

  // 폴백용 표현 목록
  const FALLBACK_EXPRESSIONS: DailyExpression[] = [
    {
      expression: "break the ice",
      meaning: "어색한 분위기를 깨다, 대화를 시작하다",
      example: "I tried to break the ice by asking about his hobbies.",
      example_ko: "그의 취미에 대해 물어보면서 분위기를 풀어보려고 했어.",
      category: "daily"
    },
    {
      expression: "hit the nail on the head",
      meaning: "정곡을 찌르다, 정확히 맞추다",
      example: "You hit the nail on the head with your analysis.",
      example_ko: "네 분석이 정확히 맞았어.",
      category: "daily"
    },
    {
      expression: "a piece of cake",
      meaning: "아주 쉬운 일",
      example: "Don't worry, the exam was a piece of cake.",
      example_ko: "걱정 마, 시험은 정말 쉬웠어.",
      category: "daily"
    },
    {
      expression: "once in a blue moon",
      meaning: "아주 드물게",
      example: "I only eat fast food once in a blue moon.",
      example_ko: "나는 패스트푸드를 아주 가끔 먹어.",
      category: "daily"
    },
    {
      expression: "speak of the devil",
      meaning: "호랑이도 제 말 하면 온다",
      example: "Speak of the devil! We were just talking about you.",
      example_ko: "호랑이도 제 말 하면 온다더니! 우리 방금 너 얘기 했어.",
      category: "daily"
    },
    {
      expression: "under the weather",
      meaning: "몸이 안 좋다, 컨디션이 좋지 않다",
      example: "I'm feeling a bit under the weather today.",
      example_ko: "오늘 몸이 좀 안 좋아.",
      category: "daily"
    },
    {
      expression: "get out of hand",
      meaning: "통제 불능이 되다, 손쓸 수 없게 되다",
      example: "The party got out of hand and the neighbors called the police.",
      example_ko: "파티가 통제 불능이 되어서 이웃들이 경찰을 불렀어.",
      category: "daily"
    },
    {
      expression: "cost an arm and a leg",
      meaning: "엄청나게 비싸다",
      example: "That new car must have cost an arm and a leg.",
      example_ko: "그 새 차는 정말 비쌌겠다.",
      category: "daily"
    },
    {
      expression: "on the same page",
      meaning: "같은 생각이다, 의견이 일치하다",
      example: "Let's make sure we're all on the same page before the meeting.",
      example_ko: "회의 전에 우리 모두 같은 생각인지 확인하자.",
      category: "daily"
    },
    {
      expression: "sleep on it",
      meaning: "하룻밤 자면서 생각해 보다",
      example: "It's a big decision. Why don't you sleep on it?",
      example_ko: "중요한 결정이니까, 하룻밤 자면서 생각해 보는 게 어때?",
      category: "daily"
    },
  ]

  const fetchDailyExpression = async (forceRandom = false) => {
    setLoading(true)
    try {
      // 새로고침 시 랜덤 파라미터 추가
      const randomParam = forceRandom ? `?random=${Date.now()}` : ''
      const response = await fetch(`${API_BASE}/api/rag/daily-expression${randomParam}`)
      if (response.ok) {
        const data = await response.json()
        setExpression(data)
      } else {
        // 폴백: 랜덤 표현
        const randomIndex = Math.floor(Math.random() * FALLBACK_EXPRESSIONS.length)
        setExpression(FALLBACK_EXPRESSIONS[randomIndex])
      }
    } catch {
      // 폴백: 랜덤 표현
      const randomIndex = Math.floor(Math.random() * FALLBACK_EXPRESSIONS.length)
      setExpression(FALLBACK_EXPRESSIONS[randomIndex])
    } finally {
      setLoading(false)
    }
  }

  const speakText = (text: string) => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text)
    }
  }

  const handleRefresh = () => {
    setShowMeaning(false)
    setShowExample(false)
    fetchDailyExpression(true) // 강제 랜덤
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Header */}
      <header className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between">
           <Link href="/talk" className="p-2 -ml-2">
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
            <div className="w-8 h-8 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
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
            <button
              onClick={() => {
                const params = new URLSearchParams({
                  expression: expression.expression,
                  meaning: expression.meaning,
                })
                router.push(`/talk?${params.toString()}`)
              }}
              className="w-full py-4 bg-[#0D9488] text-white rounded-xl font-medium"
            >
              이 표현으로 대화 연습하기
            </button>
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
