// 저장 단어 관리 (SM-2 간격반복 + Firebase 동기화)
import { calculateSM2, getDefaultSM2Fields, needsReview } from './spacedRepetition'
import { syncToFirebaseIfLoggedIn } from './userDataSync'

const STORAGE_KEY = 'enpeak-saved-words'

export interface SavedWord {
  word: string
  meaning: string
  pronunciation?: string
  example?: string
  savedAt: number
  // 간격반복 & 숙련도
  level?: string
  sourceContext?: string
  mastery: number
  reviewCount: number
  correctCount: number
  lastReviewedAt: number | null
  nextReviewAt: number
  easeFactor: number
  interval: number
}

// 기존 단어 마이그레이션 (신규 필드 없는 경우 기본값 채움)
function migrateWord(w: any): SavedWord {
  const defaults = getDefaultSM2Fields()
  return {
    word: w.word || '',
    meaning: w.meaning || '',
    pronunciation: w.pronunciation,
    example: w.example,
    savedAt: w.savedAt || Date.now(),
    level: w.level,
    sourceContext: w.sourceContext,
    mastery: w.mastery ?? defaults.mastery,
    reviewCount: w.reviewCount ?? defaults.reviewCount,
    correctCount: w.correctCount ?? defaults.correctCount,
    lastReviewedAt: w.lastReviewedAt ?? defaults.lastReviewedAt,
    nextReviewAt: w.nextReviewAt ?? defaults.nextReviewAt,
    easeFactor: w.easeFactor ?? defaults.easeFactor,
    interval: w.interval ?? defaults.interval,
  }
}

function getAll(): SavedWord[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    return (parsed as any[]).map(migrateWord)
  } catch {
    return []
  }
}

function persist(words: SavedWord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  // Firebase 동기화
  syncToFirebaseIfLoggedIn({ savedWords: words }).catch(() => {})
}

export function saveWord(entry: {
  word: string
  meaning: string
  pronunciation?: string
  example?: string
  level?: string
  sourceContext?: string
}) {
  const words = getAll()
  const exists = words.some(w => w.word.toLowerCase() === entry.word.toLowerCase())
  if (exists) return

  const defaults = getDefaultSM2Fields()
  const newWord: SavedWord = {
    ...entry,
    savedAt: Date.now(),
    ...defaults,
  }
  words.unshift(newWord)
  persist(words)
}

export function removeWord(word: string) {
  const words = getAll().filter(w => w.word.toLowerCase() !== word.toLowerCase())
  persist(words)
}

export function isWordSaved(word: string): boolean {
  return getAll().some(w => w.word.toLowerCase() === word.toLowerCase())
}

export function getSavedWords(): SavedWord[] {
  return getAll()
}

export function getSavedWordCount(): number {
  return getAll().length
}

// SM-2 기반 숙련도 업데이트
export function updateWordMastery(word: string, quality: number) {
  const words = getAll()
  const idx = words.findIndex(w => w.word.toLowerCase() === word.toLowerCase())
  if (idx === -1) return

  const w = words[idx]
  const result = calculateSM2({
    quality,
    easeFactor: w.easeFactor,
    interval: w.interval,
    reviewCount: w.reviewCount,
    correctCount: w.correctCount,
  })

  words[idx] = {
    ...w,
    mastery: result.mastery,
    reviewCount: w.reviewCount + 1,
    correctCount: quality >= 3 ? w.correctCount + 1 : w.correctCount,
    lastReviewedAt: Date.now(),
    nextReviewAt: result.nextReviewAt,
    easeFactor: result.easeFactor,
    interval: result.interval,
  }

  persist(words)
}

// 복습 필요 단어 목록
export function getWordsForReview(): SavedWord[] {
  return getAll().filter(w => needsReview(w.nextReviewAt))
}

// 정렬
export type SortBy = 'date' | 'mastery' | 'alphabet' | 'level'
export type SortOrder = 'asc' | 'desc'

const LEVEL_ORDER: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }

export function getWordsSorted(sortBy: SortBy = 'date', order: SortOrder = 'desc'): SavedWord[] {
  const words = getAll()
  const dir = order === 'asc' ? 1 : -1

  words.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (a.savedAt - b.savedAt) * dir
      case 'mastery':
        return (a.mastery - b.mastery) * dir
      case 'alphabet':
        return a.word.localeCompare(b.word) * dir
      case 'level':
        return ((LEVEL_ORDER[a.level || ''] || 99) - (LEVEL_ORDER[b.level || ''] || 99)) * dir
      default:
        return 0
    }
  })

  return words
}

// 숙련도별 필터
export function getWordsByMastery(masteryLevel: number): SavedWord[] {
  return getAll().filter(w => w.mastery === masteryLevel)
}

// 복습 통계
export interface ReviewStats {
  total: number
  needsReview: number
  mastered: number       // mastery >= 4
  averageMastery: number
}

export function getReviewStats(): ReviewStats {
  const words = getAll()
  const total = words.length
  if (total === 0) {
    return { total: 0, needsReview: 0, mastered: 0, averageMastery: 0 }
  }

  const needsReviewCount = words.filter(w => needsReview(w.nextReviewAt)).length
  const mastered = words.filter(w => w.mastery >= 4).length
  const avgMastery = words.reduce((sum, w) => sum + w.mastery, 0) / total

  return {
    total,
    needsReview: needsReviewCount,
    mastered,
    averageMastery: Math.round(avgMastery * 10) / 10,
  }
}

// 외부에서 직접 저장 (Firebase 동기화 용도)
export function setSavedWordsDirectly(words: SavedWord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words.map(migrateWord)))
}
