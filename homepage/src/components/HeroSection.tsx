'use client'

import GradientBlob from './GradientBlob'
import AnimatedCounter from './AnimatedCounter'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { STATS } from '@/lib/homepage-data'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

export default function HeroSection() {
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation({ threshold: 0.3 })

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hp-cream px-4 sm:px-6 pt-16">
      <GradientBlob
        className="w-[500px] h-[500px] -top-40 -right-40 animate-float"
        color1="#6366f1"
        color2="#8b5cf6"
      />
      <GradientBlob
        className="w-[400px] h-[400px] -bottom-32 -left-32 animate-float-delayed"
        color1="#f43f5e"
        color2="#f59e0b"
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-hp-text leading-tight mb-6">
          <span className="bg-gradient-to-r from-hp-indigo to-hp-violet bg-clip-text text-transparent">
            진짜 대화
          </span>
          로 배우는
          <br />
          영어 회화
        </h1>

        <p className="text-lg sm:text-xl text-hp-muted max-w-2xl mx-auto mb-2">
          AI와 함께하는 실전 영어 회화 연습
        </p>
        <p className="text-base sm:text-lg text-hp-muted/70 max-w-2xl mx-auto mb-10">
          5,000+ 학습 리소스와 14가지 실생활 시나리오로 영어 실력을 키우세요.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href={`${APP_URL}/talk`}
            className="inline-flex items-center px-8 py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-hp-indigo to-hp-violet hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
          >
            무료로 시작하기
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center px-8 py-4 rounded-full text-base font-semibold text-hp-text border-2 border-gray-200 hover:border-gray-300 transition-colors"
          >
            기능 살펴보기
          </a>
        </div>

        <div ref={statsRef} className="flex items-center justify-center gap-8 sm:gap-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-hp-text">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  isVisible={statsVisible}
                />
              </div>
              <div className="text-xs sm:text-sm text-hp-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-hint">
        <svg className="w-6 h-6 text-hp-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
