'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase'

export default function Home() {
  const { user, loading } = useAuth()

  const handleLogout = async () => {
    await logOut()
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Header */}
      <header className="px-6 pt-16 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#8a8a8a] text-sm tracking-wide">Good morning</p>
            <h1 className="text-3xl font-light mt-2 tracking-tight">
              오늘의 <span className="font-medium">영어</span>
            </h1>
          </div>
          {loading ? (
            <div className="w-10 h-10 rounded-full border border-[#e5e5e5]" />
          ) : user ? (
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-medium"
            >
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </button>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full border border-[#1a1a1a] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </header>

      <div className="px-6 space-y-8">
        {/* Breathing Circle - Main CTA */}
        <Link href="/chat" className="block">
          <div className="flex flex-col items-center py-12">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-44 h-44 rounded-full border border-[#e5e5e5] flex items-center justify-center">
                {/* Middle ring */}
                <div className="w-36 h-36 rounded-full border border-[#d5d5d5] flex items-center justify-center">
                  {/* Inner circle */}
                  <div className="w-28 h-28 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-2xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-lg font-light tracking-wide">대화 시작하기</p>
            <p className="mt-2 text-sm text-[#8a8a8a]">AI와 자유롭게 영어로 대화해보세요</p>
          </div>
        </Link>

        {/* Minimal Stats */}
        <div className="flex justify-center gap-16">
          <div className="text-center">
            <p className="text-3xl font-light">0</p>
            <p className="text-xs text-[#8a8a8a] mt-1 tracking-wide">오늘</p>
          </div>
          <div className="w-px bg-[#e5e5e5]" />
          <div className="text-center">
            <p className="text-3xl font-light">0</p>
            <p className="text-xs text-[#8a8a8a] mt-1 tracking-wide">연속</p>
          </div>
          <div className="w-px bg-[#e5e5e5]" />
          <div className="text-center">
            <p className="text-3xl font-light">1</p>
            <p className="text-xs text-[#8a8a8a] mt-1 tracking-wide">레벨</p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-xs text-[#8a8a8a] tracking-widest uppercase">Practice</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* Scenario List - Minimal */}
        <div className="space-y-4">
          <Link href="/roleplay/cafe_order" className="block">
            <div className="flex items-center justify-between py-4 border-b border-[#f0f0f0] active:bg-[#f5f5f5] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-white text-sm">01</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">카페에서 주문하기</h4>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">Beginner · 3 min</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/roleplay/hotel_checkin" className="block">
            <div className="flex items-center justify-between py-4 border-b border-[#f0f0f0] active:bg-[#f5f5f5] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-white text-sm">02</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">호텔 체크인하기</h4>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">Beginner · 5 min</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/roleplay/restaurant_order" className="block">
            <div className="flex items-center justify-between py-4 border-b border-[#f0f0f0] active:bg-[#f5f5f5] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-white text-sm">03</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">레스토랑에서 식사하기</h4>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">Beginner · 5 min</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/roleplay/job_interview" className="block">
            <div className="flex items-center justify-between py-4 border-b border-[#f0f0f0] active:bg-[#f5f5f5] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
                  <span className="text-[#1a1a1a] text-sm">04</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">영어 면접 준비하기</h4>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">Advanced · 10 min</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quote */}
        <div className="py-8 text-center">
          <p className="text-[#8a8a8a] text-sm italic leading-relaxed">
            "꾸준함이 완벽함을 이긴다"
          </p>
        </div>
      </div>

      {/* Bottom Navigation - Minimal */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]">
        <div className="flex items-center justify-around py-5">
          <Link href="/" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
            <span className="text-[10px] text-[#1a1a1a] tracking-wide">홈</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">대화</span>
          </Link>
          <Link href="/roleplay" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">연습</span>
          </Link>
          <button className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">설정</span>
          </button>
        </div>
      </nav>
    </main>
  )
}
