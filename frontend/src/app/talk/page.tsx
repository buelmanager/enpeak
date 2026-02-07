'use client'

import { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'
import { ModeSelector, TalkMode } from '@/components/ModeSelector'
import RoleplayPicker from '@/components/RoleplayPicker'
import { useTalk } from '@/contexts/TalkContext'
import { API_BASE, apiFetch } from '@/shared/constants/api'

interface DailyExpression {
  expression: string
  meaning: string
  example: string
  example_ko: string
  category: string
}


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
  const { mode, setMode, expressionData, setExpression, scenarioData, setScenario, situationData, setSituation, clearConversation } = useTalk()
  const initializedRef = useRef(false)
  const chatKeyRef = useRef(0)
  const [expressionLoading, setExpressionLoading] = useState(false)
  const [showRoleplayPicker, setShowRoleplayPicker] = useState(false)

  const fetchExpression = useCallback(async (forceRandom = false) => {
    setExpressionLoading(true)
    try {
      const randomParam = forceRandom ? `?random=${Date.now()}` : ''
      const response = await apiFetch(`${API_BASE}/api/rag/daily-expression${randomParam}`)
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
    } else if (urlMode === 'roleplay') {
      setMode('roleplay')
      setShowRoleplayPicker(true)
    }
  }, [searchParams, setMode, setExpression])

  const handleModeChange = (newMode: TalkMode) => {
    if (newMode !== mode) {
      clearConversation()
      setMode(newMode)
      chatKeyRef.current += 1

      if (newMode === 'expression') {
        fetchExpression()
      }
      if (newMode === 'roleplay') {
        setShowRoleplayPicker(true)
      } else {
        setShowRoleplayPicker(false)
      }
    } else if (newMode === 'roleplay') {
      // 이미 롤플레이 모드에서 다시 탭 클릭 → picker 재표시
      setShowRoleplayPicker(true)
      setScenario(null)
      setSituation(null)
      chatKeyRef.current += 1
    }
  }

  const handleRefreshExpression = () => {
    chatKeyRef.current += 1
    fetchExpression(true)
  }

  const handleSituationSet = (situation: string, label: string) => {
    setSituation({ situation, label })
    setShowRoleplayPicker(false)
    chatKeyRef.current += 1
  }

  const handleSituationClear = () => {
    setSituation(null)
    if (mode === 'roleplay') {
      setShowRoleplayPicker(true)
    }
    chatKeyRef.current += 1
  }

  const handleScenarioSelect = (scenarioId: string, title: string) => {
    setScenario({ id: scenarioId, title })
    setShowRoleplayPicker(false)
    chatKeyRef.current += 1
  }

  const handleRoleplayCustomSetup = () => {
    setShowRoleplayPicker(false)
    // ChatWindow will handle the custom setup flow
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
          <h1 className="text-xl font-medium">Talk</h1>
          <div className="w-5" />
        </div>
      </header>

      {/* Mode Selector */}
      <div className="bg-[#faf9f7] flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
        </div>
      </div>

      {/* Expression Card */}
      {mode === 'expression' && (
        <div className="bg-[#faf9f7] flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 pb-4">
            {expressionLoading ? (
              <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
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
        {mode === 'roleplay' && showRoleplayPicker && !scenarioData && !situationData ? (
          <RoleplayPicker
            onSituationSelect={handleSituationSet}
            onScenarioSelect={handleScenarioSelect}
            onCustomSetup={handleRoleplayCustomSetup}
            onClose={() => {
              setShowRoleplayPicker(false)
              setMode('free')
              chatKeyRef.current += 1
            }}
          />
        ) : (
          <ChatWindow
            key={chatKeyRef.current}
            mode={mode}
            practiceExpression={mode === 'expression' && expressionData ? expressionData : undefined}
            scenarioId={mode === 'roleplay' && scenarioData ? scenarioData.id : undefined}
            situation={
              (mode === 'free' && situationData ? situationData.situation : undefined)
              || (mode === 'roleplay' && situationData ? situationData.situation : undefined)
            }
            situationLabel={
              (mode === 'free' && situationData ? situationData.label : undefined)
              || (mode === 'roleplay' && situationData ? situationData.label : undefined)
            }
            onSituationSet={handleSituationSet}
            onSituationClear={handleSituationClear}
          />
        )}
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
