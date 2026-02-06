'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getStats, getWeeklyActivity, type TodayStats } from '@/lib/learningHistory'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface DailyExpression {
  expression: string
  meaning: string
}

interface VocabWord {
  word: string
  meaning: string
  level: string
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
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [expression, setExpression] = useState<DailyExpression | null>(null)
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    setStats(getStats())
    setWeeklyActivity(getWeeklyActivity())
    fetchExpression()
    fetchVocabWords()
  }, [])

  const fetchVocabWords = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/vocabulary/level/A1?limit=5`)
      if (response.ok) {
        const data = await response.json()
        if (data.words?.length > 0) {
          setVocabWords(data.words)
        }
      }
    } catch {
      setVocabWords([
        { word: 'hello', meaning: '안녕하세요', level: 'A1' },
        { word: 'thank you', meaning: '감사합니다', level: 'A1' },
        { word: 'please', meaning: '부탁합니다', level: 'A1' },
      ])
    }
  }

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
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[13px] text-[#8a8a8a] tracking-wide">{greeting}</p>
            <h1 className="text-[22px] font-semibold tracking-tight mt-0.5">EnPeak</h1>
          </div>
          {displayUser ? (
            <Link
              href="/my"
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-medium transition-transform active:scale-95"
            >
              {displayUser.displayName?.charAt(0) || displayUser.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center transition-transform active:scale-95"
            >
              <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mb-2">
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
              <span className="text-[13px] text-[#1a1a1a] font-medium">{stats.streak}일 연속</span>
            </div>
          )}
          {stats.streak > 0 && stats.totalSessions > 0 && (
            <div className="w-px h-3 bg-[#e0e0e0]" />
          )}
          {stats.totalSessions > 0 && (
            <span className="text-[13px] text-[#8a8a8a]">오늘 {stats.totalSessions}회</span>
          )}
        </div>

        <Link href="/talk" className="block">
          <div className="flex flex-col items-center pt-6 pb-8">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-1 tracking-tight">대화를 시작해보세요</h2>
            <p className="text-[13px] text-[#8a8a8a] text-center leading-relaxed">
              영어로 자유롭게 이야기해보세요
            </p>
          </div>
        </Link>

        {vocabWords.length > 0 && (
          <Link href="/cards" className="block mt-2">
            <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98] overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1a1a1a] rounded-full" />
                  <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Vocabulary</span>
                </div>
                <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="flex gap-2 overflow-x-auto px-5 pb-5">
                {vocabWords.map((w) => (
                  <div
                    key={w.word}
                    className="flex-shrink-0 bg-[#f5f5f5] rounded-xl px-4 py-3 min-w-[110px]"
                  >
                    <p className="text-[15px] font-semibold text-[#1a1a1a] mb-0.5">{w.word}</p>
                    <p className="text-[12px] text-[#888]">{w.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        )}

        {expression && (
          <Link 
            href={`/talk?mode=expression&expression=${encodeURIComponent(expression.expression)}&meaning=${encodeURIComponent(expression.meaning)}`}
            className="block mt-2"
          >
            <div className="bg-white rounded-2xl p-5 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#1a1a1a] rounded-full" />
                    <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Today&apos;s Expression</span>
                  </div>
                  <p className="text-[17px] font-semibold text-[#1a1a1a] mb-1.5 tracking-tight">{expression.expression}</p>
                  <p className="text-[14px] text-[#666]">{expression.meaning}</p>
                </div>
                <div className="ml-4 mt-1">
                  <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        <Link href="/stats" className="block mt-3">
          <div className="bg-white rounded-2xl p-5 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-[#1a1a1a] rounded-full" />
                  <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">This Week</span>
                </div>
                <div className="flex justify-between">
                  {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-[#8a8a8a]">{day}</span>
                      <div className={`w-8 h-8 rounded-lg ${
                        weeklyActivity[idx] ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="ml-4 mt-1">
                <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <BottomNav />
    </main>
  )
}
