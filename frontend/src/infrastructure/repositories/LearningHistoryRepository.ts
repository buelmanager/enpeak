import type { ILearningHistoryRepository } from '@/domain/repositories/ILearningHistoryRepository'
import type { LearningRecord, TodayStats, WeeklyStats, DayRecord } from '@/domain/entities/LearningRecord'

const STORAGE_KEY = 'enpeak_learning_history'
const STATS_KEY = 'enpeak_learning_stats'

interface StatsData {
  lastActiveDate: string | null
  streak: number
  todayStats: {
    date: string
    totalSessions: number
    totalMinutes: number
    vocabularyWords: number
    conversationScenarios: number
  }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export class LearningHistoryRepository implements ILearningHistoryRepository {
  private syncCallback?: (data: { learningHistory: LearningRecord[]; learningStats: StatsData }) => void

  constructor(syncCallback?: (data: { learningHistory: LearningRecord[]; learningStats: StatsData }) => void) {
    this.syncCallback = syncCallback
  }

  getAll(): LearningRecord[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  getToday(): LearningRecord[] {
    const today = getTodayString()
    return this.getAll().filter(record => record.completedAt.startsWith(today))
  }

  add(record: Omit<LearningRecord, 'id' | 'completedAt'>): LearningRecord {
    const records = this.getAll()
    const newRecord: LearningRecord = {
      ...record,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      completedAt: new Date().toISOString(),
    }
    records.unshift(newRecord)

    // 최대 100개까지만 저장
    if (records.length > 100) {
      records.splice(100)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))

    // 통계 업데이트
    const stats = this.updateStats(newRecord)

    // Firebase 동기화 (로그인된 경우)
    if (this.syncCallback) {
      this.syncCallback({
        learningHistory: records,
        learningStats: stats,
      })
    }

    return newRecord
  }

  getStats(): TodayStats {
    if (typeof window === 'undefined') {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        vocabularyWords: 0,
        conversationScenarios: 0,
        streak: 0,
      }
    }

    const data = localStorage.getItem(STATS_KEY)
    const stats: StatsData = data ? JSON.parse(data) : {
      lastActiveDate: null,
      streak: 0,
      todayStats: {
        date: getTodayString(),
        totalSessions: 0,
        totalMinutes: 0,
        vocabularyWords: 0,
        conversationScenarios: 0,
      }
    }

    // 오늘 날짜가 다르면 리셋
    if (stats.todayStats.date !== getTodayString()) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (stats.lastActiveDate === yesterdayStr) {
        // streak 유지
      } else if (stats.lastActiveDate !== getTodayString()) {
        stats.streak = 0
      }

      stats.todayStats = {
        date: getTodayString(),
        totalSessions: 0,
        totalMinutes: 0,
        vocabularyWords: 0,
        conversationScenarios: 0,
      }
      localStorage.setItem(STATS_KEY, JSON.stringify(stats))
    }

    return {
      totalSessions: stats.todayStats.totalSessions,
      totalMinutes: stats.todayStats.totalMinutes,
      vocabularyWords: stats.todayStats.vocabularyWords,
      conversationScenarios: stats.todayStats.conversationScenarios,
      streak: stats.streak,
    }
  }

  getWeeklyActivity(): boolean[] {
    const records = this.getAll()
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    const weekDays: boolean[] = [false, false, false, false, false, false, false]

    records.forEach(record => {
      const recordDate = new Date(record.completedAt)
      if (recordDate >= monday) {
        const recordDay = recordDate.getDay()
        const weekIndex = recordDay === 0 ? 6 : recordDay - 1
        weekDays[weekIndex] = true
      }
    })

    return weekDays
  }

  getWeeklyStats(): WeeklyStats {
    if (typeof window === 'undefined') {
      return {
        totalSessions: 0,
        totalDays: 0,
        vocabularyWords: 0,
        conversations: 0,
        chatSessions: 0,
      }
    }

    const records = this.getAll()
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    const weekRecords = records.filter(record => new Date(record.completedAt) >= monday)
    const activeDays = new Set(weekRecords.map(r => r.completedAt.split('T')[0]))

    return {
      totalSessions: weekRecords.length,
      totalDays: activeDays.size,
      vocabularyWords: weekRecords.filter(r => r.type === 'vocabulary').length,
      conversations: weekRecords.filter(r => r.type === 'conversation').length,
      chatSessions: weekRecords.filter(r => r.type === 'chat').length,
    }
  }

  getDayRecords(dayIndex: number): DayRecord {
    if (typeof window === 'undefined') {
      return { date: '', conversations: 0, vocabularyWords: 0, chatSessions: 0, totalSessions: 0 }
    }

    const records = this.getAll()
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    const targetDate = new Date(monday)
    targetDate.setDate(monday.getDate() + dayIndex)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    const dayRecords = records.filter(r => r.completedAt.startsWith(targetDateStr))

    return {
      date: targetDateStr,
      conversations: dayRecords.filter(r => r.type === 'conversation').length,
      vocabularyWords: dayRecords.filter(r => r.type === 'vocabulary').length,
      chatSessions: dayRecords.filter(r => r.type === 'chat').length,
      totalSessions: dayRecords.length,
    }
  }

  private updateStats(record: LearningRecord): StatsData {
    const data = localStorage.getItem(STATS_KEY)
    const stats: StatsData = data ? JSON.parse(data) : {
      lastActiveDate: null,
      streak: 0,
      todayStats: {
        date: getTodayString(),
        totalSessions: 0,
        totalMinutes: 0,
        vocabularyWords: 0,
        conversationScenarios: 0,
      }
    }

    const today = getTodayString()

    if (stats.todayStats.date !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (stats.lastActiveDate === yesterdayStr) {
        stats.streak += 1
      } else if (stats.lastActiveDate !== today) {
        stats.streak = 1
      }

      stats.todayStats = {
        date: today,
        totalSessions: 0,
        totalMinutes: 0,
        vocabularyWords: 0,
        conversationScenarios: 0,
      }
    } else if (stats.lastActiveDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (stats.lastActiveDate === yesterdayStr) {
        stats.streak += 1
      } else {
        stats.streak = 1
      }
    }

    stats.lastActiveDate = today
    stats.todayStats.totalSessions += 1

    if (record.duration) {
      stats.todayStats.totalMinutes += Math.round(record.duration / 60)
    }

    if (record.type === 'vocabulary') {
      stats.todayStats.vocabularyWords += 1
    }

    if (record.type === 'conversation') {
      stats.todayStats.conversationScenarios += 1
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats))

    return stats
  }
}
