'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { LEADERBOARD_DATA } from '@/lib/homepage-data'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

export default function LeaderboardTeaser() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-20 sm:py-28 bg-hp-cream px-4 sm:px-6" aria-label="주간 학습 순위">
      <div className="max-w-2xl mx-auto">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-hp-text mb-4">
              이번 주{' '}
              <span className="bg-gradient-to-r from-hp-amber to-hp-rose bg-clip-text text-transparent">
                최고의 학습자
              </span>
            </h2>
            <p className="text-hp-muted text-sm">꾸준히 학습하는 분들을 응원합니다</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {LEADERBOARD_DATA.map((entry, i) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 px-6 py-4 ${
                  i < LEADERBOARD_DATA.length - 1 ? 'border-b border-gray-50' : ''
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transitionDelay: `${i * 100 + 200}ms`,
                  transitionDuration: '500ms',
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  entry.rank === 1
                    ? 'bg-hp-amber/10 text-hp-amber'
                    : entry.rank === 2
                    ? 'bg-gray-100 text-gray-500'
                    : entry.rank === 3
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-gray-50 text-hp-muted'
                }`}>
                  {entry.rank}
                </div>

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hp-indigo to-hp-violet flex items-center justify-center text-white text-sm font-semibold">
                  {entry.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-hp-text truncate">{entry.name}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-hp-muted">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-hp-amber" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                    </svg>
                    {entry.streak}일
                  </span>
                  <span>{entry.words}단어</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href={`${APP_URL}/talk`}
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-hp-indigo border-2 border-hp-indigo/20 hover:border-hp-indigo/40 transition-colors"
            >
              커뮤니티 참여하기
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
