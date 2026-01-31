'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import {
  getStats,
  getWeeklyActivity,
  type TodayStats,
} from '@/lib/learningHistory'

export default function Home() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<TodayStats>({
    totalSessions: 0,
    totalMinutes: 0,
    vocabularyWords: 0,
    conversationScenarios: 0,
    streak: 0,
  })
  const [greeting, setGreeting] = useState('Good morning')
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    const loadedStats = getStats()
    const loadedWeekly = getWeeklyActivity()
    setStats(loadedStats)
    setWeeklyActivity(loadedWeekly)
  }, [])

  const handleLogout = async () => {
    await logOut()
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Header */}
      <header className="px-6 pt-16 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#8a8a8a] text-sm tracking-wide">{greeting}</p>
            <h1 className="text-3xl font-light mt-2 tracking-tight">
              오늘의 <span className="font-medium">영어</span>
            </h1>
          </div>
          {loading ? (
            <div className="w-10 h-10 rounded-full border border-[#e5e5e5]" />
          ) : user ? (
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-medium"
            >
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </button>
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
      </header>

      <div className="px-6 space-y-8">
        {/* Breathing Circle - Main CTA */}
        <Link href="/chat" className="block">
          <div className="flex flex-col items-center py-10">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-44 h-44 rounded-full border border-[#e5e5e5] flex items-center justify-center">
                {/* Middle ring */}
                <div className="w-36 h-36 rounded-full border border-[#d5d5d5] flex items-center justify-center">
                  {/* Inner circle */}
                  <div className="w-28 h-28 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-2xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-xl font-light tracking-wide">대화를 시작해보세요</p>
            <p className="mt-2 text-sm text-[#8a8a8a]">영어로 자유롭게 이야기해보세요. AI가 대화를 도와드립니다.</p>
          </div>
        </Link>

        {/* Minimal Stats */}
        <div className="flex justify-center gap-12">
          <div className="text-center">
            <p className="text-3xl font-light">{stats.totalSessions}</p>
            <p className="text-xs text-[#8a8a8a] mt-1 tracking-wide">오늘</p>
          </div>
          <div className="w-px bg-[#e5e5e5]" />
          <div className="text-center">
            <p className="text-3xl font-light">{stats.streak}</p>
            <p className="text-xs text-[#8a8a8a] mt-1 tracking-wide">연속</p>
          </div>
          <div className="w-px bg-[#e5e5e5]" />
          <div className="text-center">
            <p className="text-3xl font-light">{stats.vocabularyWords}</p>
            <p className="text-xs text-[#8a8a8a] mt-1 tracking-wide">단어</p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-xs text-[#8a8a8a] tracking-widest uppercase">Practice</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* Quick Actions - Two main features */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/conversations" className="block">
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-3 mx-auto">
                <svg className="w-6 h-6 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm">상황별 회화</h3>
              <p className="text-xs text-[#8a8a8a] mt-1">100개+ 시나리오</p>
            </div>
          </Link>

          <Link href="/vocabulary" className="block">
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-3 mx-auto">
                <svg className="w-6 h-6 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-medium text-sm">단어 연습</h3>
              <p className="text-xs text-[#8a8a8a] mt-1">레벨별 학습</p>
            </div>
          </Link>
        </div>

        {/* Weekly Activity Section */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-xs text-[#8a8a8a] tracking-widest uppercase">This Week</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* Weekly Activity */}
        <div className="flex justify-between px-4">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                weeklyActivity[idx]
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-[#f0f0f0] text-[#c5c5c5]'
              }`}>
                {weeklyActivity[idx] ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : day}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
