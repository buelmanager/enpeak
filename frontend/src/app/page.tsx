'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import {
  getStats,
  getWeeklyActivity,
  getWeeklyStats,
  getDayRecords,
  type TodayStats,
  type WeeklyStats,
  type DayRecord,
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
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalSessions: 0,
    totalDays: 0,
    vocabularyWords: 0,
    conversations: 0,
    chatSessions: 0,
  })
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedDayRecord, setSelectedDayRecord] = useState<DayRecord | null>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    const loadedStats = getStats()
    const loadedWeekly = getWeeklyActivity()
    const loadedWeeklyStats = getWeeklyStats()
    setStats(loadedStats)
    setWeeklyActivity(loadedWeekly)
    setWeeklyStats(loadedWeeklyStats)
  }, [])

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
            <Link
              href="/my"
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-medium"
            >
              {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/daily" className="block">
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0] text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-3 mx-auto">
                <svg className="w-6 h-6 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm">오늘의 표현</h3>
              <p className="text-xs text-[#8a8a8a] mt-1">매일 새로운 표현</p>
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

        {/* Weekly Progress Bar Style */}
        <div className="space-y-4">
          {/* Day Progress */}
          <div className="flex items-center gap-2">
            {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
              <button
                key={day}
                onClick={() => {
                  if (selectedDay === idx) {
                    setSelectedDay(null)
                    setSelectedDayRecord(null)
                  } else {
                    setSelectedDay(idx)
                    setSelectedDayRecord(getDayRecords(idx))
                  }
                }}
                className={`flex-1 flex flex-col items-center gap-2 transition-all ${
                  selectedDay === idx ? 'scale-105' : ''
                }`}
              >
                <div className={`w-full h-12 rounded-lg flex items-center justify-center transition-all ${
                  selectedDay === idx
                    ? 'bg-[#555] ring-2 ring-[#999]'
                    : weeklyActivity[idx]
                    ? 'bg-[#1a1a1a]'
                    : 'bg-[#f0f0f0]'
                }`}>
                  {weeklyActivity[idx] && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] ${
                  selectedDay === idx
                    ? 'text-[#1a1a1a] font-medium'
                    : weeklyActivity[idx]
                    ? 'text-[#1a1a1a] font-medium'
                    : 'text-[#c5c5c5]'
                }`}>
                  {day}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Day Detail or Weekly Stats */}
          {selectedDayRecord ? (
            <div className="bg-[#f0f0f0] rounded-xl px-5 py-4 border border-[#e0e0e0]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#1a1a1a]">
                  {selectedDayRecord.date.split('-').slice(1).join('/')} ({['월', '화', '수', '목', '금', '토', '일'][selectedDay || 0]})
                </p>
                <button
                  onClick={() => {
                    setSelectedDay(null)
                    setSelectedDayRecord(null)
                  }}
                  className="text-xs text-[#666]"
                >
                  닫기
                </button>
              </div>
              {selectedDayRecord.totalSessions > 0 ? (
                <div className="flex gap-6 text-center">
                  <div className="flex-1">
                    <p className="text-2xl font-medium text-[#1a1a1a]">{selectedDayRecord.conversations}</p>
                    <p className="text-[10px] text-[#666]">회화</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-medium text-[#1a1a1a]">{selectedDayRecord.vocabularyWords}</p>
                    <p className="text-[10px] text-[#666]">단어</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-medium text-[#1a1a1a]">{selectedDayRecord.chatSessions}</p>
                    <p className="text-[10px] text-[#666]">대화</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#888] text-center py-2">학습 기록이 없습니다</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#f8f8f8] rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{weeklyStats.totalDays}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">/{7}일 학습</p>
                  <p className="text-xs text-[#8a8a8a]">이번 주</p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-lg font-medium">{weeklyStats.conversations}</p>
                  <p className="text-[10px] text-[#8a8a8a]">회화</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{weeklyStats.vocabularyWords}</p>
                  <p className="text-[10px] text-[#8a8a8a]">단어</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{weeklyStats.chatSessions}</p>
                  <p className="text-[10px] text-[#8a8a8a]">대화</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
