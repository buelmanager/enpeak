'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface Scenario {
  id: string
  title: string
  titleEn: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  description: string
  isCommunity?: boolean
}

export interface CommunityScenario {
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

export const BUILT_IN_SCENARIOS: Scenario[] = [
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

const getDifficultyColor = (difficulty: Scenario['difficulty'] | CommunityScenario['difficulty']) => {
  const lowerDiff = difficulty.toLowerCase()
  switch (lowerDiff) {
    case 'beginner':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'intermediate':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'advanced':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getDifficultyLabel = (difficulty: CommunityScenario['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    default:
      return difficulty
  }
}

interface ScenarioSelectorProps {
  onSelect: (scenario: Scenario) => void
  onSelectCommunity?: (scenario: CommunityScenario) => void
}

type TabType = 'builtin' | 'community'

export function ScenarioSelector({ onSelect, onSelectCommunity }: ScenarioSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('builtin')
  const [communityScenarios, setCommunityScenarios] = useState<CommunityScenario[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityScenarios()
    }
  }, [activeTab])

  const fetchCommunityScenarios = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/community/scenarios?sort=popular`)
      if (response.ok) {
        const data = await response.json()
        setCommunityScenarios(data.scenarios || [])
      } else {
        setError('Failed to load community scenarios')
      }
    } catch (err) {
      setError('Failed to load community scenarios')
      console.error('Error fetching community scenarios:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommunitySelect = (scenario: CommunityScenario) => {
    if (onSelectCommunity) {
      onSelectCommunity(scenario)
    } else {
      // Fallback: convert to Scenario format with isCommunity flag
      const converted: Scenario = {
        id: `community_${scenario.id}`,
        title: scenario.title_ko || scenario.title,
        titleEn: scenario.title,
        category: 'community',
        difficulty: getDifficultyLabel(scenario.difficulty) as Scenario['difficulty'],
        description: scenario.description || `${scenario.place} - ${scenario.situation}`,
        isCommunity: true,
      }
      onSelect(converted)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-[#1a1a1a]">시나리오 선택</h2>
        <p className="text-sm text-[#8a8a8a] mt-1">
          연습하고 싶은 상황을 선택하세요
        </p>
      </div>

      <div className="flex gap-2 mb-4" data-testid="scenario-tabs">
        <button
          onClick={() => setActiveTab('builtin')}
          className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
            activeTab === 'builtin'
              ? 'bg-[#1a1a1a] text-white'
              : 'bg-white border border-[#e5e5e5] text-[#666] hover:border-[#1a1a1a]'
          }`}
          data-testid="tab-builtin"
        >
          기본 시나리오
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
            activeTab === 'community'
              ? 'bg-[#1a1a1a] text-white'
              : 'bg-white border border-[#e5e5e5] text-[#666] hover:border-[#1a1a1a]'
          }`}
          data-testid="tab-community"
        >
          커뮤니티
        </button>
      </div>

      {activeTab === 'builtin' && (
        <div className="space-y-2" data-testid="builtin-scenarios">
          {BUILT_IN_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className="w-full text-left p-4 bg-white rounded-xl border border-[#e5e5e5] hover:border-[#1a1a1a] hover:shadow-sm transition-all active:scale-[0.99]"
              data-testid={`scenario-${scenario.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#1a1a1a] truncate">
                      {scenario.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(scenario.difficulty)}`}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-[#8a8a8a] mt-1">{scenario.titleEn}</p>
                </div>
                <svg
                  className="w-5 h-5 text-[#c5c5c5] flex-shrink-0 ml-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'community' && (
        <div className="space-y-3" data-testid="community-scenarios">
          {isLoading ? (
            <div className="text-center py-8" data-testid="community-loading">
              <div className="flex justify-center gap-1 mb-2">
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-[#8a8a8a]">시나리오를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8" data-testid="community-error">
              <p className="text-sm text-[#e74c3c] mb-3">{error}</p>
              <button
                onClick={fetchCommunityScenarios}
                className="text-sm text-[#1a1a1a] underline"
              >
                다시 시도
              </button>
            </div>
          ) : communityScenarios.length === 0 ? (
            <div className="text-center py-8" data-testid="community-empty">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm text-[#8a8a8a]">아직 커뮤니티 시나리오가 없어요</p>
            </div>
          ) : (
            <>
              {communityScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleCommunitySelect(scenario)}
                  className="w-full text-left p-4 bg-white rounded-xl border border-[#e5e5e5] hover:border-[#1a1a1a] hover:shadow-sm transition-all active:scale-[0.99]"
                  data-testid={`community-scenario-${scenario.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#1a1a1a] text-sm truncate">
                        {scenario.title}
                      </h3>
                      {scenario.title_ko && (
                        <p className="text-xs text-[#8a8a8a] mt-0.5">{scenario.title_ko}</p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${getDifficultyColor(scenario.difficulty)}`}
                    >
                      {getDifficultyLabel(scenario.difficulty)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="px-2 py-0.5 bg-[#f5f5f5] rounded text-xs text-[#666]">{scenario.place}</span>
                    <span className="px-2 py-0.5 bg-[#f5f5f5] rounded text-xs text-[#666]">{scenario.situation}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" data-testid="likes-count">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {scenario.likes}
                      </span>
                      <span className="flex items-center gap-1" data-testid="plays-count">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {scenario.plays}
                      </span>
                    </div>
                    <span data-testid="author-name">by {scenario.author}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          <Link
            href="/create"
            className="flex items-center justify-center gap-2 w-full py-3 mt-4 bg-[#f5f5f5] hover:bg-[#eee] rounded-xl text-sm font-medium text-[#666] transition-colors"
            data-testid="create-scenario-button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            시나리오 만들기
          </Link>
        </div>
      )}
    </div>
  )
}
