'use client'

import BentoCard from './BentoCard'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { FEATURES } from '@/lib/homepage-data'

function FeatureIcon({ type }: { type: string }) {
  const cls = 'w-6 h-6 text-white'
  switch (type) {
    case 'chat':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'cards':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    case 'star':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    case 'roleplay':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'check':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return null
  }
}

export default function FeaturesBento() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section id="features" className="py-20 sm:py-28 bg-white px-4 sm:px-6" aria-label="주요 기능">
      <div id="main-content" className="sr-only" tabIndex={-1} />
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-hp-text mb-4">
            <span className="bg-gradient-to-r from-hp-blue to-hp-cyan bg-clip-text text-transparent">
              자신있게
            </span>
            {' '}영어를 말하기 위한 모든 것
          </h2>
          <p className="text-hp-muted text-base sm:text-lg">
            AI 기반 학습 도구로 영어 회화 실력을 키우세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((feature, i) => {
            const spanClass =
              feature.span === 'full'
                ? 'md:col-span-4'
                : feature.span === 2
                ? 'md:col-span-2'
                : 'md:col-span-1'

            return (
              <div
                key={feature.id}
                className={`${spanClass} transition-all duration-700`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <BentoCard
                  title={feature.title}
                  subtitle={feature.subtitle}
                  description={feature.description}
                  gradient={feature.gradient}
                  icon={<FeatureIcon type={feature.icon} />}
                  link={feature.link}
                  className="h-full min-h-[200px]"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
