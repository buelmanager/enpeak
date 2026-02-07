'use client'

import { useState, useEffect } from 'react'
import SituationPicker from './SituationPicker'
import { buildSituationPrompt, SituationPreset } from '@/data/situationPresets'
import { API_BASE, apiFetch } from '@/shared/constants/api'

interface ScenarioInfo {
  id: string
  title: string
  title_ko: string
  category: string
  difficulty: string
  description: string
  estimated_time: string
}

interface RoleplayPickerProps {
  onSituationSelect: (situation: string, label: string) => void
  onScenarioSelect: (scenarioId: string, title: string) => void
  onCustomSetup: () => void
  onClose: () => void
}

type TabKey = 'situation' | 'scenario'

const difficultyLabels: Record<string, string> = {
  all: '전체',
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
}

const difficultyColors: Record<string, string> = {
  beginner: 'text-green-600 bg-green-50',
  intermediate: 'text-amber-600 bg-amber-50',
  advanced: 'text-red-600 bg-red-50',
}

const categoryLabels: Record<string, string> = {
  all: '전체',
  daily: '일상',
  travel: '여행',
  business: '비즈니스',
  food: '음식',
  shopping: '쇼핑',
  emergency: '응급',
  social: '소셜',
}

export default function RoleplayPicker({
  onSituationSelect,
  onScenarioSelect,
  onCustomSetup,
  onClose,
}: RoleplayPickerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('situation')
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([])
  const [scenarioLoading, setScenarioLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [showSituationPicker, setShowSituationPicker] = useState(true)

  // 시나리오 목록 로드
  useEffect(() => {
    if (activeTab === 'scenario' && scenarios.length === 0) {
      setScenarioLoading(true)
      apiFetch(`${API_BASE}/api/roleplay/scenarios`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setScenarios(data)
          }
        })
        .catch(() => {
          // ignore
        })
        .finally(() => setScenarioLoading(false))
    }
  }, [activeTab, scenarios.length])

  // 시나리오 카테고리 추출
  const scenarioCategories = Array.from(new Set(scenarios.map(s => s.category)))

  const filteredScenarios = scenarios.filter(s => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false
    if (difficultyFilter !== 'all' && s.difficulty !== difficultyFilter) return false
    return true
  })

  // 상황 프리셋 탭 - SituationPicker 재사용
  if (activeTab === 'situation' && showSituationPicker) {
    return (
      <div className="flex flex-col h-full">
        {/* Tab Header */}
        <div className="flex border-b border-[#f0f0f0] flex-shrink-0">
          <button
            onClick={() => setActiveTab('situation')}
            className="flex-1 py-3 text-sm font-medium text-[#0D9488] border-b-2 border-[#0D9488]"
          >
            상황 연습
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className="flex-1 py-3 text-sm font-medium text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
          >
            시나리오
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <SituationPicker
            onSelect={(preset: SituationPreset) => {
              onSituationSelect(buildSituationPrompt(preset), preset.label)
            }}
            onCustomSetup={onCustomSetup}
            onClose={onClose}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="flex border-b border-[#f0f0f0] flex-shrink-0">
        <button
          onClick={() => {
            setActiveTab('situation')
            setShowSituationPicker(true)
          }}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'situation'
              ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
              : 'text-[#8a8a8a] hover:text-[#1a1a1a]'
          }`}
        >
          상황 연습
        </button>
        <button
          onClick={() => setActiveTab('scenario')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'scenario'
              ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
              : 'text-[#8a8a8a] hover:text-[#1a1a1a]'
          }`}
        >
          시나리오
        </button>
      </div>

      {/* Scenario Tab Content */}
      {activeTab === 'scenario' && (
        <div className="flex-1 overflow-hidden flex flex-col py-4 px-4">
          {/* Close button */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-[#1a1a1a]">시나리오 선택</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0">
            {['all', ...scenarioCategories].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-white border border-[#e5e5e5] text-[#8a8a8a] hover:border-[#0D9488]'
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2 mb-4 flex-shrink-0">
            {Object.entries(difficultyLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDifficultyFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  difficultyFilter === key
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-white border border-[#e5e5e5] text-[#8a8a8a] hover:border-[#0D9488]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Scenario list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {scenarioLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredScenarios.length === 0 ? (
              <p className="text-sm text-[#8a8a8a] text-center py-8">해당 조건의 시나리오가 없습니다</p>
            ) : (
              filteredScenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => onScenarioSelect(scenario.id, scenario.title_ko || scenario.title)}
                  className="w-full text-left px-4 py-3.5 bg-white border border-[#e5e5e5] rounded-xl hover:border-[#0D9488] hover:bg-[#f0fdfa] transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#1a1a1a]">{scenario.title_ko || scenario.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${difficultyColors[scenario.difficulty] || ''}`}>
                      {difficultyLabels[scenario.difficulty] || scenario.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[#8a8a8a]">{scenario.title}</p>
                  <p className="text-xs text-[#b0b0b0] mt-1">{scenario.estimated_time}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
