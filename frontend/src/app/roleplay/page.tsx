'use client'

import Link from 'next/link'

const scenarios = [
  {
    id: 'cafe_order',
    title: '카페 주문',
    titleEn: 'Ordering at a Cafe',
    category: 'daily',
    difficulty: 'Beginner',
    description: '카페에서 음료를 주문하는 연습',
  },
  {
    id: 'hotel_checkin',
    title: '호텔 체크인',
    titleEn: 'Hotel Check-in',
    category: 'travel',
    difficulty: 'Beginner',
    description: '호텔에서 체크인하는 상황 연습',
  },
  {
    id: 'restaurant_order',
    title: '레스토랑 주문',
    titleEn: 'Restaurant Ordering',
    category: 'daily',
    difficulty: 'Beginner',
    description: '레스토랑에서 음식 주문하기',
  },
  {
    id: 'airport_checkin',
    title: '공항 체크인',
    titleEn: 'Airport Check-in',
    category: 'travel',
    difficulty: 'Intermediate',
    description: '공항에서 탑승 수속하기',
  },
  {
    id: 'shopping',
    title: '쇼핑',
    titleEn: 'Shopping for Clothes',
    category: 'daily',
    difficulty: 'Intermediate',
    description: '옷 가게에서 쇼핑하기',
  },
  {
    id: 'job_interview',
    title: '영어 면접',
    titleEn: 'Job Interview',
    category: 'business',
    difficulty: 'Advanced',
    description: '영어로 채용 면접 보기',
  },
]

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'text-[#1a1a1a]'
    case 'Intermediate':
      return 'text-[#666]'
    case 'Advanced':
      return 'text-[#8a8a8a]'
    default:
      return 'text-[#8a8a8a]'
  }
}

export default function RoleplayPage() {
  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Header */}
      <header className="px-6 pt-16 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#8a8a8a] text-sm tracking-wide">Practice</p>
            <h1 className="text-3xl font-light mt-2 tracking-tight">
              상황별 <span className="font-medium">연습</span>
            </h1>
          </div>
          <Link href="/" className="text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="px-6">
        {/* Intro */}
        <p className="text-sm text-[#8a8a8a] mb-8 leading-relaxed">
          실제 상황을 연습하며 자연스러운 영어 표현을 익혀보세요.
        </p>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-[#1a1a1a] text-white rounded-full text-sm tracking-wide whitespace-nowrap">
            전체
          </button>
          <button className="px-4 py-2 bg-white text-[#8a8a8a] rounded-full text-sm border border-[#e5e5e5] whitespace-nowrap hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors">
            일상
          </button>
          <button className="px-4 py-2 bg-white text-[#8a8a8a] rounded-full text-sm border border-[#e5e5e5] whitespace-nowrap hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors">
            여행
          </button>
          <button className="px-4 py-2 bg-white text-[#8a8a8a] rounded-full text-sm border border-[#e5e5e5] whitespace-nowrap hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors">
            비즈니스
          </button>
        </div>

        {/* Scenario List */}
        <div className="space-y-1">
          {scenarios.map((scenario, idx) => (
            <Link key={scenario.id} href={`/roleplay/${scenario.id}`}>
              <div className="flex items-center justify-between py-4 border-b border-[#f0f0f0] active:bg-[#f5f5f5] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${idx < 3 ? 'bg-[#1a1a1a]' : 'border-2 border-[#1a1a1a]'} flex items-center justify-center`}>
                    <span className={`text-sm ${idx < 3 ? 'text-white' : 'text-[#1a1a1a]'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{scenario.title}</h4>
                    <p className="text-xs text-[#8a8a8a] mt-0.5">
                      <span className={getDifficultyStyle(scenario.difficulty)}>{scenario.difficulty}</span>
                      <span className="mx-1">·</span>
                      {scenario.titleEn}
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]">
        <div className="flex items-center justify-around py-5">
          <Link href="/" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">홈</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">대화</span>
          </Link>
          <Link href="/roleplay" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
            <span className="text-[10px] text-[#1a1a1a] tracking-wide">연습</span>
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
