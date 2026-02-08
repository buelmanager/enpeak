'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { WeeklyChartDataPoint } from '@/lib/learningHistory'

interface WeeklyBarChartProps {
  data: WeeklyChartDataPoint[]
}

export default function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const totalSessions = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
          <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Weekly Activity</span>
        </div>
        <span className="text-sm font-semibold text-[#1a1a1a]">{totalSessions}회</span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#8a8a8a' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8a8a8a' }}
              width={20}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                const labels: Record<string, string> = {
                  vocabulary: '단어',
                  conversation: '회화',
                  chat: '대화',
                }
                return [value ?? 0, labels[String(name)] || String(name)]
              }}
            />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: '10px' }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  vocabulary: '단어',
                  conversation: '회화',
                  chat: '대화',
                }
                return labels[value] || value
              }}
            />
            <Bar dataKey="vocabulary" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="conversation" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="chat" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
