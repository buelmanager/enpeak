'use client'

import type { LearningRecord } from '@/lib/learningHistory'
import { getLearningTypeInfo } from '@/lib/learningHistory'

interface RecentTimelineProps {
  records: LearningRecord[]
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const period = h < 12 ? '오전' : '오후'
  const displayH = h === 0 ? 12 : h <= 12 ? h : h - 12
  return `${period} ${displayH}:${m}`
}

function getDateLabel(dateStr: string): string {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  if (dateStr === todayStr) return '오늘'
  if (dateStr === yesterdayStr) return '어제'
  return dateStr
}

const TYPE_ICONS: Record<string, JSX.Element> = {
  conversation: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  vocabulary: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  chat: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  community: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
}

const TYPE_BG: Record<string, string> = {
  conversation: 'bg-blue-100 text-blue-600',
  vocabulary: 'bg-green-100 text-green-600',
  chat: 'bg-gray-100 text-gray-600',
  community: 'bg-purple-100 text-purple-600',
}

export default function RecentTimeline({ records }: RecentTimelineProps) {
  // 최근 15개만 표시
  const recentRecords = records.slice(0, 15)

  if (recentRecords.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
          <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Recent Activity</span>
        </div>
        <p className="text-center text-sm text-[#8a8a8a] py-6">아직 학습 기록이 없어요</p>
      </section>
    )
  }

  // 날짜별로 그룹핑
  const groups: { label: string; records: LearningRecord[] }[] = []
  let currentDateStr = ''

  recentRecords.forEach(record => {
    const dateStr = record.completedAt.split('T')[0]
    if (dateStr !== currentDateStr) {
      currentDateStr = dateStr
      groups.push({ label: getDateLabel(dateStr), records: [] })
    }
    groups[groups.length - 1].records.push(record)
  })

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
        <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Recent Activity</span>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-medium text-[#8a8a8a] mb-2">{group.label}</p>
            <div className="space-y-2">
              {group.records.map(record => {
                const typeInfo = getLearningTypeInfo(record.type)
                return (
                  <div key={record.id} className="flex items-center gap-3 py-1.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_BG[record.type] || 'bg-gray-100 text-gray-600'}`}>
                      {TYPE_ICONS[record.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1a1a1a] truncate">{record.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#8a8a8a]">{typeInfo.label}</span>
                        {record.details?.level && (
                          <span className="text-[10px] text-[#0D9488] font-medium">{record.details.level}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8a8a8a] flex-shrink-0">{formatTime(record.completedAt)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
