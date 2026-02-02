'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getStats, type TodayStats } from '@/lib/learningHistory'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface DailyExpression {
  expression: string
  meaning: string
}

const FALLBACK_EXPRESSIONS: DailyExpression[] = [
  { expression: "break the ice", meaning: "어색한 분위기를 깨다" },
  { expression: "a piece of cake", meaning: "아주 쉬운 일" },
  { expression: "hit the nail on the head", meaning: "정곡을 찌르다" },
  { expression: "once in a blue moon", meaning: "아주 드물게" },
  { expression: "under the weather", meaning: "몸이 안 좋다" },
]

export default function Home() {
  const { user, cachedUser } = useAuth()
  const displayUser = user || cachedUser

  const [greeting, setGreeting] = useState('Good morning')
  const [stats, setStats] = useState<TodayStats>({ totalSessions: 0, totalMinutes: 0, vocabularyWords: 0, conversationScenarios: 0, streak: 0 })
  const [expression, setExpression] = useState<DailyExpression | null>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    setStats(getStats())
    fetchExpression()
  }, [])

  const fetchExpression = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rag/daily-expression`)
      if (response.ok) {
        const data = await response.json()
        setExpression({ expression: data.expression, meaning: data.meaning })
      } else {
        throw new Error('API failed')
      }
    } catch {
      const randomIndex = Math.floor(Math.random() * FALLBACK_EXPRESSIONS.length)
      setExpression(FALLBACK_EXPRESSIONS[randomIndex])
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-24">
      <div className="h-[30px]" />

      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-16">
          <div>
            <p className="text-sm text-[#8a8a8a]">{greeting}</p>
            <h1 className="text-2xl font-semibold mt-1">EnPeak</h1>
          </div>
          {displayUser ? (
            <Link
              href="/my"
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-medium"
            >
              {displayUser.displayName?.charAt(0) || displayUser.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full border border-[#e5e5e5] flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>

        <Link href="/talk" className="block mb-12">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-44 h-44 rounded-full border border-[#e5e5e5]" />
              <div className="absolute w-36 h-36 rounded-full border border-[#e0e0e0]" />
              <div className="absolute w-28 h-28 rounded-full border border-[#d5d5d5]" />
              <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center z-10">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 3C6.5 3 2 6.58 2 11c0 2.13 1.02 4.04 2.66 5.44L3.5 20l3.84-1.92C8.64 18.68 10.28 19 12 19c5.5 0 10-3.58 10-8s-4.5-8-10-8zm-3 9.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm3 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm3 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>
                </svg>
              </div>
            </div>
            <p className="text-xl font-medium text-[#1a1a1a] mb-2">대화를 시작해보세요</p>
            <p className="text-sm text-[#8a8a8a] text-center leading-relaxed">영어로 자유롭게 이야기해보세요.<br/>AI가 대화를 도와드립니다.</p>
          </div>
        </Link>

        {expression && (
          <Link href={`/talk?mode=expression&expression=${encodeURIComponent(expression.expression)}&meaning=${encodeURIComponent(expression.meaning)}`}>
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] mb-6">
              <p className="text-xs text-[#8a8a8a] mb-2">오늘의 표현</p>
              <p className="font-medium mb-1">{expression.expression}</p>
              <p className="text-sm text-[#666]">{expression.meaning}</p>
            </div>
          </Link>
        )}

        {stats.streak > 0 && (
          <div className="text-center">
            <p className="text-sm text-[#8a8a8a]">
              <span className="text-[#1a1a1a] font-medium">{stats.streak}일</span> 연속 학습 중
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
