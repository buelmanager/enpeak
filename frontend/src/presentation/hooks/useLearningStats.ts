'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { TodayStats, WeeklyStats, DayRecord } from '@/domain/entities/LearningRecord'
import { LearningHistoryRepository } from '@/infrastructure/repositories/LearningHistoryRepository'

export function useLearningStats() {
  const [stats, setStats] = useState<TodayStats>({
    totalSessions: 0,
    totalMinutes: 0,
    vocabularyWords: 0,
    conversationScenarios: 0,
    streak: 0,
  })
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalSessions: 0,
    totalDays: 0,
    vocabularyWords: 0,
    conversations: 0,
    chatSessions: 0,
  })
  const [selectedDayRecords, setSelectedDayRecords] = useState<DayRecord | null>(null)

  const learningHistoryRepo = useMemo(() => new LearningHistoryRepository(), [])

  const refreshStats = useCallback(() => {
    setStats(learningHistoryRepo.getStats())
    setWeeklyActivity(learningHistoryRepo.getWeeklyActivity())
    setWeeklyStats(learningHistoryRepo.getWeeklyStats())
  }, [learningHistoryRepo])

  const getDayRecords = useCallback((dayIndex: number) => {
    const records = learningHistoryRepo.getDayRecords(dayIndex)
    setSelectedDayRecords(records)
    return records
  }, [learningHistoryRepo])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return {
    stats,
    weeklyActivity,
    weeklyStats,
    selectedDayRecords,
    refreshStats,
    getDayRecords,
  }
}
