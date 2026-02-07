'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

export default function DailyChallengePreview() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section id="challenge" className="py-20 sm:py-28 bg-white px-4 sm:px-6" aria-label="오늘의 챌린지">
      <div className="max-w-3xl mx-auto">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hp-indigo via-hp-violet to-hp-rose p-8 sm:p-12 text-white text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-32 h-32 border border-white rounded-full" />
              <div className="absolute bottom-4 right-4 w-48 h-48 border border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white rounded-full" />
            </div>

            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full mb-6">
                오늘의 챌린지
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                매일 표현 연습
              </h2>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 max-w-md mx-auto">
                <p className="text-xl font-semibold mb-2">&ldquo;Break the ice&rdquo;</p>
                <p className="text-white/60 text-sm blur-[2px] hover:blur-none focus:blur-none transition-all duration-300 cursor-pointer select-none" tabIndex={0}>
                  어색한 분위기를 깨다
                </p>
                <p className="text-xs text-white/40 mt-2">마우스를 올리거나 탭하여 뜻을 확인하세요</p>
              </div>

              <p className="text-white/70 text-sm mb-6">
                매일 새로운 영어 표현을 배우고, AI와 대화하며 연습하세요.
              </p>

              <a
                href={`${APP_URL}/talk?mode=expression`}
                className="inline-flex items-center px-8 py-3.5 rounded-full text-base font-semibold bg-white text-hp-indigo hover:bg-white/90 transition-colors"
              >
                연습 시작하기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
