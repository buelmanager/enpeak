'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { syncToFirebaseIfLoggedIn } from '@/lib/userDataSync'

export interface TTSVoice {
  name: string
  lang: string
  gender: 'male' | 'female' | 'unknown'
  voiceURI: string
}

interface TTSSettings {
  selectedVoice: TTSVoice | null
  rate: number  // 0.5 - 2.0
  pitch: number // 0.5 - 2.0
}

interface TTSContextType {
  voices: TTSVoice[]
  settings: TTSSettings
  setSettings: (settings: TTSSettings) => void
  speak: (text: string) => void
  speakWithCallback: (text: string, onEnd?: () => void) => void
  stop: () => void
  isSpeaking: boolean
  isLoaded: boolean
}

const TTSContext = createContext<TTSContextType | null>(null)

// 기본 설정
const DEFAULT_SETTINGS: TTSSettings = {
  selectedVoice: null,
  rate: 1.0,
  pitch: 1.2,
}

// 모바일 우선 음성 순위 (iOS/Android에서 품질 좋은 음성)
const PREFERRED_VOICES = [
  // iOS 고품질 음성 (Siri 음성)
  'samantha', 'karen', 'daniel', 'moira', 'tessa', 'fiona',
  // Android 고품질 음성
  'google us english', 'google uk english',
  // Windows 고품질 음성
  'zira', 'david', 'mark',
  // macOS 고품질 음성
  'alex', 'victoria', 'kate',
]

// 음성 성별 추정
function detectGender(voice: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
  const name = voice.name.toLowerCase()

  // 여성 음성 키워드
  if (name.includes('female') || name.includes('woman') ||
      name.includes('samantha') || name.includes('karen') ||
      name.includes('moira') || name.includes('tessa') ||
      name.includes('fiona') || name.includes('victoria') ||
      name.includes('zira') || name.includes('susan') ||
      name.includes('hazel') || name.includes('kate') ||
      name.includes('ava') || name.includes('allison') ||
      name.includes('susan') || name.includes('emily')) {
    return 'female'
  }

  // 남성 음성 키워드
  if (name.includes('male') || name.includes('man') ||
      name.includes('daniel') || name.includes('alex') ||
      name.includes('tom') || name.includes('david') ||
      name.includes('mark') || name.includes('fred') ||
      name.includes('ralph') || name.includes('albert') ||
      name.includes('bruce') || name.includes('james')) {
    return 'male'
  }

  return 'unknown'
}

export function TTSProvider({ children }: { children: ReactNode }) {
  const [voices, setVoices] = useState<TTSVoice[]>([])
  const [settings, setSettingsState] = useState<TTSSettings>(DEFAULT_SETTINGS)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // 음성 목록 로드
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    const loadVoices = () => {
      const synth = window.speechSynthesis
      const availableVoices = synth.getVoices()

      // 영어 음성만 필터링
      const englishVoices = availableVoices
        .filter(v => v.lang.startsWith('en'))
        .map(v => ({
          name: v.name,
          lang: v.lang,
          gender: detectGender(v),
          voiceURI: v.voiceURI,
        }))
        .sort((a, b) => {
          // 성별로 정렬 (여성 먼저)
          if (a.gender === 'female' && b.gender !== 'female') return -1
          if (a.gender !== 'female' && b.gender === 'female') return 1
          return a.name.localeCompare(b.name)
        })

      setVoices(englishVoices)

      // 저장된 설정 로드
      const saved = localStorage.getItem('tts-settings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // 저장된 음성이 사용 가능한지 확인
          const savedVoice = englishVoices.find(v => v.voiceURI === parsed.selectedVoice?.voiceURI)
          setSettingsState({
            ...parsed,
            selectedVoice: savedVoice || englishVoices[0] || null,
          })
        } catch {
          // 기본 음성 선택
          if (englishVoices.length > 0) {
            setSettingsState(prev => ({ ...prev, selectedVoice: englishVoices[0] }))
          }
        }
      } else if (englishVoices.length > 0) {
        // 모바일 최적화: 우선순위 음성 선택
        let bestVoice = englishVoices[0]

        // 우선순위 목록에서 음성 찾기
        for (const preferred of PREFERRED_VOICES) {
          const found = englishVoices.find(v =>
            v.name.toLowerCase().includes(preferred)
          )
          if (found) {
            bestVoice = found
            break
          }
        }

        // 우선순위에 없으면 여성 음성 선호
        if (bestVoice === englishVoices[0]) {
          const femaleVoice = englishVoices.find(v => v.gender === 'female')
          if (femaleVoice) bestVoice = femaleVoice
        }

        setSettingsState(prev => ({ ...prev, selectedVoice: bestVoice }))
      }

      setIsLoaded(true)
    }

    // Chrome에서는 비동기로 로드됨
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  // 설정 저장
  const setSettings = (newSettings: TTSSettings) => {
    setSettingsState(newSettings)
    localStorage.setItem('tts-settings', JSON.stringify(newSettings))

    // Firebase 동기화 (로그인된 경우)
    syncToFirebaseIfLoggedIn({ ttsSettings: newSettings })
  }

  // 음성 재생 (내부 헬퍼)
  const createUtterance = (text: string, onEnd?: () => void): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    // 값이 유효한지 확인하고 기본값 적용
    utterance.rate = Number.isFinite(settings.rate) ? settings.rate : DEFAULT_SETTINGS.rate
    utterance.pitch = Number.isFinite(settings.pitch) ? settings.pitch : DEFAULT_SETTINGS.pitch

    const synth = window.speechSynthesis
    const availableVoices = synth.getVoices()

    // 선택된 음성 찾기
    if (settings.selectedVoice) {
      const voice = availableVoices.find(v => v.voiceURI === settings.selectedVoice?.voiceURI)
      if (voice) {
        utterance.voice = voice
      } else {
        // 선택된 음성을 찾을 수 없으면 영어 음성 사용
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en'))
        if (englishVoice) {
          utterance.voice = englishVoice
        }
      }
    } else {
      // 선택된 음성이 없으면 영어 음성 사용
      const englishVoice = availableVoices.find(v => v.lang.startsWith('en'))
      if (englishVoice) {
        utterance.voice = englishVoice
      }
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      onEnd?.()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      onEnd?.()
    }

    return utterance
  }

  // 음성 재생
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return

    const synth = window.speechSynthesis
    synth.cancel() // 기존 재생 중지

    const utterance = createUtterance(text)
    synth.speak(utterance)
  }

  // 음성 재생 + 완료 콜백
  const speakWithCallback = (text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      console.log('[TTS] speechSynthesis not available, calling onEnd')
      onEnd?.()
      return
    }

    const synth = window.speechSynthesis
    synth.cancel() // 기존 재생 중지

    const utterance = createUtterance(text, () => {
      console.log('[TTS] utterance ended, calling onEnd callback')
      onEnd?.()
    })

    console.log('[TTS] Starting speech:', text.substring(0, 50) + '...')
    synth.speak(utterance)

    // Chrome에서 TTS가 시작되지 않을 경우를 위한 타임아웃
    // (autoplay policy로 인해 발생할 수 있음)
    setTimeout(() => {
      if (!synth.speaking && !synth.pending) {
        console.log('[TTS] Speech did not start (possibly blocked), calling onEnd')
        setIsSpeaking(false)
        onEnd?.()
      }
    }, 500)
  }

  // 재생 중지
  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <TTSContext.Provider value={{
      voices,
      settings,
      setSettings,
      speak,
      speakWithCallback,
      stop,
      isSpeaking,
      isLoaded,
    }}>
      {children}
    </TTSContext.Provider>
  )
}

export function useTTS() {
  const context = useContext(TTSContext)
  if (!context) {
    throw new Error('useTTS must be used within TTSProvider')
  }
  return context
}
