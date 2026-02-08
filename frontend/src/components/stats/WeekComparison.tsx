'use client'

import type { WeekComparison as WeekComparisonType } from '@/lib/learningHistory'

interface WeekComparisonProps {
  data: WeekComparisonType
}

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-[10px] text-[#8a8a8a]">-</span>
  }
  if (value > 0) {
    return (
      <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-0.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        +{value}
      </span>
    )
  }
  return (
    <span className="text-[10px] font-medium text-red-400 flex items-center gap-0.5">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      {value}
    </span>
  )
}

export default function WeekComparisonCard({ data }: WeekComparisonProps) {
  const metrics = [
    { label: '학습일', thisWeek: data.thisWeek.days, lastWeek: data.lastWeek.days, change: data.changes.days, unit: '일' },
    { label: '단어', thisWeek: data.thisWeek.words, lastWeek: data.lastWeek.words, change: data.changes.words, unit: '개' },
    { label: '회화', thisWeek: data.thisWeek.conversations, lastWeek: data.lastWeek.conversations, change: data.changes.conversations, unit: '회' },
    { label: '학습', thisWeek: data.thisWeek.sessions, lastWeek: data.lastWeek.sessions, change: data.changes.sessions, unit: '회' },
  ]

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
        <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Week vs Week</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(metric => (
          <div key={metric.label} className="bg-[#f5f5f5] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8a8a8a]">{metric.label}</span>
              <ChangeIndicator value={metric.change} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#1a1a1a]">{metric.thisWeek}</span>
              <span className="text-[10px] text-[#8a8a8a]">{metric.unit}</span>
            </div>
            <p className="text-[10px] text-[#8a8a8a] mt-0.5">지난주 {metric.lastWeek}{metric.unit}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
