'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import {
  getStats,
  getWeeklyActivity,
  getWeeklyStats,
  type TodayStats,
  type WeeklyStats,
} from '@/lib/learningHistory'

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
  const [stats, setStats] = useState<TodayStats>({
    totalSessions: 0,
    totalMinutes: 0,
    vocabularyWords: 0,
    conversationScenarios: 0,
    streak: 0,
  })
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalSessions: 0,
    totalDays: 0,
    vocabularyWords: 0,
    conversations: 0,
    chatSessions: 0,
  })
  const [expression, setExpression] = useState<DailyExpression | null>(null)
  const [expressionLoading, setExpressionLoading] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    setStats(getStats())
    setWeeklyActivity(getWeeklyActivity())
    setWeeklyStats(getWeeklyStats())

    fetchExpression()
  }, [])

  const fetchExpression = async () => {
    setExpressionLoading(true)
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
    } finally {
      setExpressionLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-24">
      <div className="h-[30px] bg-[#faf9f7]" />

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-8">
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

        <Link href="/talk" className="block mb-8">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-1">대화 시작하기</p>
            <p className="text-sm text-white/60">AI와 영어로 대화해보세요</p>
          </div>
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#8a8a8a]">오늘의 표현</h2>
          </div>
          {expressionLoading ? (
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] flex items-center justify-center h-24">
              <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : expression ? (
            <Link href={`/talk?mode=expression&expression=${encodeURIComponent(expression.expression)}&meaning=${encodeURIComponent(expression.meaning)}`}>
              <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] hover:border-[#1a1a1a] transition-colors">
                <p className="text-lg font-medium mb-1">{expression.expression}</p>
                <p className="text-sm text-[#666] mb-3">{expression.meaning}</p>
                <span className="text-xs text-[#1a1a1a] font-medium">연습하기 →</span>
              </div>
            </Link>
          ) : null}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-[#8a8a8a] mb-3">이번 주</h2>
          <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0]">
            <div className="flex justify-between mb-4">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-[#8a8a8a]">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    weeklyActivity[idx] ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'
                  }`}>
                    {weeklyActivity[idx] && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f5f5f5] rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold">{stats.streak}</p>
                <p className="text-xs text-[#8a8a8a]">연속</p>
              </div>
              <div className="bg-[#f5f5f5] rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold">{weeklyStats.vocabularyWords}</p>
                <p className="text-xs text-[#8a8a8a]">단어</p>
              </div>
              <div className="bg-[#f5f5f5] rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold">{weeklyStats.conversations + weeklyStats.chatSessions}</p>
                <p className="text-xs text-[#8a8a8a]">대화</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/cards" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] text-center hover:border-[#1a1a1a] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm font-medium">단어 학습</p>
            </div>
          </Link>
          <Link href="/daily" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] text-center hover:border-[#1a1a1a] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-sm font-medium">오늘의 표현</p>
            </div>
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
