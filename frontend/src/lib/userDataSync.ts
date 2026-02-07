// Firebase 사용자 데이터 동기화 유틸리티
import { db, doc, getDoc, setDoc, updateDoc, serverTimestamp } from './firebase'
import type { LearningRecord } from './learningHistory'

// localStorage 키
const STORAGE_KEYS = {
  LEARNING_HISTORY: 'enpeak_learning_history',
  LEARNING_STATS: 'enpeak_learning_stats',
  TTS_SETTINGS: 'tts-settings',
  PWA_DISMISSED: 'pwa-guide-dismissed',
}

// Firestore 사용자 데이터 구조
export interface UserData {
  learningHistory: LearningRecord[]
  learningStats: {
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
  ttsSettings: {
    selectedVoice: {
      name: string
      lang: string
      gender: 'male' | 'female' | 'unknown'
      voiceURI: string
    } | null
    rate: number
    pitch: number
  } | null
  conversationSettings?: {
    inputMode: 'voice' | 'text'
  }
  createdAt?: any
  updatedAt?: any
}

// 기본 사용자 데이터
const DEFAULT_USER_DATA: UserData = {
  learningHistory: [],
  learningStats: {
    lastActiveDate: null,
    streak: 0,
    todayStats: {
      date: new Date().toISOString().split('T')[0],
      totalSessions: 0,
      totalMinutes: 0,
      vocabularyWords: 0,
      conversationScenarios: 0,
    },
  },
  ttsSettings: null,
}

// 로컬 데이터 가져오기
function getLocalData(): Partial<UserData> {
  if (typeof window === 'undefined') return {}

  const data: Partial<UserData> = {}

  // 학습 기록
  const historyStr = localStorage.getItem(STORAGE_KEYS.LEARNING_HISTORY)
  if (historyStr) {
    try {
      data.learningHistory = JSON.parse(historyStr)
    } catch {}
  }

  // 학습 통계
  const statsStr = localStorage.getItem(STORAGE_KEYS.LEARNING_STATS)
  if (statsStr) {
    try {
      data.learningStats = JSON.parse(statsStr)
    } catch {}
  }

  // TTS 설정
  const ttsStr = localStorage.getItem(STORAGE_KEYS.TTS_SETTINGS)
  if (ttsStr) {
    try {
      data.ttsSettings = JSON.parse(ttsStr)
    } catch {}
  }

  return data
}

// 로컬 데이터 저장하기
function setLocalData(data: Partial<UserData>) {
  if (typeof window === 'undefined') return

  if (data.learningHistory !== undefined) {
    localStorage.setItem(STORAGE_KEYS.LEARNING_HISTORY, JSON.stringify(data.learningHistory))
  }

  if (data.learningStats !== undefined) {
    localStorage.setItem(STORAGE_KEYS.LEARNING_STATS, JSON.stringify(data.learningStats))
  }

  if (data.ttsSettings !== undefined) {
    localStorage.setItem(STORAGE_KEYS.TTS_SETTINGS, JSON.stringify(data.ttsSettings))
  }
}

// Firebase에서 사용자 데이터 가져오기
export async function getUserDataFromFirebase(userId: string): Promise<UserData | null> {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as UserData
    }
    return null
  } catch (error) {
    console.error('Failed to get user data from Firebase:', error)
    return null
  }
}

// Firebase에 사용자 데이터 저장하기
export async function saveUserDataToFirebase(userId: string, data: Partial<UserData>): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } else {
      await setDoc(docRef, {
        ...DEFAULT_USER_DATA,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
    return true
  } catch (error) {
    console.error('Failed to save user data to Firebase:', error)
    return false
  }
}

// 로컬 데이터를 Firebase로 마이그레이션 (로그인 시)
export async function migrateLocalDataToFirebase(userId: string): Promise<boolean> {
  try {
    const localData = getLocalData()

    // 로컬에 데이터가 없으면 마이그레이션 불필요
    if (!localData.learningHistory?.length && !localData.learningStats && !localData.ttsSettings) {
      return true
    }

    // Firebase에서 기존 데이터 가져오기
    const existingData = await getUserDataFromFirebase(userId)

    if (existingData) {
      // 기존 데이터가 있으면 병합
      const mergedHistory = mergeHistory(
        existingData.learningHistory || [],
        localData.learningHistory || []
      )

      const mergedStats = mergeStats(
        existingData.learningStats,
        localData.learningStats
      )

      // TTS 설정은 로컬 우선 (최신 설정)
      const mergedTTS = localData.ttsSettings || existingData.ttsSettings

      await saveUserDataToFirebase(userId, {
        learningHistory: mergedHistory,
        learningStats: mergedStats,
        ttsSettings: mergedTTS,
      })

      // 로컬에도 병합된 데이터 저장
      setLocalData({
        learningHistory: mergedHistory,
        learningStats: mergedStats,
        ttsSettings: mergedTTS,
      })
    } else {
      // 기존 데이터가 없으면 로컬 데이터를 그대로 저장
      await saveUserDataToFirebase(userId, localData)
    }

    return true
  } catch (error) {
    console.error('Failed to migrate local data to Firebase:', error)
    return false
  }
}

// 학습 기록 병합 (중복 제거)
function mergeHistory(
  existingHistory: LearningRecord[],
  localHistory: LearningRecord[]
): LearningRecord[] {
  const existingIds = new Set(existingHistory.map(r => r.id))
  const merged = [...existingHistory]

  for (const record of localHistory) {
    if (!existingIds.has(record.id)) {
      merged.push(record)
    }
  }

  // 최신순 정렬 후 100개 제한
  merged.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
  return merged.slice(0, 100)
}

// 통계 병합 (더 높은 streak 유지)
function mergeStats(
  existingStats: UserData['learningStats'] | undefined,
  localStats: UserData['learningStats'] | undefined
): UserData['learningStats'] {
  if (!existingStats && !localStats) {
    return DEFAULT_USER_DATA.learningStats
  }
  if (!existingStats) return localStats!
  if (!localStats) return existingStats

  // 더 높은 streak 선택
  const streak = Math.max(existingStats.streak, localStats.streak)

  // 오늘 날짜 기준으로 todayStats 병합
  const today = new Date().toISOString().split('T')[0]
  let todayStats = DEFAULT_USER_DATA.learningStats.todayStats

  if (existingStats.todayStats.date === today && localStats.todayStats.date === today) {
    // 둘 다 오늘 데이터면 더 큰 값 선택 (같은 세션 데이터가 양쪽에 있을 수 있으므로 합산 대신 max 유지)
    todayStats = {
      date: today,
      totalSessions: Math.max(existingStats.todayStats.totalSessions, localStats.todayStats.totalSessions),
      totalMinutes: Math.max(existingStats.todayStats.totalMinutes, localStats.todayStats.totalMinutes),
      vocabularyWords: Math.max(existingStats.todayStats.vocabularyWords, localStats.todayStats.vocabularyWords),
      conversationScenarios: Math.max(existingStats.todayStats.conversationScenarios, localStats.todayStats.conversationScenarios),
    }
  } else if (existingStats.todayStats.date === today) {
    todayStats = existingStats.todayStats
  } else if (localStats.todayStats.date === today) {
    todayStats = localStats.todayStats
  }

  // 더 최근 활동 날짜 선택
  const lastActiveDate = existingStats.lastActiveDate && localStats.lastActiveDate
    ? (existingStats.lastActiveDate > localStats.lastActiveDate ? existingStats.lastActiveDate : localStats.lastActiveDate)
    : existingStats.lastActiveDate || localStats.lastActiveDate

  return {
    lastActiveDate,
    streak,
    todayStats,
  }
}

// Firebase에서 로컬로 데이터 동기화 (로그인 후)
export async function syncDataFromFirebase(userId: string): Promise<boolean> {
  try {
    const firebaseData = await getUserDataFromFirebase(userId)
    if (firebaseData) {
      setLocalData({
        learningHistory: firebaseData.learningHistory,
        learningStats: firebaseData.learningStats,
        ttsSettings: firebaseData.ttsSettings,
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to sync data from Firebase:', error)
    return false
  }
}

// 현재 사용자 ID (AuthContext에서 관리하는 것을 가져오기 위한 헬퍼)
let currentUserId: string | null = null

export function setCurrentUserId(userId: string | null) {
  currentUserId = userId
}

export function getCurrentUserId(): string | null {
  return currentUserId
}

// 데이터 변경 시 Firebase에 자동 동기화
export async function syncToFirebaseIfLoggedIn(data: Partial<UserData>): Promise<void> {
  if (currentUserId) {
    await saveUserDataToFirebase(currentUserId, data)
  }
}
