'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase'
import { useState, useEffect } from 'react'
import { APP_VERSION } from '@/lib/version'

interface UserStats {
  todayConversations: number
  streak: number
  level: number
  totalMinutes: number
  scenariosCreated: number
}

export default function Home() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    todayConversations: 0,
    streak: 0,
    level: 1,
    totalMinutes: 0,
    scenariosCreated: 0,
  })
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // TODO: Load user stats from API
  }, [])

  const handleLogout = async () => {
    await logOut()
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Header */}
      <header className="px-6 pt-16 pb-8">
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
              className="w-10 h-10 rounded-full border border-[#1a1a1a] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </header>

      <div className="px-6 space-y-8">
        {/* Breathing Circle - Main CTA */}
        <Link href="/chat" className="block">
          <div className="flex flex-col items-center py-12">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-44 h-44 rounded-full border border-[#e5e5e5] flex items-center justify-center">
                {/* Middle ring */}
                <div className="w-36 h-36 rounded-full border border-[#d5d5d5] flex items-center justify-center">
                  {/* Inner circle */}
                  <div className="w-28 h-28 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-2xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-lg font-light tracking-wide">대화 시작하기</p>
            <p className="mt-2 text-sm text-[#8a8a8a]">AI와 자유롭게 영어로 대화해보세요</p>
          </div>
        </Link>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">{stats.todayConversations}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">오늘 대화</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">{stats.streak}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">연속 일</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">{stats.totalMinutes}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">총 분</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">Lv.{stats.level}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">레벨</p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-xs text-[#8a8a8a] tracking-widest uppercase">Create & Learn</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* Create Scenario Card */}
        <Link href="/create" className="block">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">대화 만들기</span>
                </div>
                <p className="text-sm text-[#a0a0a0] leading-relaxed">
                  나만의 영어 대화 시나리오를 AI와 함께 만들어보세요
                </p>
              </div>
              <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#333]">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-[#888]">장소</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-[#888]">시간</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-[#888]">상황</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Two Column Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Vocabulary Practice */}
          <Link href="/vocabulary" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] h-full">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">단어 연습</h4>
              <p className="text-[10px] text-[#8a8a8a] mt-1">A1~C2 레벨별</p>
            </div>
          </Link>

          {/* Community Scenarios */}
          <Link href="/community" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] h-full">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">커뮤니티</h4>
              <p className="text-[10px] text-[#8a8a8a] mt-1">함께 만드는 시나리오</p>
            </div>
          </Link>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">이번 주 학습</h3>
            <span className="text-xs text-[#8a8a8a]">0/7일</span>
          </div>
          <div className="flex justify-between">
            {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  idx < 0 ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f5] text-[#c5c5c5]'
                }`}>
                  {idx < 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs">{day}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="py-6 text-center">
          <p className="text-[#8a8a8a] text-sm italic leading-relaxed">
            "꾸준함이 완벽함을 이긴다"
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]">
        <div className="flex items-center justify-around py-5">
          <Link href="/" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
            <span className="text-[10px] text-[#1a1a1a] tracking-wide">홈</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">대화</span>
          </Link>
          <Link href="/create" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">만들기</span>
          </Link>
          <Link href="/community" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">커뮤니티</span>
          </Link>
        </div>
        <div className="text-center pb-2">
          <span className="text-[8px] text-[#c5c5c5]">v{APP_VERSION}</span>
        </div>
      </nav>
    </main>
  )
}
