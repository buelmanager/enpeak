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

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    setStats(getStats())
    setWeeklyActivity(getWeeklyActivity())
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
      <style jsx>{`
        @keyframes ripple-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.3;
          }
        }
        @keyframes ripple-pulse-delayed {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.25;
          }
        }
        @keyframes ripple-pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
        }
        .ripple-1 {
          animation: ripple-pulse 3s ease-in-out infinite;
        }
        .ripple-2 {
          animation: ripple-pulse-delayed 3s ease-in-out infinite 0.5s;
        }
        .ripple-3 {
          animation: ripple-pulse-slow 3s ease-in-out infinite 1s;
        }
        @keyframes subtle-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .cta-button {
          animation: subtle-float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="h-[env(safe-area-inset-top,20px)]" />

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

        {stats.streak > 0 && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a]/[0.04]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
              <span className="text-[13px] text-[#1a1a1a] font-medium">{stats.streak}일 연속 학습</span>
            </div>
          </div>
        )}

        <Link href="/talk" className="block">
          <div className="flex flex-col items-center pt-8 pb-10">
            <div className="relative w-52 h-52 flex items-center justify-center mb-8">
              <div className="ripple-3 absolute w-52 h-52 rounded-full border border-[#e8e8e8]" />
              <div className="ripple-2 absolute w-40 h-40 rounded-full border border-[#dedede]" />
              <div className="ripple-1 absolute w-28 h-28 rounded-full border border-[#d0d0d0]" />
              <div className="cta-button w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center z-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform active:scale-95">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 3C6.5 3 2 6.58 2 11c0 2.13 1.02 4.04 2.66 5.44L3.5 20l3.84-1.92C8.64 18.68 10.28 19 12 19c5.5 0 10-3.58 10-8s-4.5-8-10-8zm-3 9.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm3 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm3 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2 tracking-tight">대화를 시작해보세요</h2>
            <p className="text-[14px] text-[#8a8a8a] text-center leading-relaxed max-w-[240px]">
              영어로 자유롭게 이야기해보세요.<br/>AI가 대화를 도와드립니다.
            </p>
          </div>
        </Link>

        <div className="border-t border-[#f0f0f0] mt-6 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1a1a1a] rounded-full" />
            <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Today</span>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#8a8a8a]">대화</span>
            <span className="text-[#1a1a1a] font-medium">{stats.totalSessions}회</span>
          </div>
          {stats.totalMinutes > 0 && (
            <>
              <div className="border-t border-[#f5f5f5] my-2" />
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#8a8a8a]">학습 시간</span>
                <span className="text-[#1a1a1a] font-medium">{stats.totalMinutes}분</span>
              </div>
            </>
          )}
        </div>

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
