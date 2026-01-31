// 학습 기록 관리 유틸리티

export interface LearningRecord {
  id: string
  type: 'conversation' | 'vocabulary' | 'community' | 'chat'
  title: string
  category?: string
  scenarioId?: string
  word?: string
  duration?: number // 초 단위
  completedAt: string // ISO string
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

const STORAGE_KEY = 'enpeak_learning_history'
const STATS_KEY = 'enpeak_learning_stats'

// 오늘 날짜 문자열 (YYYY-MM-DD)
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// 모든 학습 기록 가져오기
export function getAllRecords(): LearningRecord[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 오늘의 학습 기록만 가져오기
export function getTodayRecords(): LearningRecord[] {
  const today = getTodayString()
  return getAllRecords().filter(record =>
    record.completedAt.startsWith(today)
  )
}

// 학습 기록 추가
export function addLearningRecord(record: Omit<LearningRecord, 'id' | 'completedAt'>): LearningRecord {
  const records = getAllRecords()
  const newRecord: LearningRecord = {
    ...record,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    completedAt: new Date().toISOString(),
  }
  records.unshift(newRecord) // 최신 기록을 앞에

  // 최대 100개까지만 저장
  if (records.length > 100) {
    records.splice(100)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))

  // 통계 업데이트
  updateStats(newRecord)

  return newRecord
}

// 통계 가져오기
export function getStats(): TodayStats {
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
  const stats = data ? JSON.parse(data) : {
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

    // 어제 활동했으면 streak 유지, 아니면 리셋
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

// 통계 업데이트
function updateStats(record: LearningRecord) {
  const data = localStorage.getItem(STATS_KEY)
  const stats = data ? JSON.parse(data) : {
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

  // 날짜 확인 및 streak 업데이트
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
    // 오늘 첫 활동
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
}

// 이번 주 학습일 가져오기 (월~일)
export function getWeeklyActivity(): boolean[] {
  const records = getAllRecords()
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  const weekDays: boolean[] = [false, false, false, false, false, false, false]

  records.forEach(record => {
    const recordDate = new Date(record.completedAt)
    if (recordDate >= monday) {
      const recordDay = recordDate.getDay()
      const weekIndex = recordDay === 0 ? 6 : recordDay - 1 // 월=0, 일=6
      weekDays[weekIndex] = true
    }
  })

  return weekDays
}

// 이번 주 상세 통계
export interface WeeklyStats {
  totalSessions: number      // 총 학습 세션
  totalDays: number          // 학습한 날 수
  vocabularyWords: number    // 학습한 단어 수
  conversations: number      // 완료한 회화 수
  chatSessions: number       // 자유 대화 세션 수
}

export function getWeeklyStats(): WeeklyStats {
  if (typeof window === 'undefined') {
    return {
      totalSessions: 0,
      totalDays: 0,
      vocabularyWords: 0,
      conversations: 0,
      chatSessions: 0,
    }
  }

  const records = getAllRecords()
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
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

// 학습 타입별 아이콘 및 색상
export function getLearningTypeInfo(type: LearningRecord['type']) {
  const info = {
    conversation: { icon: 'chat', color: 'bg-blue-500', label: '회화 연습' },
    vocabulary: { icon: 'book', color: 'bg-green-500', label: '단어 학습' },
    community: { icon: 'users', color: 'bg-purple-500', label: '커뮤니티' },
    chat: { icon: 'message', color: 'bg-gray-500', label: '자유 대화' },
  }
  return info[type] || info.chat
}
