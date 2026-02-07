'use client'

import { useState } from 'react'
import { categories, presets, SituationPreset } from '@/data/situationPresets'

interface SituationPickerProps {
  onSelect: (preset: SituationPreset) => void
  onCustomSetup: () => void
  onClose: () => void
}

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

function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || 'w-5 h-5'
  switch (icon) {
    case 'coffee':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4h8" />
        </svg>
      )
    case 'shopping':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    case 'travel':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'daily':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'work':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case 'social':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'health':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'services':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    default:
      return null
  }
}

export default function SituationPicker({ onSelect, onCustomSetup, onClose }: SituationPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const filteredPresets = selectedCategory
    ? presets.filter(
        p => p.categoryId === selectedCategory && (difficultyFilter === 'all' || p.difficulty === difficultyFilter)
      )
    : []

  if (!selectedCategory) {
    // Step 1: Category grid
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 px-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-light text-[#1a1a1a] mb-1 tracking-wide">어떤 상황을 연습할까요?</h2>
        <p className="text-sm text-[#8a8a8a] mb-6">카테고리를 선택하세요</p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex items-center gap-3 px-4 py-3.5 bg-white border border-[#e5e5e5] rounded-xl text-sm text-[#1a1a1a] hover:border-[#0D9488] hover:bg-[#f0fdfa] transition-all"
            >
              <span className="text-[#0D9488]">
                <CategoryIcon icon={cat.icon} />
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={onCustomSetup}
          className="text-sm text-[#8a8a8a] hover:text-[#0D9488] transition-colors underline underline-offset-4"
        >
          직접 입력하기
        </button>
      </div>
    )
  }

  // Step 2: Situation cards
  const category = categories.find(c => c.id === selectedCategory)!

  return (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            setSelectedCategory(null)
            setDifficultyFilter('all')
          }}
          className="p-1.5 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[#0D9488]">
          <CategoryIcon icon={category.icon} />
        </span>
        <h2 className="text-base font-medium text-[#1a1a1a]">{category.label}</h2>
      </div>

      {/* Difficulty filter chips */}
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

      {/* Situation cards */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredPresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className="w-full text-left px-4 py-3.5 bg-white border border-[#e5e5e5] rounded-xl hover:border-[#0D9488] hover:bg-[#f0fdfa] transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[#1a1a1a]">{preset.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${difficultyColors[preset.difficulty]}`}>
                {difficultyLabels[preset.difficulty]}
              </span>
            </div>
            <p className="text-xs text-[#8a8a8a]">{preset.labelEn}</p>
            <p className="text-xs text-[#b0b0b0] mt-1">
              {preset.aiRole} / {preset.userRole}
            </p>
          </button>
        ))}
        {filteredPresets.length === 0 && (
          <p className="text-sm text-[#8a8a8a] text-center py-8">해당 난이도의 상황이 없습니다</p>
        )}
      </div>
    </div>
  )
}
