// 저장 문장 관리 (SM-2 간격반복 + Firebase 동기화)
import { calculateSM2, getDefaultSM2Fields, needsReview } from './spacedRepetition'
import { syncToFirebaseIfLoggedIn } from './userDataSync'

const STORAGE_KEY = 'enpeak-saved-sentences'

export interface SavedSentence {
  id: string
  sentence: string
  translation: string
  sourceContext?: string
  keyWords?: string[]
  savedAt: number
  mastery: number
  reviewCount: number
  correctCount: number
  lastReviewedAt: number | null
  nextReviewAt: number
  easeFactor: number
  interval: number
}

// 간단한 ID 생성 (nanoid 대체)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 문장에서 핵심 단어 추출 (빈칸채우기용)
function extractKeyWords(sentence: string): string[] {
  const words = sentence
    .replace(/[.,!?;:'"()]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 4) // 4글자 이상 단어만
  // 랜덤으로 1~2개 선택
  const shuffled = words.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(2, Math.max(1, Math.floor(words.length / 3))))
}

function getAll(): SavedSentence[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as SavedSentence[]
  } catch {
    return []
  }
}

function persist(sentences: SavedSentence[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences))
  syncToFirebaseIfLoggedIn({ savedSentences: sentences }).catch(() => {})
}

export function saveSentence(entry: {
  sentence: string
  translation: string
  sourceContext?: string
  keyWords?: string[]
}) {
  const sentences = getAll()
  // 중복 체크
  const normalized = entry.sentence.toLowerCase().trim()
  if (sentences.some(s => s.sentence.toLowerCase().trim() === normalized)) return

  const defaults = getDefaultSM2Fields()
  const newSentence: SavedSentence = {
    id: generateId(),
    sentence: entry.sentence,
    translation: entry.translation,
    sourceContext: entry.sourceContext,
    keyWords: entry.keyWords || extractKeyWords(entry.sentence),
    savedAt: Date.now(),
    ...defaults,
  }

  sentences.unshift(newSentence)
  persist(sentences)
}

export function removeSentence(id: string) {
  const sentences = getAll().filter(s => s.id !== id)
  persist(sentences)
}

export function isSentenceSaved(sentence: string): boolean {
  const normalized = sentence.toLowerCase().trim()
  return getAll().some(s => s.sentence.toLowerCase().trim() === normalized)
}

export function getSavedSentences(): SavedSentence[] {
  return getAll()
}

export function getSavedSentenceCount(): number {
  return getAll().length
}

// SM-2 기반 숙련도 업데이트
export function updateSentenceMastery(id: string, quality: number) {
  const sentences = getAll()
  const idx = sentences.findIndex(s => s.id === id)
  if (idx === -1) return

  const s = sentences[idx]
  const result = calculateSM2({
    quality,
    easeFactor: s.easeFactor,
    interval: s.interval,
    reviewCount: s.reviewCount,
    correctCount: s.correctCount,
  })

  sentences[idx] = {
    ...s,
    mastery: result.mastery,
    reviewCount: s.reviewCount + 1,
    correctCount: quality >= 3 ? s.correctCount + 1 : s.correctCount,
    lastReviewedAt: Date.now(),
    nextReviewAt: result.nextReviewAt,
    easeFactor: result.easeFactor,
    interval: result.interval,
  }

  persist(sentences)
}

// 복습 필요 문장
export function getSentencesForReview(): SavedSentence[] {
  return getAll().filter(s => needsReview(s.nextReviewAt))
}

// 통계
export interface SentenceStats {
  total: number
  needsReview: number
  mastered: number
  averageMastery: number
}

export function getSentenceStats(): SentenceStats {
  const sentences = getAll()
  const total = sentences.length
  if (total === 0) {
    return { total: 0, needsReview: 0, mastered: 0, averageMastery: 0 }
  }

  const needsReviewCount = sentences.filter(s => needsReview(s.nextReviewAt)).length
  const mastered = sentences.filter(s => s.mastery >= 4).length
  const avgMastery = sentences.reduce((sum, s) => sum + s.mastery, 0) / total

  return {
    total,
    needsReview: needsReviewCount,
    mastered,
    averageMastery: Math.round(avgMastery * 10) / 10,
  }
}

// 외부에서 직접 저장 (Firebase 동기화 용도)
export function setSavedSentencesDirectly(sentences: SavedSentence[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences))
}
