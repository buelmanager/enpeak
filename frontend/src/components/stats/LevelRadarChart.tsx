'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface LevelRadarChartProps {
  data: Record<string, number>
}

export default function LevelRadarChart({ data }: LevelRadarChartProps) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const chartData = levels.map(level => ({
    level,
    count: data[level] || 0,
  }))

  const hasData = chartData.some(d => d.count > 0)

  // 가장 많이 학습한 레벨
  const topLevel = chartData.reduce((max, d) => d.count > max.count ? d : max, chartData[0])

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
        <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Level Progress</span>
      </div>

      {!hasData ? (
        <p className="text-center text-sm text-[#8a8a8a] py-8">아직 레벨별 데이터가 없어요</p>
      ) : (
        <>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="level"
                  tick={{ fontSize: 11, fill: '#666' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  tick={{ fontSize: 9, fill: '#8a8a8a' }}
                  axisLine={false}
                />
                <Radar
                  name="학습량"
                  dataKey="count"
                  stroke="#0D9488"
                  fill="#0D9488"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {topLevel.count > 0 && (
            <p className="text-xs text-[#8a8a8a] text-center mt-1">
              <span className="font-medium text-[#0D9488]">{topLevel.level}</span> 레벨을 가장 많이 학습했어요
            </p>
          )}
        </>
      )}
    </section>
  )
}
