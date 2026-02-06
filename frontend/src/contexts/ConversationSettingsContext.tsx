'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { syncToFirebaseIfLoggedIn } from '@/lib/userDataSync'

export interface ConversationSettings {
  inputMode: 'voice' | 'text'  // 입력 방식: 음성 또는 텍스트
  sttFallbackEnabled: boolean  // 백엔드 Whisper STT 폴백 사용 여부
}

interface ConversationSettingsContextType {
  settings: ConversationSettings
  updateSettings: (updates: Partial<ConversationSettings>) => void
  setInputMode: (mode: ConversationSettings['inputMode']) => void
  isLoaded: boolean
}

const ConversationSettingsContext = createContext<ConversationSettingsContextType | null>(null)

const DEFAULT_SETTINGS: ConversationSettings = {
  inputMode: 'voice',  // 기본값: 음성 입력
  sttFallbackEnabled: true,  // 기본값: 폴백 활성화
}

const STORAGE_KEY = 'enpeak-conversation-settings'

// 초기값을 localStorage에서 읽어오기 (SSR 대응)
function getInitialSettings(): ConversationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS
}

export function ConversationSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConversationSettings>(() => {
    // 클라이언트에서 초기값을 바로 localStorage에서 읽어옴
    if (typeof window !== 'undefined') {
      return getInitialSettings()
    }
    return DEFAULT_SETTINGS
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // 컴포넌트 마운트 후 로드 완료 표시
  useEffect(() => {
    // hydration 후 다시 한번 로드 (SSR/CSR 불일치 방지)
    const savedSettings = getInitialSettings()
    setSettings(savedSettings)
    setIsLoaded(true)
  }, [])

  // 설정 저장
  const saveSettings = (newSettings: ConversationSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))

    // Firebase 동기화 (로그인된 경우)
    syncToFirebaseIfLoggedIn({ conversationSettings: newSettings })
  }

  const updateSettings = (updates: Partial<ConversationSettings>) => {
    const newSettings = { ...settings, ...updates }
    saveSettings(newSettings)
  }

  const setInputMode = (mode: ConversationSettings['inputMode']) => {
    updateSettings({ inputMode: mode })
  }

  return (
    <ConversationSettingsContext.Provider value={{
      settings,
      updateSettings,
      setInputMode,
      isLoaded,
    }}>
      {children}
    </ConversationSettingsContext.Provider>
  )
}

export function useConversationSettings() {
  const context = useContext(ConversationSettingsContext)
  if (!context) {
    throw new Error('useConversationSettings must be used within ConversationSettingsProvider')
  }
  return context
}
