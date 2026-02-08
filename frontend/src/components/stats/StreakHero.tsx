'use client'

import type { ExtendedStats } from '@/lib/learningHistory'

interface StreakHeroProps {
  stats: ExtendedStats
}

function getStreakColor(streak: number): string {
  if (streak >= 30) return 'from-red-500 to-orange-500'
  if (streak >= 14) return 'from-orange-500 to-amber-500'
  if (streak >= 7) return 'from-[#0D9488] to-teal-400'
  return 'from-[#0D9488] to-teal-500'
}

export default function StreakHero({ stats }: StreakHeroProps) {
  const streakColor = getStreakColor(stats.streak)

  return (
    <div className={`bg-gradient-to-br ${streakColor} rounded-2xl p-5 mb-4 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{stats.streak}</span>
            <span className="text-lg font-medium text-white/80">일 연속</span>
          </div>
          {stats.streak === 0 ? (
            <p className="text-sm text-white/70 mt-1">오늘 시작해보세요!</p>
          ) : stats.bestStreak > stats.streak ? (
            <p className="text-sm text-white/70 mt-1">최고 기록: {stats.bestStreak}일</p>
          ) : (
            <p className="text-sm text-white/70 mt-1">최고 기록 갱신 중!</p>
          )}
        </div>
        <div className="text-5xl">
          {stats.streak >= 30 ? (
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fillOpacity="0.9"/>
            </svg>
          ) : (
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor" fillOpacity="0.9">
              <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
            </svg>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{stats.totalLifetimeSessions}</p>
          <p className="text-[10px] text-white/70 mt-0.5">총 학습</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{stats.totalLifetimeWords}</p>
          <p className="text-[10px] text-white/70 mt-0.5">총 단어</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{stats.totalLifetimeMinutes}</p>
          <p className="text-[10px] text-white/70 mt-0.5">총 분</p>
        </div>
      </div>

      {stats.daysSinceStart > 0 && (
        <p className="text-xs text-white/60 text-center mt-3">Flu와 함께한 지 {stats.daysSinceStart}일째</p>
      )}
    </div>
  )
}
