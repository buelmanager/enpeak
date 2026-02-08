'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import BottomNav from '@/components/BottomNav'
import InsightCard from '@/components/stats/InsightCard'
import StreakHero from '@/components/stats/StreakHero'
import DailyGoals from '@/components/stats/DailyGoals'
import MonthlyHeatmap from '@/components/stats/MonthlyHeatmap'
import WeekComparisonCard from '@/components/stats/WeekComparison'
import RecentTimeline from '@/components/stats/RecentTimeline'
import AchievementBadges from '@/components/stats/AchievementBadges'
import {
  getStats,
  getExtendedStats,
  getAllRecords,
  getWeeklyChartData,
  getMonthlyActivity,
  getTypeDistribution,
  getHourlyPattern,
  getLevelDistribution,
  getWeekOverWeekComparison,
  generateInsightMessages,
  checkAchievements,
} from '@/lib/learningHistory'
import type {
  TodayStats,
  ExtendedStats,
  LearningRecord,
  WeeklyChartDataPoint,
  MonthlyActivityDay,
  TypeDistribution,
  WeekComparison,
  Achievement,
} from '@/lib/learningHistory'

// Recharts 컴포넌트는 SSR 비활성화 (dynamic import)
const WeeklyBarChart = dynamic(() => import('@/components/stats/WeeklyBarChart'), { ssr: false })
const TypeDonutChart = dynamic(() => import('@/components/stats/TypeDonutChart'), { ssr: false })
const HourlyPatternChart = dynamic(() => import('@/components/stats/HourlyPatternChart'), { ssr: false })
const LevelRadarChart = dynamic(() => import('@/components/stats/LevelRadarChart'), { ssr: false })

export default function StatsPage() {
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalSessions: 0, totalMinutes: 0, vocabularyWords: 0, conversationScenarios: 0, streak: 0,
  })
  const [extendedStats, setExtendedStats] = useState<ExtendedStats>({
    totalSessions: 0, totalMinutes: 0, vocabularyWords: 0, conversationScenarios: 0, streak: 0,
    bestStreak: 0, totalLifetimeWords: 0, totalLifetimeSessions: 0, totalLifetimeMinutes: 0,
    levelProgress: {}, firstLearningDate: null, daysSinceStart: 0,
  })
  const [records, setRecords] = useState<LearningRecord[]>([])
  const [weeklyChartData, setWeeklyChartData] = useState<WeeklyChartDataPoint[]>([])
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivityDay[]>([])
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution>({
    vocabulary: 0, conversation: 0, chat: 0, community: 0, total: 0,
  })
  const [hourlyPattern, setHourlyPattern] = useState<number[]>(new Array(24).fill(0))
  const [levelDistribution, setLevelDistribution] = useState<Record<string, number>>({})
  const [weekComparison, setWeekComparison] = useState<WeekComparison>({
    thisWeek: { days: 0, words: 0, conversations: 0, sessions: 0 },
    lastWeek: { days: 0, words: 0, conversations: 0, sessions: 0 },
    changes: { days: 0, words: 0, conversations: 0, sessions: 0 },
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setTodayStats(getStats())
    setExtendedStats(getExtendedStats())
    setRecords(getAllRecords())
    setWeeklyChartData(getWeeklyChartData())
    setMonthlyActivity(getMonthlyActivity())
    setTypeDistribution(getTypeDistribution())
    setHourlyPattern(getHourlyPattern())
    setLevelDistribution(getLevelDistribution())
    setWeekComparison(getWeekOverWeekComparison())

    const stats = getExtendedStats()
    setAchievements(checkAchievements(stats))
  }, [])

  // 인사이트 메시지 (메모이제이션)
  const insightMessages = useMemo(() => {
    return generateInsightMessages(extendedStats, weekComparison, hourlyPattern)
  }, [extendedStats, weekComparison, hourlyPattern])

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-32">
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      <div className="px-5 pt-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-5">통계</h1>

        {/* 1. 개인 맞춤 인사이트 */}
        <InsightCard messages={insightMessages} />

        {/* 2. 스트릭 & 요약 히어로 */}
        <StreakHero stats={extendedStats} />

        {/* 3. 오늘의 목표 진행률 */}
        <DailyGoals todayStats={todayStats} />

        {/* 4. 주간 활동 차트 */}
        <WeeklyBarChart data={weeklyChartData} />

        {/* 5. 월간 히트맵 */}
        <MonthlyHeatmap data={monthlyActivity} />

        {/* 6. 학습 유형 분석 */}
        <TypeDonutChart data={typeDistribution} />

        {/* 7. 시간대별 학습 패턴 */}
        <HourlyPatternChart data={hourlyPattern} />

        {/* 8. 레벨별 진행도 */}
        <LevelRadarChart data={levelDistribution} />

        {/* 9. 주간 비교 */}
        <WeekComparisonCard data={weekComparison} />

        {/* 10. 최근 학습 타임라인 */}
        <RecentTimeline records={records} />

        {/* 11. 성취 배지 */}
        <AchievementBadges achievements={achievements} />
      </div>

      <BottomNav />
    </div>
  )
}
