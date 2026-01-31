import type { LearningRecord, TodayStats, WeeklyStats, DayRecord } from '../entities/LearningRecord'

export interface ILearningHistoryRepository {
  getAll(): LearningRecord[]
  getToday(): LearningRecord[]
  add(record: Omit<LearningRecord, 'id' | 'completedAt'>): LearningRecord
  getStats(): TodayStats
  getWeeklyActivity(): boolean[]
  getWeeklyStats(): WeeklyStats
  getDayRecords(dayIndex: number): DayRecord
}
