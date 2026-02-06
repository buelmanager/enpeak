'use client'

import { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'
import { ModeSelector, TalkMode } from '@/components/ModeSelector'
import { useTalk } from '@/contexts/TalkContext'

interface DailyExpression {
  expression: string
  meaning: string
  example: string
  example_ko: string
  category: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Preset situations for free chat
const PRESET_SITUATIONS = [
  { id: 'cafe', label: '카페 주문', situation: 'You are a barista at a coffee shop. The customer (user) is ordering.' },
  { id: 'restaurant', label: '레스토랑', situation: 'You are a waiter at a restaurant. Help the customer (user) with their order.' },
  { id: 'hotel', label: '호텔 체크인', situation: 'You are a hotel receptionist. The guest (user) is checking in.' },
  { id: 'airport', label: '공항', situation: 'You are an airport staff member. Help the traveler (user) with their questions.' },
  { id: 'shopping', label: '쇼핑', situation: 'You are a shop assistant. Help the customer (user) find what they need.' },
  { id: 'interview', label: '면접', situation: 'You are an interviewer conducting a job interview with the candidate (user).' },
]

// Fallback expressions for when API fails
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
    expression: "under the weather",
    meaning: "몸이 안 좋다, 컨디션이 좋지 않다",
    example: "I'm feeling a bit under the weather today.",
    example_ko: "오늘 몸이 좀 안 좋아.",
    category: "daily"
  },
]

function TalkContent() {
  const searchParams = useSearchParams()
  const { mode, setMode, expressionData, setExpression, situationData, setSituation, clearConversation } = useTalk()
  const initializedRef = useRef(false)
  const chatKeyRef = useRef(0)
  const [expressionLoading, setExpressionLoading] = useState(false)
  const [showSituationPicker, setShowSituationPicker] = useState(false)

  const fetchExpression = useCallback(async (forceRandom = false) => {
    setExpressionLoading(true)
    try {
      const randomParam = forceRandom ? `?random=${Date.now()}` : ''
      const response = await fetch(`${API_BASE}/api/rag/daily-expression${randomParam}`)
      if (response.ok) {
        const data = await response.json()
        setExpression({ expression: data.expression, meaning: data.meaning })
      } else {
        const randomIndex = Math.floor(Math.random() * FALLBACK_EXPRESSIONS.length)
        const fallback = FALLBACK_EXPRESSIONS[randomIndex]
        setExpression({ expression: fallback.expression, meaning: fallback.meaning })
      }
    } catch {
      const randomIndex = Math.floor(Math.random() * FALLBACK_EXPRESSIONS.length)
      const fallback = FALLBACK_EXPRESSIONS[randomIndex]
      setExpression({ expression: fallback.expression, meaning: fallback.meaning })
    } finally {
      setExpressionLoading(false)
    }
  }, [setExpression])

  useEffect(() => {
    if (mode === 'expression' && !expressionData) {
      fetchExpression()
    }
  }, [mode, expressionData, fetchExpression])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const urlMode = searchParams.get('mode') as TalkMode | null

    if (urlMode === 'expression') {
      const expression = searchParams.get('expression')
      const meaning = searchParams.get('meaning')
      if (expression) {
        setMode('expression')
        setExpression({ expression, meaning: meaning || '' })
      }
    }
  }, [searchParams, setMode, setExpression])

  const handleModeChange = (newMode: TalkMode) => {
    if (newMode !== mode) {
      clearConversation()
      setMode(newMode)
      chatKeyRef.current += 1
      setShowSituationPicker(false)
      
      if (newMode === 'expression') {
        fetchExpression()
      }
    }
  }

  const handleRefreshExpression = () => {
    chatKeyRef.current += 1
    fetchExpression(true)
  }

  const handleSituationSelect = (situation: string) => {
    setSituation({ situation })
    setShowSituationPicker(false)
    chatKeyRef.current += 1
  }

  const handleSituationClear = () => {
    setSituation(null)
    chatKeyRef.current += 1
  }

  return (
    <main className="h-screen bg-[#faf9f7] text-[#1a1a1a] flex flex-col">
      <div className="bg-[#faf9f7] flex-shrink-0" style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      <header className="bg-[#faf9f7] border-b border-[#f0f0f0] flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="p-1 -ml-1">
            <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-medium">Talk</h1>
          <div className="w-5" />
        </div>
      </header>

      {/* Mode Selector */}
      <div className="bg-[#faf9f7] flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
        </div>
      </div>

      {/* Free Mode - Situation Setting */}
      {mode === 'free' && (
        <div className="bg-[#faf9f7] flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 pb-4">
            {situationData ? (
              <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#1a1a1a]">
                      {PRESET_SITUATIONS.find(s => s.situation === situationData.situation)?.label || '상황 설정됨'}
                    </span>
                  </div>
                  <button
                    onClick={handleSituationClear}
                    className="px-3 py-1.5 text-xs font-medium text-[#666] bg-[#f5f5f5] rounded-lg hover:bg-[#eee] transition-colors"
                  >
                    해제
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowSituationPicker(!showSituationPicker)}
                  className="w-full bg-white rounded-2xl p-4 border border-[#f0f0f0] flex items-center justify-between hover:border-[#d0d0d0] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#666]">상황 설정하기</span>
                  </div>
                  <svg className={`w-4 h-4 text-[#666] transition-transform ${showSituationPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSituationPicker && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {PRESET_SITUATIONS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSituationSelect(item.situation)}
                        className="bg-white rounded-xl p-3 border border-[#f0f0f0] hover:border-[#1a1a1a] transition-colors text-center"
                      >
                        <span className="text-sm font-medium text-[#1a1a1a]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Expression Card */}
      {mode === 'expression' && (
        <div className="bg-[#faf9f7] flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 pb-4">
            {expressionLoading ? (
              <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : expressionData ? (
              <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-[#1a1a1a] mb-1">{expressionData.expression}</p>
                    <p className="text-sm text-[#666]">{expressionData.meaning}</p>
                  </div>
                  <button
                    onClick={handleRefreshExpression}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[#666] bg-[#f5f5f5] rounded-lg hover:bg-[#eee] transition-colors"
                  >
                    새 표현
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="max-w-2xl mx-auto w-full flex-1 overflow-hidden">
        <ChatWindow 
          key={chatKeyRef.current} 
          mode={mode}
          practiceExpression={mode === 'expression' && expressionData ? expressionData : undefined}
          situation={mode === 'free' && situationData ? situationData.situation : undefined}
        />
      </div>

      <div className="h-[env(safe-area-inset-bottom)] bg-[#faf9f7] flex-shrink-0" />
    </main>
  )
}

export default function TalkPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#faf9f7] flex items-center justify-center">
          <p className="text-[#8a8a8a]">Loading...</p>
        </div>
      }
    >
      <TalkContent />
    </Suspense>
  )
}
