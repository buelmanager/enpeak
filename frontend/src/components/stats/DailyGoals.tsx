'use client'

import type { TodayStats } from '@/lib/learningHistory'

interface DailyGoalsProps {
  todayStats: TodayStats
}

const GOALS = {
  conversations: 3,
  words: 10,
  minutes: 15,
}

function CircleProgress({ value, max, size = 56 }: { value: number; max: number; size?: number }) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={progress >= 1 ? '#10b981' : '#0D9488'}
        strokeWidth={5}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  )
}

export default function DailyGoals({ todayStats }: DailyGoalsProps) {
  const totalGoals = 3
  const achieved = [
    todayStats.conversationScenarios >= GOALS.conversations,
    todayStats.vocabularyWords >= GOALS.words,
    todayStats.totalMinutes >= GOALS.minutes,
  ].filter(Boolean).length

  const percentage = Math.round((achieved / totalGoals) * 100)

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
          <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Today&apos;s Goals</span>
        </div>
        <span className={`text-sm font-bold ${percentage === 100 ? 'text-emerald-500' : 'text-[#0D9488]'}`}>
          {percentage}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center">
          <div className="relative">
            <CircleProgress value={todayStats.conversationScenarios} max={GOALS.conversations} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[#1a1a1a]">{todayStats.conversationScenarios}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#8a8a8a] mt-2">회화 /{GOALS.conversations}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            <CircleProgress value={todayStats.vocabularyWords} max={GOALS.words} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[#1a1a1a]">{todayStats.vocabularyWords}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#8a8a8a] mt-2">단어 /{GOALS.words}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            <CircleProgress value={todayStats.totalMinutes} max={GOALS.minutes} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[#1a1a1a]">{todayStats.totalMinutes}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#8a8a8a] mt-2">분 /{GOALS.minutes}</p>
        </div>
      </div>
    </section>
  )
}
