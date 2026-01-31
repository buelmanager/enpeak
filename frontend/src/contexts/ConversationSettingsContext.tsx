'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { syncToFirebaseIfLoggedIn } from '@/lib/userDataSync'

export interface ConversationSettings {
  autoTTS: boolean           // AI 응답 자동 읽기
  autoRecord: boolean        // 사용자 턴 자동 녹음
  inputMode: 'voice' | 'text' | 'both'  // 입력 방식
}

interface ConversationSettingsContextType {
  settings: ConversationSettings
  updateSettings: (updates: Partial<ConversationSettings>) => void
  toggleAutoTTS: () => void
  toggleAutoRecord: () => void
  setInputMode: (mode: ConversationSettings['inputMode']) => void
  isLoaded: boolean
}

const ConversationSettingsContext = createContext<ConversationSettingsContextType | null>(null)

const DEFAULT_SETTINGS: ConversationSettings = {
  autoTTS: false,
  autoRecord: false,
  inputMode: 'both',
}

const STORAGE_KEY = 'conversation-settings'

// 초기값을 localStorage에서 읽어오기 (SSR 대응)
function getInitialSettings(): ConversationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_SETTINGS, ...parsed }
    } catch {
      return DEFAULT_SETTINGS
    }
  }
  return DEFAULT_SETTINGS
}

export function ConversationSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConversationSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // 저장된 설정 로드 (클라이언트 사이드에서)
  useEffect(() => {
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

  const toggleAutoTTS = () => {
    updateSettings({ autoTTS: !settings.autoTTS })
  }

  const toggleAutoRecord = () => {
    updateSettings({ autoRecord: !settings.autoRecord })
  }

  const setInputMode = (mode: ConversationSettings['inputMode']) => {
    updateSettings({ inputMode: mode })
  }

  return (
    <ConversationSettingsContext.Provider value={{
      settings,
      updateSettings,
      toggleAutoTTS,
      toggleAutoRecord,
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
