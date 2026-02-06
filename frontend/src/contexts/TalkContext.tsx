'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type TalkMode = 'free' | 'expression' | 'roleplay'

export interface ExpressionData {
  expression: string
  meaning: string
}

export interface ScenarioData {
  id: string
  title: string
}

export interface SituationData {
  situation: string
  label: string
}

interface TalkContextType {
  mode: TalkMode
  setMode: (mode: TalkMode) => void
  expressionData: ExpressionData | null
  setExpression: (data: ExpressionData | null) => void
  scenarioData: ScenarioData | null
  setScenario: (data: ScenarioData | null) => void
  situationData: SituationData | null
  setSituation: (data: SituationData | null) => void
  clearConversation: () => void
}

const TalkContext = createContext<TalkContextType | null>(null)

const DEFAULT_MODE: TalkMode = 'free'
const STORAGE_KEY = 'enpeak-talk-mode'

// 초기값을 sessionStorage에서 읽어오기 (SSR 대응)
function getInitialMode(): TalkMode {
  if (typeof window === 'undefined') return DEFAULT_MODE

  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved && (saved === 'free' || saved === 'expression' || saved === 'roleplay')) {
      return saved as TalkMode
    }
  } catch {
    // ignore errors
  }
  return DEFAULT_MODE
}

export function TalkProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TalkMode>(() => {
    // 클라이언트에서 초기값을 바로 sessionStorage에서 읽어옴
    if (typeof window !== 'undefined') {
      return getInitialMode()
    }
    return DEFAULT_MODE
  })
  const [expressionData, setExpressionState] = useState<ExpressionData | null>(null)
  const [scenarioData, setScenarioState] = useState<ScenarioData | null>(null)
  const [situationData, setSituationState] = useState<SituationData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // 컴포넌트 마운트 후 로드 완료 표시
  useEffect(() => {
    // hydration 후 다시 한번 로드 (SSR/CSR 불일치 방지)
    const savedMode = getInitialMode()
    setModeState(savedMode)
    setIsLoaded(true)
  }, [])

  // 모드 저장
  const saveMode = (newMode: TalkMode) => {
    setModeState(newMode)
    try {
      sessionStorage.setItem(STORAGE_KEY, newMode)
    } catch {
      // ignore storage errors
    }
  }

  const setMode = (newMode: TalkMode) => {
    saveMode(newMode)
  }

  const setExpression = (data: ExpressionData | null) => {
    setExpressionState(data)
  }

  const setScenario = (data: ScenarioData | null) => {
    setScenarioState(data)
  }

  const setSituation = (data: SituationData | null) => {
    setSituationState(data)
  }

  const clearConversation = () => {
    setModeState(DEFAULT_MODE)
    setExpressionState(null)
    setScenarioState(null)
    setSituationState(null)
    try {
      sessionStorage.setItem(STORAGE_KEY, DEFAULT_MODE)
    } catch {
      // ignore storage errors
    }
  }

  return (
    <TalkContext.Provider
      value={{
        mode,
        setMode,
        expressionData,
        setExpression,
        scenarioData,
        setScenario,
        situationData,
        setSituation,
        clearConversation,
      }}
    >
      {children}
    </TalkContext.Provider>
  )
}

export function useTalk() {
  const context = useContext(TalkContext)
  if (!context) {
    throw new Error('useTalk must be used within TalkProvider')
  }
  return context
}
