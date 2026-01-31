export interface LearningRecord {
  id: string
  type: 'conversation' | 'vocabulary' | 'community' | 'chat'
  title: string
  category?: string
  scenarioId?: string
  word?: string
  duration?: number
  completedAt: string
  details?: {
    stage?: number
    totalStages?: number
    correctCount?: number
    totalCount?: number
    level?: string
  }
}

export interface TodayStats {
  totalSessions: number
  totalMinutes: number
  vocabularyWords: number
  conversationScenarios: number
  streak: number
}

export interface WeeklyStats {
  totalSessions: number
  totalDays: number
  vocabularyWords: number
  conversations: number
  chatSessions: number
}

export interface DayRecord {
  date: string
  conversations: number
  vocabularyWords: number
  chatSessions: number
  totalSessions: number
}
