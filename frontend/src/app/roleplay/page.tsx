'use client'

import Link from 'next/link'

const scenarios = [
  {
    id: 'cafe_order',
    title: '카페 주문',
    titleEn: 'Ordering at a Cafe',
    category: 'daily',
    difficulty: 'Beginner',
    icon: '☕',
    description: '카페에서 음료를 주문하는 연습',
  },
  {
    id: 'hotel_checkin',
    title: '호텔 체크인',
    titleEn: 'Hotel Check-in',
    category: 'travel',
    difficulty: 'Beginner',
    icon: '🏨',
    description: '호텔에서 체크인하는 상황 연습',
  },
  {
    id: 'restaurant_order',
    title: '레스토랑 주문',
    titleEn: 'Restaurant Ordering',
    category: 'daily',
    difficulty: 'Beginner',
    icon: '🍽️',
    description: '레스토랑에서 음식 주문하기',
  },
  {
    id: 'airport_checkin',
    title: '공항 체크인',
    titleEn: 'Airport Check-in',
    category: 'travel',
    difficulty: 'Intermediate',
    icon: '✈️',
    description: '공항에서 탑승 수속하기',
  },
  {
    id: 'shopping',
    title: '쇼핑',
    titleEn: 'Shopping for Clothes',
    category: 'daily',
    difficulty: 'Intermediate',
    icon: '🛍️',
    description: '옷 가게에서 쇼핑하기',
  },
  {
    id: 'job_interview',
    title: '영어 면접',
    titleEn: 'Job Interview',
    category: 'business',
    difficulty: 'Advanced',
    icon: '💼',
    description: '영어로 채용 면접 보기',
  },
]

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'daily':
      return 'scenario-card-daily'
    case 'travel':
      return 'scenario-card-travel'
    case 'business':
      return 'scenario-card-business'
    default:
      return 'bg-gray-500'
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'text-green-600 bg-green-50'
    case 'Intermediate':
      return 'text-amber-600 bg-amber-50'
    case 'Advanced':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export default function RoleplayPage() {
  return (
    <main className="min-h-screen bg-slate-50 safe-area-top pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">상황별 롤플레이</h1>
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Intro */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            실제 상황을 연습하며 자연스러운 영어 표현을 익혀보세요.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium whitespace-nowrap">
            전체
          </button>
          <button className="px-4 py-2 bg-white text-gray-600 rounded-full text-sm border border-gray-200 whitespace-nowrap">
            일상
          </button>
          <button className="px-4 py-2 bg-white text-gray-600 rounded-full text-sm border border-gray-200 whitespace-nowrap">
            여행
          </button>
          <button className="px-4 py-2 bg-white text-gray-600 rounded-full text-sm border border-gray-200 whitespace-nowrap">
            비즈니스
          </button>
        </div>

        {/* Scenario List */}
        <div className="space-y-3">
          {scenarios.map(scenario => (
            <Link key={scenario.id} href={`/roleplay/${scenario.id}`}>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform">
                <div className={`w-14 h-14 ${getCategoryStyle(scenario.category)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">{scenario.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{scenario.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{scenario.titleEn}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
