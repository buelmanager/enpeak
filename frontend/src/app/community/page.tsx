'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface CommunityScenario {
  id: string
  title: string
  title_ko?: string
  description?: string
  author: string
  authorId?: string
  place: string
  situation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  likes: number
  plays: number
  createdAt: string
  tags?: string[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// 샘플 데이터 (API 연동 전)
const SAMPLE_SCENARIOS: CommunityScenario[] = [
  {
    id: '1',
    title: 'Coffee Shop Small Talk',
    title_ko: '카페에서 가벼운 대화',
    author: 'Sarah',
    place: '카페',
    situation: '바리스타와 대화',
    difficulty: 'beginner',
    likes: 24,
    plays: 156,
    createdAt: '2025-01-29',
    tags: ['일상', '카페']
  },
  {
    id: '2',
    title: 'Job Interview Practice',
    title_ko: '취업 면접 연습',
    author: 'Mike',
    place: '회사',
    situation: '면접',
    difficulty: 'advanced',
    likes: 89,
    plays: 423,
    createdAt: '2025-01-28',
    tags: ['비즈니스', '면접']
  },
  {
    id: '3',
    title: 'Airport Check-in',
    title_ko: '공항 체크인',
    author: 'Emily',
    place: '공항',
    situation: '체크인',
    difficulty: 'intermediate',
    likes: 45,
    plays: 287,
    createdAt: '2025-01-28',
    tags: ['여행', '공항']
  },
  {
    id: '4',
    title: 'Restaurant Complaint',
    title_ko: '레스토랑 불만 제기',
    author: 'David',
    place: '레스토랑',
    situation: '불만 제기',
    difficulty: 'intermediate',
    likes: 31,
    plays: 198,
    createdAt: '2025-01-27',
    tags: ['일상', '레스토랑']
  },
]

function CommunityContent() {
  const searchParams = useSearchParams()
  const [scenarios, setScenarios] = useState<CommunityScenario[]>(SAMPLE_SCENARIOS)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'popular' | 'recent' | 'beginner'>('popular')
  const [showPublishedToast, setShowPublishedToast] = useState(false)

  useEffect(() => {
    if (searchParams.get('published') === 'true') {
      setShowPublishedToast(true)
      setTimeout(() => setShowPublishedToast(false), 3000)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE}/api/community/scenarios?sort=${filter}`)
        if (response.ok) {
          const data = await response.json()
          if (data.scenarios?.length > 0) {
            setScenarios(data.scenarios)
          }
        }
      } catch (error) {
        console.log('Using sample data')
      } finally {
        setLoading(false)
      }
    }

    fetchScenarios()
  }, [filter])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50'
      case 'intermediate': return 'text-yellow-600 bg-yellow-50'
      case 'advanced': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급'
      case 'intermediate': return '중급'
      case 'advanced': return '고급'
      default: return difficulty
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Toast */}
      {showPublishedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#1a1a1a] text-white rounded-full text-sm shadow-lg">
          ✨ 시나리오가 공유되었습니다!
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium">커뮤니티</h1>
          <Link href="/create" className="p-2 -mr-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { key: 'popular', label: '인기' },
            { key: 'recent', label: '최신' },
            { key: 'beginner', label: '초급용' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filter === tab.key
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-[#e5e5e5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Scenarios List */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-[#8a8a8a]">
            <div className="flex justify-center gap-1 mb-2">
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm">시나리오를 불러오는 중...</p>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[#8a8a8a] mb-4">아직 시나리오가 없어요</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-full text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              첫 시나리오 만들기
            </Link>
          </div>
        ) : (
          scenarios.map(scenario => (
            <Link
              key={scenario.id}
              href={`/community/${scenario.id}`}
              className="block bg-white rounded-2xl border border-[#f0f0f0] p-5 active:bg-[#f5f5f5] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{scenario.title}</h3>
                  {scenario.title_ko && (
                    <p className="text-xs text-[#8a8a8a]">{scenario.title_ko}</p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                  {getDifficultyLabel(scenario.difficulty)}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 bg-[#f5f5f5] rounded text-xs">{scenario.place}</span>
                <span className="px-2 py-0.5 bg-[#f5f5f5] rounded text-xs">{scenario.situation}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {scenario.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {scenario.plays}
                  </span>
                </div>
                <span>by {scenario.author}</span>
              </div>
            </Link>
          ))
        )}
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
          <Link href="/create" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">만들기</span>
          </Link>
          <Link href="/community" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
            <span className="text-[10px] text-[#1a1a1a] tracking-wide">커뮤니티</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7] flex items-center justify-center"><p className="text-[#8a8a8a]">로딩 중...</p></div>}>
      <CommunityContent />
    </Suspense>
  )
}
