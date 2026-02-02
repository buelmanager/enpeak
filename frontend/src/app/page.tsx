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
          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-1">대화 시작하기</p>
            <p className="text-sm text-white/60">AI와 영어로 대화해보세요</p>
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
