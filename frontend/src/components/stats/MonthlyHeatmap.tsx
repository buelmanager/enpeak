'use client'

import type { MonthlyActivityDay } from '@/lib/learningHistory'

interface MonthlyHeatmapProps {
  data: MonthlyActivityDay[]
}

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-[#ebedf0]'
  if (count <= 2) return 'bg-[#9be9a8]'
  if (count <= 4) return 'bg-[#40c463]'
  return 'bg-[#0D9488]'
}

export default function MonthlyHeatmap({ data }: MonthlyHeatmapProps) {
  // 7열 형태로 그리드 배치 (가장 최근 30일)
  // 주의: data는 이미 30일분이 시간순으로 정렬되어 있음
  const totalActiveDays = data.filter(d => d.count > 0).length

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
          <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">30 Days</span>
        </div>
        <span className="text-sm font-semibold text-[#1a1a1a]">{totalActiveDays}일 활동</span>
      </div>

      <div className="flex flex-wrap gap-[3px] justify-center">
        {data.map((day) => (
          <div
            key={day.date}
            className={`w-[calc((100%-27px)/10)] aspect-square rounded-[3px] ${getIntensityClass(day.count)} transition-colors`}
            title={`${day.date}: ${day.count}회`}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[9px] text-[#8a8a8a] mr-1">적음</span>
        <div className="w-3 h-3 rounded-[2px] bg-[#ebedf0]" />
        <div className="w-3 h-3 rounded-[2px] bg-[#9be9a8]" />
        <div className="w-3 h-3 rounded-[2px] bg-[#40c463]" />
        <div className="w-3 h-3 rounded-[2px] bg-[#0D9488]" />
        <span className="text-[9px] text-[#8a8a8a] ml-1">많음</span>
      </div>
    </section>
  )
}
