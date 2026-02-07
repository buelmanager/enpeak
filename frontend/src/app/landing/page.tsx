'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Convo Brand Colors ───
// Primary Teal: #0D9488
// Secondary Warm White: #FAFAF8
// Accent Coral: #F87171
// Dark Charcoal: #1C1917
// Light Mist: #F0FDFA

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

function FadeInSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isVisible } = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Phone Mockup ───
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 280, height: 560 }}>
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[40px] bg-[#1C1917] shadow-[0_25px_60px_rgba(0,0,0,0.3)]" />
      {/* Screen */}
      <div className="absolute inset-[4px] rounded-[36px] bg-[#FAFAF8] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#1C1917] rounded-b-2xl z-10" />
        {/* Content */}
        <div className="relative pt-[36px] h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Mockup Screens ───
function MockupHomeScreen() {
  return (
    <div className="px-4 py-3 bg-[#FAFAF8] h-full">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-[8px] text-[#8a8a8a]">Good morning</p>
          <p className="text-[13px] font-semibold text-[#1C1917]">Convo</p>
        </div>
        <div className="w-6 h-6 rounded-full bg-[#0D9488]" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {['Free Chat', 'Expression', 'Roleplay'].map((m) => (
          <div key={m} className="bg-white rounded-xl p-2 text-center border border-[#e8e8e8]">
            <div className="w-6 h-6 rounded-lg bg-[#0D9488] mx-auto mb-1" />
            <p className="text-[7px] font-medium text-[#1C1917]">{m}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#1C1917] rounded-xl p-3 mb-2">
        <p className="text-[7px] text-white/60 mb-1">TODAY&apos;S CHALLENGE</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/10 rounded-lg p-2">
            <p className="text-[7px] text-white/70">대화</p>
            <p className="text-[12px] font-bold text-white">2/3</p>
            <div className="w-full bg-white/10 rounded-full h-[3px] mt-1">
              <div className="bg-[#0D9488] h-[3px] rounded-full" style={{ width: '66%' }} />
            </div>
          </div>
          <div className="flex-1 bg-white/10 rounded-lg p-2">
            <p className="text-[7px] text-white/70">단어</p>
            <p className="text-[12px] font-bold text-white">7/10</p>
            <div className="w-full bg-white/10 rounded-full h-[3px] mt-1">
              <div className="bg-[#0D9488] h-[3px] rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-3 border border-[#e8e8e8] mb-2">
        <p className="text-[7px] text-[#8a8a8a] mb-1">QUICK QUIZ</p>
        <p className="text-[11px] font-bold text-[#1C1917] mb-2">&quot;appreciate&quot;</p>
        <div className="space-y-1">
          <div className="bg-[#F0FDFA] border border-[#0D9488]/30 rounded-lg px-2 py-1.5">
            <p className="text-[8px] text-[#0D9488] font-medium">감사하다</p>
          </div>
          <div className="bg-[#f5f5f5] rounded-lg px-2 py-1.5">
            <p className="text-[8px] text-[#888]">도전하다</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockupChatScreen() {
  return (
    <div className="px-4 py-3 bg-[#FAFAF8] h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <p className="text-[12px] font-semibold text-[#1C1917]">Free Chat</p>
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-[#0D9488] flex-shrink-0 mt-0.5" />
          <div className="bg-[#F0FDFA] rounded-2xl rounded-tl-md px-3 py-2 max-w-[80%]">
            <p className="text-[9px] text-[#1C1917] leading-relaxed">
              Hi! How was your weekend? Did you do anything fun?
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-[#0D9488] rounded-2xl rounded-tr-md px-3 py-2 max-w-[80%]">
            <p className="text-[9px] text-white leading-relaxed">
              I went to a cafe with my friend. We talked about our trip plan.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-[#0D9488] flex-shrink-0 mt-0.5" />
          <div className="bg-[#F0FDFA] rounded-2xl rounded-tl-md px-3 py-2 max-w-[80%]">
            <p className="text-[9px] text-[#1C1917] leading-relaxed">
              That sounds great! Where are you planning to go?
            </p>
            <div className="mt-1.5 bg-white/80 rounded-lg px-2 py-1 border border-[#0D9488]/20">
              <p className="text-[7px] text-[#0D9488]">Tip: &quot;planning to&quot; = ~할 계획이다</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 bg-white rounded-full border border-[#e0e0e0] px-3 py-1.5">
          <p className="text-[8px] text-[#aaa]">Type your message...</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#0D9488] flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-4 4m4-4l4 4" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function MockupScenarioScreen() {
  return (
    <div className="px-4 py-3 bg-[#FAFAF8] h-full">
      <p className="text-[12px] font-semibold text-[#1C1917] mb-3">Scenarios</p>
      <div className="space-y-2">
        {[
          { title: '카페 주문', en: 'Ordering at a Cafe', level: '초급', time: '3-5 min', color: 'bg-[#e8f5e9] text-[#2e7d32]' },
          { title: '호텔 체크인', en: 'Hotel Check-in', level: '초급', time: '5-7 min', color: 'bg-[#e8f5e9] text-[#2e7d32]' },
          { title: '영어 면접', en: 'Job Interview', level: '고급', time: '10-15 min', color: 'bg-[#fce4ec] text-[#c62828]' },
          { title: '병원 방문', en: 'Doctor Visit', level: '중급', time: '5-7 min', color: 'bg-[#fff3e0] text-[#e65100]' },
        ].map((s) => (
          <div key={s.en} className="bg-white rounded-xl p-3 border border-[#e8e8e8] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 rounded bg-[#0D9488]/20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[#1C1917]">{s.title}</p>
              <p className="text-[8px] text-[#8a8a8a]">{s.en}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-[7px] font-medium px-1.5 py-0.5 rounded-full ${s.color}`}>{s.level}</span>
              <p className="text-[7px] text-[#aaa] mt-0.5">{s.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [activeScreen, setActiveScreen] = useState(0)
  const screens = [<MockupHomeScreen key="home" />, <MockupChatScreen key="chat" />, <MockupScenarioScreen key="scenario" />]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [screens.length])

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* ─── Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-[#0D9488]/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D9488] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1C1917] tracking-tight">Convo</span>
          </div>
          <Link
            href="/login"
            className="bg-[#0D9488] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:bg-[#0B8278] active:scale-95"
          >
            시작하기
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <FadeInSection>
                <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#0D9488]/20 rounded-full px-4 py-1.5 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                  <span className="text-[13px] text-[#0D9488] font-medium">AI-Powered English Practice</span>
                </div>
              </FadeInSection>

              <FadeInSection delay={100}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C1917] tracking-tight leading-[1.1] mb-6">
                  대화가<br />
                  실력이 되는<br />
                  <span className="text-[#0D9488]">순간</span>
                </h1>
              </FadeInSection>

              <FadeInSection delay={200}>
                <p className="text-lg text-[#64748B] leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                  AI와 자유롭게 영어로 대화하세요.
                  112개 실전 시나리오로 진짜 쓸 수 있는 영어를 연습합니다.
                </p>
              </FadeInSection>

              <FadeInSection delay={300}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    href="/login"
                    className="bg-[#0D9488] text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:bg-[#0B8278] active:scale-[0.97] shadow-[0_8px_30px_rgba(13,148,136,0.3)]"
                  >
                    무료로 시작하기
                  </Link>
                  <a
                    href="#features"
                    className="bg-white text-[#1C1917] font-medium px-8 py-4 rounded-2xl text-base border border-[#E2E8F0] transition-all hover:bg-[#F8FAFC] active:scale-[0.97]"
                  >
                    기능 둘러보기
                  </a>
                </div>
              </FadeInSection>

              <FadeInSection delay={400}>
                <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1C1917]">112</p>
                    <p className="text-xs text-[#94A3B8]">실전 시나리오</p>
                  </div>
                  <div className="w-px h-8 bg-[#E2E8F0]" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1C1917]">2,661</p>
                    <p className="text-xs text-[#94A3B8]">단어 DB</p>
                  </div>
                  <div className="w-px h-8 bg-[#E2E8F0]" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1C1917]">A1-C2</p>
                    <p className="text-xs text-[#94A3B8]">전 레벨 지원</p>
                  </div>
                </div>
              </FadeInSection>
            </div>

            {/* Phone Mockup */}
            <FadeInSection delay={200} className="flex-shrink-0">
              <PhoneMockup>
                <div className="relative h-full">
                  {screens.map((screen, idx) => (
                    <div
                      key={idx}
                      className="absolute inset-0 transition-all duration-500"
                      style={{
                        opacity: activeScreen === idx ? 1 : 0,
                        transform: activeScreen === idx ? 'scale(1)' : 'scale(0.95)',
                      }}
                    >
                      {screen}
                    </div>
                  ))}
                </div>
              </PhoneMockup>
              {/* Screen indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {['홈', '대화', '시나리오'].map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScreen(idx)}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      activeScreen === idx
                        ? 'bg-[#0D9488] text-white'
                        : 'bg-[#F0FDFA] text-[#0D9488]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ─── Pain Point ─── */}
      <section className="py-20 px-6 bg-[#1C1917]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInSection>
            <p className="text-[#0D9488] text-sm font-medium uppercase tracking-wider mb-4">The Problem</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-6">
              &quot;문법은 아는데<br />막상 말하려면 안 나와요&quot;
            </h2>
            <p className="text-[#94A3B8] text-base leading-relaxed mb-10">
              10년 넘게 영어를 배웠는데, 카페에서 주문 하나 못하는 경험.<br />
              문법 점수는 높은데 회의에서 한마디도 못하는 현실.
            </p>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { stat: '73%', desc: '한국인의 영어 스피킹\n자신감 부족 비율' },
                { stat: '10년+', desc: '평균 영어 학습 기간\n(초등~대학)' },
                { stat: '5분', desc: '기존 앱에서 실제\n말하기 연습 시간/일' },
              ].map((item) => (
                <div key={item.stat} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-3xl font-bold text-[#0D9488] mb-2">{item.stat}</p>
                  <p className="text-sm text-[#94A3B8] whitespace-pre-line">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-14">
              <p className="text-[#0D9488] text-sm font-medium uppercase tracking-wider mb-3">Core Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
                하나의 앱에서<br />모든 영어 연습을
              </h2>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: '자유 대화',
                subtitle: 'Free Chat',
                desc: 'AI와 자유롭게 영어로 대화하며 실전 감각을 키우세요. 음성과 텍스트 모두 지원합니다.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                ),
                title: '표현 연습',
                subtitle: 'Daily Expressions',
                desc: '매일 새로운 실용 표현을 배우고, AI와 대화하며 자연스럽게 체화하세요.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
                title: '112개 롤플레이',
                subtitle: 'Real Scenarios',
                desc: '카페 주문부터 영어 면접까지. 실제 상황 112개 시나리오로 실전 연습.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
                title: '단어 카드',
                subtitle: 'Vocabulary Cards',
                desc: 'A1부터 C2까지 2,661개 단어. 관련 숙어와 예문까지 한 번에 확장 학습.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                ),
                title: 'Silent Mode',
                subtitle: 'Text-based Practice',
                desc: '지하철, 카페 어디서든. 텍스트로도 완전한 회화 연습이 가능합니다.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: '학습 통계',
                subtitle: 'Progress Tracking',
                desc: '연속 학습일, 주간 활동, 오늘의 성과를 한눈에 확인하세요.',
              },
            ].map((feature, idx) => (
              <FadeInSection key={feature.title} delay={idx * 100}>
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#0D9488]/30 transition-all hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] flex items-center justify-center text-[#0D9488] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-[#1C1917] mb-0.5">{feature.title}</h3>
                  <p className="text-xs text-[#0D9488] font-medium mb-2">{feature.subtitle}</p>
                  <p className="text-sm text-[#64748B] leading-relaxed">{feature.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 px-6 bg-[#F0FDFA]">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-14">
              <p className="text-[#0D9488] text-sm font-medium uppercase tracking-wider mb-3">How It Works</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
                3단계로 시작하세요
              </h2>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '모드 선택', desc: '자유 대화, 표현 연습, 롤플레이 중\n오늘의 기분에 맞는 모드를 고르세요.' },
              { step: '02', title: 'AI와 대화', desc: '음성 또는 텍스트로 AI와 대화하세요.\n실시간으로 피드백을 받습니다.' },
              { step: '03', title: '복습 & 성장', desc: '대화 중 배운 표현과 단어를\n퀴즈와 카드로 복습하세요.' },
            ].map((item, idx) => (
              <FadeInSection key={item.step} delay={idx * 150}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0D9488] flex items-center justify-center mx-auto mb-5 shadow-[0_8px_30px_rgba(13,148,136,0.25)]">
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1C1917] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line">{item.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-14">
              <p className="text-[#0D9488] text-sm font-medium uppercase tracking-wider mb-3">Why Convo</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
                다른 앱과 무엇이 다른가요?
              </h2>
            </div>
          </FadeInSection>

          <FadeInSection delay={100}>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left px-6 py-4 text-sm text-[#94A3B8] font-medium">기능</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#0D9488] bg-[#F0FDFA]">Convo</th>
                      <th className="px-6 py-4 text-sm text-[#94A3B8] font-medium">S사</th>
                      <th className="px-6 py-4 text-sm text-[#94A3B8] font-medium">D사</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'AI 자유 대화', convo: true, s: true, d: false },
                      { feature: '롤플레이 시나리오', convo: '112개', s: '제한적', d: false },
                      { feature: '텍스트 모드 (Silent)', convo: true, s: '일부', d: true },
                      { feature: '단어 카드 + 숙어 확장', convo: true, s: false, d: '단어만' },
                      { feature: '발음 교정', convo: true, s: false, d: false },
                      { feature: '일일 퀴즈', convo: true, s: false, d: true },
                      { feature: 'A1-C2 레벨 체계', convo: true, s: '일부', d: true },
                      { feature: '무료 사용', convo: true, s: '제한', d: '광고' },
                    ].map((row) => (
                      <tr key={row.feature} className="border-b border-[#F1F5F9] last:border-0">
                        <td className="px-6 py-3.5 text-sm text-[#1C1917]">{row.feature}</td>
                        <td className="px-6 py-3.5 text-center bg-[#F0FDFA]/50">
                          {row.convo === true ? (
                            <svg className="w-5 h-5 text-[#0D9488] mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium text-[#0D9488]">{row.convo}</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {row.s === true ? (
                            <svg className="w-5 h-5 text-[#94A3B8] mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : row.s === false ? (
                            <svg className="w-5 h-5 text-[#E2E8F0] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          ) : (
                            <span className="text-xs text-[#94A3B8]">{row.s}</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {row.d === true ? (
                            <svg className="w-5 h-5 text-[#94A3B8] mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : row.d === false ? (
                            <svg className="w-5 h-5 text-[#E2E8F0] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          ) : (
                            <span className="text-xs text-[#94A3B8]">{row.d}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-14">
              <p className="text-[#0D9488] text-sm font-medium uppercase tracking-wider mb-3">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight mb-3">
                부담 없이 시작하세요
              </h2>
              <p className="text-[#64748B]">무료로 시작하고, 필요할 때 업그레이드하세요.</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Free */}
            <FadeInSection delay={0}>
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] h-full flex flex-col">
                <p className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-1">Free</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-[#1C1917]">0</span>
                  <span className="text-[#94A3B8]">원</span>
                </div>
                <p className="text-sm text-[#64748B] mb-6">영어 회화 첫 걸음을 떼기에 충분합니다.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['하루 3회 AI 대화', '기본 시나리오 6개', 'A1-A2 단어 카드', 'Daily Quiz', '학습 통계'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-[#475569]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-xl text-center text-sm font-semibold border border-[#E2E8F0] text-[#1C1917] transition-all hover:bg-[#F8FAFC] active:scale-[0.97] block"
                >
                  무료로 시작
                </Link>
              </div>
            </FadeInSection>

            {/* Plus Monthly */}
            <FadeInSection delay={150}>
              <div className="bg-[#1C1917] rounded-2xl p-6 border-2 border-[#0D9488] h-full flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0D9488] text-white text-xs font-bold px-4 py-1 rounded-full">추천</span>
                </div>
                <p className="text-sm font-medium text-[#0D9488] uppercase tracking-wider mb-1">Plus</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">9,900</span>
                  <span className="text-[#94A3B8]">원/월</span>
                </div>
                <p className="text-sm text-[#94A3B8] mb-6">제한 없이 모든 기능을 사용하세요.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['무제한 AI 대화', '112개 전체 시나리오', 'A1-C2 전 레벨 단어', 'Silent Mode', '표현 컬렉션 & SRS 복습', '우선 지원'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-[#CBD5E1]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-xl text-center text-sm font-semibold bg-[#0D9488] text-white transition-all hover:bg-[#0B8278] active:scale-[0.97] shadow-[0_4px_20px_rgba(13,148,136,0.4)] block"
                >
                  Plus 시작하기
                </Link>
              </div>
            </FadeInSection>

            {/* Plus Annual */}
            <FadeInSection delay={300}>
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] h-full flex flex-col">
                <p className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-1">Plus Annual</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-[#1C1917]">5,900</span>
                  <span className="text-[#94A3B8]">원/월</span>
                </div>
                <p className="text-xs text-[#F87171] font-medium mb-4">연 70,800원 (40% 절약)</p>
                <p className="text-sm text-[#64748B] mb-6">장기 학습에 최적화된 요금제입니다.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Plus의 모든 기능', '연간 결제 40% 할인', '신규 기능 우선 접근', '오프라인 학습 (예정)'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-[#475569]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-xl text-center text-sm font-semibold border border-[#E2E8F0] text-[#1C1917] transition-all hover:bg-[#F8FAFC] active:scale-[0.97] block"
                >
                  연간 플랜 시작
                </Link>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 px-6 bg-[#1C1917]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              오늘부터 영어로<br />
              <span className="text-[#0D9488]">대화</span>를 시작하세요
            </h2>
            <p className="text-[#94A3B8] text-base mb-8">
              가입 없이 바로 체험해보세요. 무료입니다.
            </p>
            <Link
              href="/login"
              className="inline-flex bg-[#0D9488] text-white font-semibold px-10 py-4 rounded-2xl text-lg transition-all hover:bg-[#0B8278] active:scale-[0.97] shadow-[0_8px_30px_rgba(13,148,136,0.4)]"
            >
              무료로 시작하기
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-6 bg-[#1C1917] border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Convo</span>
          </div>
          <p className="text-xs text-[#64748B]">2026 Convo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
