'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { COMMUNITY_CARDS } from '@/lib/homepage-data'

function CommunityIcon({ type }: { type: string }) {
  const cls = 'w-8 h-8'
  switch (type) {
    case 'qa':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'group':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    case 'scenario':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    default:
      return null
  }
}

export default function CommunityHighlights() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section id="community" className="py-20 sm:py-28 bg-hp-cream px-4 sm:px-6" aria-label="커뮤니티">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-hp-text mb-4">
            <span className="bg-gradient-to-r from-hp-emerald to-hp-cyan bg-clip-text text-transparent">
              함께
            </span>
            {' '}배우면 더 빨리 성장합니다
          </h2>
          <p className="text-hp-muted text-base sm:text-lg">
            커뮤니티와 함께하는 영어 학습
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMMUNITY_CARDS.map((card, i) => {
            const inner = (
              <div
                className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${i * 150}ms`,
                  transitionDuration: '700ms',
                }}
              >
                {card.comingSoon && (
                  <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold bg-hp-amber/10 text-hp-amber rounded-full">
                    Coming Soon
                  </span>
                )}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 text-hp-text mb-5">
                  <CommunityIcon type={card.icon} />
                </div>
                <h3 className="text-xl font-bold text-hp-text mb-1">{card.title}</h3>
                <p className="text-xs text-hp-muted mb-3">{card.subtitle}</p>
                <p className="text-sm text-hp-muted leading-relaxed">{card.description}</p>
              </div>
            )

            if (card.link) {
              return (
                <a key={card.title} href={card.link} className="block">
                  {inner}
                </a>
              )
            }
            return <div key={card.title}>{inner}</div>
          })}
        </div>
      </div>
    </section>
  )
}
