'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { getWeeklyActivity, getWeeklyStats, getStats, WeeklyStats, TodayStats } from '@/lib/learningHistory'

export default function StatsPage() {
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalSessions: 0,
    totalDays: 0,
    vocabularyWords: 0,
    conversations: 0,
    chatSessions: 0,
  })
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalSessions: 0,
    totalMinutes: 0,
    vocabularyWords: 0,
    conversationScenarios: 0,
    streak: 0,
  })

  useEffect(() => {
    setWeeklyActivity(getWeeklyActivity())
    setWeeklyStats(getWeeklyStats())
    setTodayStats(getStats())
  }, [])

  const todayIndex = new Date().getDay()
  const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-32">
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">통계</h1>

        {todayStats.streak > 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4 text-white text-center">
            <p className="text-4xl font-bold mb-1">{todayStats.streak}</p>
            <p className="text-sm text-white/70">일 연속 학습</p>
          </div>
        )}

        <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1a1a1a] rounded-full" />
            <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">This Week</span>
          </div>
          
          <div className="flex justify-between mb-5">
            {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className={`text-xs ${idx === adjustedTodayIndex ? 'text-[#1a1a1a] font-medium' : 'text-[#8a8a8a]'}`}>
                  {day}
                </span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  weeklyActivity[idx] 
                    ? 'bg-[#1a1a1a]' 
                    : idx === adjustedTodayIndex 
                      ? 'bg-[#f0f0f0] ring-2 ring-[#1a1a1a] ring-offset-2' 
                      : 'bg-[#f0f0f0]'
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
            <div className="bg-[#f5f5f5] rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#1a1a1a]">{weeklyStats.totalDays}</p>
              <p className="text-xs text-[#8a8a8a] mt-1">학습일</p>
            </div>
            <div className="bg-[#f5f5f5] rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#1a1a1a]">{weeklyStats.vocabularyWords}</p>
              <p className="text-xs text-[#8a8a8a] mt-1">단어</p>
            </div>
            <div className="bg-[#f5f5f5] rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#1a1a1a]">{weeklyStats.conversations + weeklyStats.chatSessions}</p>
              <p className="text-xs text-[#8a8a8a] mt-1">회화</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1a1a1a] rounded-full" />
            <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Today</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#666]">학습 세션</span>
              <span className="font-semibold text-[#1a1a1a]">{todayStats.totalSessions}회</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-[#f0f0f0]">
              <span className="text-[#666]">학습 시간</span>
              <span className="font-semibold text-[#1a1a1a]">{todayStats.totalMinutes}분</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-[#f0f0f0]">
              <span className="text-[#666]">회화</span>
              <span className="font-semibold text-[#1a1a1a]">{todayStats.conversationScenarios}회</span>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
