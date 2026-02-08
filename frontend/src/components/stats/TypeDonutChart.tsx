'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { TypeDistribution } from '@/lib/learningHistory'

interface TypeDonutChartProps {
  data: TypeDistribution
}

const COLORS: Record<string, { fill: string; label: string }> = {
  vocabulary: { fill: '#10b981', label: '단어 학습' },
  conversation: { fill: '#3b82f6', label: '회화 연습' },
  chat: { fill: '#94a3b8', label: '자유 대화' },
  community: { fill: '#8b5cf6', label: '커뮤니티' },
}

export default function TypeDonutChart({ data }: TypeDonutChartProps) {
  const chartData = Object.entries(COLORS)
    .map(([key, config]) => ({
      name: config.label,
      value: data[key as keyof TypeDistribution] as number,
      fill: config.fill,
      key,
    }))
    .filter(d => d.value > 0)

  if (data.total === 0) {
    return (
      <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
          <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Learning Type</span>
        </div>
        <p className="text-center text-sm text-[#8a8a8a] py-8">아직 학습 데이터가 없어요</p>
      </section>
    )
  }

  const topType = chartData.sort((a, b) => b.value - a.value)[0]

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
        <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Learning Type</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#1a1a1a]">{data.total}</span>
            <span className="text-[9px] text-[#8a8a8a]">total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {chartData.sort((a, b) => b.value - a.value).map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-[#666]">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#1a1a1a]">{item.value}</span>
                <span className="text-[10px] text-[#8a8a8a]">
                  ({Math.round((item.value / data.total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {topType && (
        <p className="text-xs text-[#8a8a8a] text-center mt-3">
          가장 활발한 학습: <span className="font-medium text-[#1a1a1a]">{topType.name}</span>
        </p>
      )}
    </section>
  )
}
