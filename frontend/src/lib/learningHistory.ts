// 학습 기록 관리 유틸리티
import { syncToFirebaseIfLoggedIn } from './userDataSync'

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
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 날짜를 YYYY-MM-DD 형식으로 변환
function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 이번 주 월요일 구하기
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const dayOfWeek = d.getDay() // 0 = Sunday
  d.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  d.setHours(0, 0, 0, 0)
  return d
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
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    completedAt: new Date().toISOString(),
  }
  records.unshift(newRecord) // 최신 기록을 앞에

  // 최대 100개까지만 저장
  if (records.length > 100) {
    records.splice(100)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))

  // 통계 업데이트
  const stats = updateStats(newRecord)

  // Firebase 동기화 (로그인된 경우)
  syncToFirebaseIfLoggedIn({
    learningHistory: records,
    learningStats: stats,
  })

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
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

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
interface StatsData {
  lastActiveDate: string | null
  streak: number
  bestStreak: number
  totalLifetimeWords: number
  totalLifetimeSessions: number
  totalLifetimeMinutes: number
  levelProgress: Record<string, number>
  firstLearningDate: string | null
  todayStats: {
    date: string
    totalSessions: number
    totalMinutes: number
    vocabularyWords: number
    conversationScenarios: number
  }
}

function updateStats(record: LearningRecord): StatsData {
  const data = localStorage.getItem(STATS_KEY)
  const stats: StatsData = data ? JSON.parse(data) : {
    lastActiveDate: null,
    streak: 0,
    bestStreak: 0,
    totalLifetimeWords: 0,
    totalLifetimeSessions: 0,
    totalLifetimeMinutes: 0,
    levelProgress: {},
    firstLearningDate: null,
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
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

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
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

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

  // 누적 통계 업데이트
  stats.bestStreak = Math.max(stats.bestStreak || 0, stats.streak)
  stats.totalLifetimeSessions = (stats.totalLifetimeSessions || 0) + 1

  if (record.duration) {
    stats.totalLifetimeMinutes = (stats.totalLifetimeMinutes || 0) + Math.round(record.duration / 60)
  }

  if (record.type === 'vocabulary') {
    stats.totalLifetimeWords = (stats.totalLifetimeWords || 0) + 1
  }

  if (record.type === 'vocabulary' && record.details?.level) {
    if (!stats.levelProgress) {
      stats.levelProgress = {}
    }
    const level = record.details.level
    stats.levelProgress[level] = (stats.levelProgress[level] || 0) + 1
  }

  if (!stats.firstLearningDate) {
    stats.firstLearningDate = today
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats))

  return stats
}

// 확장 통계 인터페이스
export interface ExtendedStats extends TodayStats {
  bestStreak: number
  totalLifetimeWords: number
  totalLifetimeSessions: number
  totalLifetimeMinutes: number
  levelProgress: Record<string, number>
  firstLearningDate: string | null
  daysSinceStart: number
}

// 확장 통계 가져오기
export function getExtendedStats(): ExtendedStats {
  if (typeof window === 'undefined') {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      vocabularyWords: 0,
      conversationScenarios: 0,
      streak: 0,
      bestStreak: 0,
      totalLifetimeWords: 0,
      totalLifetimeSessions: 0,
      totalLifetimeMinutes: 0,
      levelProgress: {},
      firstLearningDate: null,
      daysSinceStart: 0,
    }
  }

  const todayStats = getStats()
  const data = localStorage.getItem(STATS_KEY)
  const stats: StatsData = data ? JSON.parse(data) : {} as StatsData

  const firstLearningDate = stats.firstLearningDate || null
  let daysSinceStart = 0
  if (firstLearningDate) {
    const start = new Date(firstLearningDate)
    const now = new Date()
    daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  return {
    ...todayStats,
    bestStreak: stats.bestStreak || 0,
    totalLifetimeWords: stats.totalLifetimeWords || 0,
    totalLifetimeSessions: stats.totalLifetimeSessions || 0,
    totalLifetimeMinutes: stats.totalLifetimeMinutes || 0,
    levelProgress: stats.levelProgress || {},
    firstLearningDate,
    daysSinceStart,
  }
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

// 특정 날짜의 학습 기록 가져오기
export interface DayRecord {
  date: string
  conversations: number
  vocabularyWords: number
  chatSessions: number
  totalSessions: number
}

export function getDayRecords(dayIndex: number): DayRecord {
  if (typeof window === 'undefined') {
    return { date: '', conversations: 0, vocabularyWords: 0, chatSessions: 0, totalSessions: 0 }
  }

  const records = getAllRecords()
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  // 선택한 요일의 날짜 계산
  const targetDate = new Date(monday)
  targetDate.setDate(monday.getDate() + dayIndex)
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`

  const dayRecords = records.filter(r => r.completedAt.startsWith(targetDateStr))

  return {
    date: targetDateStr,
    conversations: dayRecords.filter(r => r.type === 'conversation').length,
    vocabularyWords: dayRecords.filter(r => r.type === 'vocabulary').length,
    chatSessions: dayRecords.filter(r => r.type === 'chat').length,
    totalSessions: dayRecords.length,
  }
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

// --- 주간 차트 데이터 ---

export interface WeeklyChartDataPoint {
  day: string       // '월', '화', ...
  date: string      // 'YYYY-MM-DD'
  vocabulary: number
  conversation: number
  chat: number
  total: number
}

export function getWeeklyChartData(): WeeklyChartDataPoint[] {
  if (typeof window === 'undefined') {
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일']
    return dayLabels.map(day => ({
      day,
      date: '',
      vocabulary: 0,
      conversation: 0,
      chat: 0,
      total: 0,
    }))
  }

  const dayLabels = ['월', '화', '수', '목', '금', '토', '일']
  const records = getAllRecords()
  const today = new Date()
  const monday = getMondayOfWeek(today)

  const result: WeeklyChartDataPoint[] = []

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(monday)
    targetDate.setDate(monday.getDate() + i)
    const dateStr = toDateString(targetDate)

    const dayRecords = records.filter(r => r.completedAt.startsWith(dateStr))
    const vocabulary = dayRecords.filter(r => r.type === 'vocabulary').length
    const conversation = dayRecords.filter(r => r.type === 'conversation').length
    const chat = dayRecords.filter(r => r.type === 'chat').length

    result.push({
      day: dayLabels[i],
      date: dateStr,
      vocabulary,
      conversation,
      chat,
      total: vocabulary + conversation + chat,
    })
  }

  return result
}

// --- 월간 활동 데이터 ---

export interface MonthlyActivityDay {
  date: string     // 'YYYY-MM-DD'
  count: number    // total activities
  dayOfWeek: number // 0-6 (일요일=0)
}

export function getMonthlyActivity(): MonthlyActivityDay[] {
  if (typeof window === 'undefined') return []

  const records = getAllRecords()
  const today = new Date()
  const result: MonthlyActivityDay[] = []

  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() - i)
    const dateStr = toDateString(targetDate)

    const count = records.filter(r => r.completedAt.startsWith(dateStr)).length

    result.push({
      date: dateStr,
      count,
      dayOfWeek: targetDate.getDay(),
    })
  }

  return result
}

// --- 타입별 분포 ---

export interface TypeDistribution {
  vocabulary: number
  conversation: number
  chat: number
  community: number
  total: number
}

export function getTypeDistribution(): TypeDistribution {
  if (typeof window === 'undefined') {
    return { vocabulary: 0, conversation: 0, chat: 0, community: 0, total: 0 }
  }

  const records = getAllRecords()
  const vocabulary = records.filter(r => r.type === 'vocabulary').length
  const conversation = records.filter(r => r.type === 'conversation').length
  const chat = records.filter(r => r.type === 'chat').length
  const community = records.filter(r => r.type === 'community').length

  return {
    vocabulary,
    conversation,
    chat,
    community,
    total: vocabulary + conversation + chat + community,
  }
}

// --- 시간대별 학습 패턴 ---

export function getHourlyPattern(): number[] {
  if (typeof window === 'undefined') return new Array(24).fill(0)

  const records = getAllRecords()
  const hours: number[] = new Array(24).fill(0)

  records.forEach(record => {
    const date = new Date(record.completedAt)
    const hour = date.getHours()
    hours[hour] += 1
  })

  return hours
}

// --- 레벨별 분포 ---

export function getLevelDistribution(): Record<string, number> {
  if (typeof window === 'undefined') {
    return { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
  }

  const records = getAllRecords()
  const levels: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }

  records.forEach(record => {
    if (record.type === 'vocabulary' && record.details?.level) {
      const level = record.details.level
      if (level in levels) {
        levels[level] += 1
      }
    }
  })

  return levels
}

// --- 주간 비교 ---

export interface WeekComparison {
  thisWeek: { days: number; words: number; conversations: number; sessions: number }
  lastWeek: { days: number; words: number; conversations: number; sessions: number }
  changes: { days: number; words: number; conversations: number; sessions: number }
}

export function getWeekOverWeekComparison(): WeekComparison {
  const empty = { days: 0, words: 0, conversations: 0, sessions: 0 }
  if (typeof window === 'undefined') {
    return { thisWeek: { ...empty }, lastWeek: { ...empty }, changes: { ...empty } }
  }

  const records = getAllRecords()
  const today = new Date()
  const thisMonday = getMondayOfWeek(today)

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)

  const thisWeekRecords = records.filter(r => {
    const d = new Date(r.completedAt)
    return d >= thisMonday
  })
  const lastWeekRecords = records.filter(r => {
    const d = new Date(r.completedAt)
    return d >= lastMonday && d < thisMonday
  })

  const calcWeek = (weekRecords: LearningRecord[]) => {
    const activeDays = new Set(weekRecords.map(r => r.completedAt.split('T')[0]))
    return {
      days: activeDays.size,
      words: weekRecords.filter(r => r.type === 'vocabulary').length,
      conversations: weekRecords.filter(r => r.type === 'conversation').length,
      sessions: weekRecords.length,
    }
  }

  const thisWeek = calcWeek(thisWeekRecords)
  const lastWeek = calcWeek(lastWeekRecords)

  return {
    thisWeek,
    lastWeek,
    changes: {
      days: thisWeek.days - lastWeek.days,
      words: thisWeek.words - lastWeek.words,
      conversations: thisWeek.conversations - lastWeek.conversations,
      sessions: thisWeek.sessions - lastWeek.sessions,
    },
  }
}

// --- 인사이트 메시지 생성 ---

export function generateInsightMessages(
  stats: ExtendedStats,
  weekComparison: WeekComparison,
  hourlyPattern: number[]
): string[] {
  const messages: string[] = []

  // 연속 학습 스트릭
  if (stats.streak >= 7) {
    messages.push(`${stats.streak}일 연속 학습 중! 대단해요!`)
  } else if (stats.streak >= 3) {
    messages.push(`${stats.streak}일 연속 학습 중이에요!`)
  } else if (stats.streak === 0) {
    messages.push('오늘 학습을 시작해보세요!')
  } else {
    messages.push(`${stats.streak}일 연속 학습 중!`)
  }

  // 피크 시간대
  const maxHourCount = Math.max(...hourlyPattern)
  if (maxHourCount > 0) {
    const peakHour = hourlyPattern.indexOf(maxHourCount)
    const period = peakHour < 12 ? '오전' : '오후'
    const displayHour = peakHour === 0 ? 12 : peakHour <= 12 ? peakHour : peakHour - 12
    messages.push(`주로 ${period} ${displayHour}시에 학습하시네요`)
  }

  // 지난주 대비 단어 변화
  if (weekComparison.changes.words > 0) {
    messages.push(`지난주보다 단어를 ${weekComparison.changes.words}개 더 학습했어요`)
  }
  if (weekComparison.changes.conversations > 0) {
    messages.push(`지난주보다 회화를 ${weekComparison.changes.conversations}회 더 연습했어요`)
  }

  // 이번 주 학습일
  if (weekComparison.thisWeek.days > 0) {
    messages.push(`이번 주 ${weekComparison.thisWeek.days}일 학습했어요`)
  }

  // 레벨별 학습량
  const levelEntries = Object.entries(stats.levelProgress)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  if (levelEntries.length > 0) {
    const [topLevel] = levelEntries[0]
    messages.push(`${topLevel} 레벨 단어를 가장 많이 학습했어요`)
  }

  // Flu 사용 기간
  if (stats.daysSinceStart > 1) {
    messages.push(`Flu와 함께한 지 ${stats.daysSinceStart}일째`)
  }

  // 누적 통계
  if (stats.totalLifetimeWords >= 100) {
    messages.push(`누적 ${stats.totalLifetimeWords}개 단어를 학습했어요!`)
  }

  // 최고 스트릭 정보
  if (stats.bestStreak > stats.streak && stats.bestStreak >= 5) {
    messages.push(`최고 기록은 ${stats.bestStreak}일 연속이에요. 도전해보세요!`)
  }

  return messages
}

// --- 성취 배지 ---

export interface Achievement {
  id: string
  name: string
  description: string
  condition: string
  achieved: boolean
  achievedAt?: string
}

export function checkAchievements(stats: ExtendedStats): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first_step',
      name: '첫 발걸음',
      description: '첫 학습을 완료했어요',
      condition: '첫 학습 완료',
      achieved: stats.totalLifetimeSessions >= 1,
    },
    {
      id: 'streak_3',
      name: '3일 연속',
      description: '3일 연속 학습했어요',
      condition: '3일 연속 학습',
      achieved: stats.bestStreak >= 3,
    },
    {
      id: 'streak_7',
      name: '일주일 연속',
      description: '7일 연속 학습했어요',
      condition: '7일 연속 학습',
      achieved: stats.bestStreak >= 7,
    },
    {
      id: 'streak_14',
      name: '2주 연속',
      description: '14일 연속 학습했어요',
      condition: '14일 연속 학습',
      achieved: stats.bestStreak >= 14,
    },
    {
      id: 'streak_30',
      name: '한 달 연속',
      description: '30일 연속 학습했어요',
      condition: '30일 연속 학습',
      achieved: stats.bestStreak >= 30,
    },
    {
      id: 'words_50',
      name: '단어 입문자',
      description: '단어 50개를 학습했어요',
      condition: '단어 50개 학습',
      achieved: stats.totalLifetimeWords >= 50,
    },
    {
      id: 'words_100',
      name: '단어 수집가',
      description: '단어 100개를 학습했어요',
      condition: '단어 100개 학습',
      achieved: stats.totalLifetimeWords >= 100,
    },
    {
      id: 'words_300',
      name: '단어 전문가',
      description: '단어 300개를 학습했어요',
      condition: '단어 300개 학습',
      achieved: stats.totalLifetimeWords >= 300,
    },
    {
      id: 'words_500',
      name: '단어 마스터',
      description: '단어 500개를 학습했어요',
      condition: '단어 500개 학습',
      achieved: stats.totalLifetimeWords >= 500,
    },
    {
      id: 'level_b1',
      name: '레벨업',
      description: 'B1 이상 단어를 학습했어요',
      condition: 'B1+ 레벨 단어 학습',
      achieved: (stats.levelProgress['B1'] || 0) > 0 ||
                (stats.levelProgress['B2'] || 0) > 0 ||
                (stats.levelProgress['C1'] || 0) > 0 ||
                (stats.levelProgress['C2'] || 0) > 0,
    },
  ]

  // achievedAt 설정
  if (typeof window !== 'undefined') {
    const savedStr = localStorage.getItem('enpeak_achievements')
    const saved: Record<string, string> = savedStr ? JSON.parse(savedStr) : {}
    const updatedSaved = { ...saved }

    achievements.forEach(a => {
      if (a.achieved) {
        if (!updatedSaved[a.id]) {
          updatedSaved[a.id] = new Date().toISOString()
        }
        a.achievedAt = updatedSaved[a.id]
      }
    })

    localStorage.setItem('enpeak_achievements', JSON.stringify(updatedSaved))
  }

  return achievements
}
