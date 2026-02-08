'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface HourlyPatternChartProps {
  data: number[]
}

export default function HourlyPatternChart({ data }: HourlyPatternChartProps) {
  const maxCount = Math.max(...data)
  const peakHour = data.indexOf(maxCount)

  const chartData = data.map((count, hour) => ({
    hour: `${hour}`,
    count,
    label: `${hour}시`,
  }))

  const period = peakHour < 12 ? '오전' : '오후'
  const displayHour = peakHour === 0 ? 12 : peakHour <= 12 ? peakHour : peakHour - 12

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
          <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Study Pattern</span>
        </div>
        {maxCount > 0 && (
          <span className="text-xs text-[#8a8a8a]">
            Peak: {period} {displayHour}시
          </span>
        )}
      </div>

      {maxCount === 0 ? (
        <p className="text-center text-sm text-[#8a8a8a] py-8">아직 학습 데이터가 없어요</p>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#8a8a8a' }}
                interval={5}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '11px',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value ?? 0}회`, '학습']}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any) => `${label}시`}
              />
              <ReferenceLine x={String(peakHour)} stroke="#0D9488" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0D9488"
                strokeWidth={2}
                fill="url(#hourlyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
