'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { TESTIMONIALS } from '@/lib/homepage-data'

export default function TestimonialsCarousel() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-20 sm:py-28 bg-white px-4 sm:px-6" aria-label="학습자 후기">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-hp-text mb-4">
            학습자들의{' '}
            <span className="bg-gradient-to-r from-hp-rose to-hp-amber bg-clip-text text-transparent">
              생생한 후기
            </span>
          </h2>
          <p className="text-hp-muted text-base sm:text-lg">
            EnPeak과 함께 영어 실력을 키운 분들의 이야기
          </p>
        </div>

        <div className="relative -mx-4 sm:mx-0">
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-4 sm:px-0 pb-4 scrollbar-hide" role="region" aria-label="후기 캐러셀" tabIndex={0}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="snap-start shrink-0 w-[300px] sm:w-[350px] bg-hp-cream rounded-3xl p-6 sm:p-8"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 100}ms`,
                  transitionDuration: '700ms',
                }}
              >
                <svg className="w-8 h-8 text-hp-indigo/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>

                <p className="text-hp-text text-sm sm:text-base leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hp-rose to-hp-amber flex items-center justify-center text-white text-sm font-semibold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-hp-text">{t.name}</p>
                    <p className="text-xs text-hp-muted">{t.level}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
