'use client'

import type { Achievement } from '@/lib/learningHistory'

interface AchievementBadgesProps {
  achievements: Achievement[]
}

const BADGE_ICONS: Record<string, string> = {
  first_step: 'M13 10V3L4 14h7v7l9-11h-7z',
  streak_3: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  streak_7: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  streak_14: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  streak_30: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  words_50: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  words_100: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  words_300: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  words_500: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  level_b1: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
}

export default function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const achievedCount = achievements.filter(a => a.achieved).length

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
          <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Achievements</span>
        </div>
        <span className="text-xs text-[#8a8a8a]">{achievedCount}/{achievements.length}</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {achievements.map(badge => (
          <div
            key={badge.id}
            className={`flex-shrink-0 w-20 flex flex-col items-center text-center ${
              badge.achieved ? '' : 'opacity-40'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1.5 ${
              badge.achieved ? 'bg-[#0D9488] text-white' : 'bg-[#e5e7eb] text-[#8a8a8a]'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={BADGE_ICONS[badge.id] || 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'} />
              </svg>
            </div>
            <p className="text-[10px] font-medium text-[#1a1a1a] leading-tight">{badge.name}</p>
            <p className="text-[9px] text-[#8a8a8a] leading-tight mt-0.5">
              {badge.achieved ? badge.description : badge.condition}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
