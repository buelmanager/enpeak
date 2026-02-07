'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { syncToFirebaseIfLoggedIn } from '@/lib/userDataSync'
import { API_BASE, apiFetch } from '@/shared/constants/api'

export interface TTSVoice {
  name: string
  lang: string
  gender: 'male' | 'female' | 'unknown'
  voiceURI: string
}

export interface HDVoice {
  id: string
  name: string
  gender: 'male' | 'female'
  accent: string
}

interface TTSSettings {
  selectedVoice: TTSVoice | null
  rate: number  // 0.5 - 2.0
  pitch: number // 0.5 - 2.0
  ttsMode: 'device' | 'hd'
  hdVoice: string
}

interface TTSContextType {
  voices: TTSVoice[]
  hdVoices: HDVoice[]
  settings: TTSSettings
  setSettings: (settings: TTSSettings) => void
  speak: (text: string) => void
  speakWithCallback: (text: string, onEnd?: () => void, lang?: string) => void
  stop: () => void
  isSpeaking: boolean
  isLoaded: boolean
}

const TTSContext = createContext<TTSContextType | null>(null)


export const HD_VOICES: HDVoice[] = [
  { id: 'en-US-AriaNeural', name: 'Aria', gender: 'female', accent: 'US' },
  { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'female', accent: 'US' },
  { id: 'en-US-GuyNeural', name: 'Guy', gender: 'male', accent: 'US' },
  { id: 'en-US-AnaNeural', name: 'Ana', gender: 'female', accent: 'US' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', gender: 'female', accent: 'UK' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', gender: 'male', accent: 'UK' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha', gender: 'female', accent: 'AU' },
]

// 기본 설정
const DEFAULT_SETTINGS: TTSSettings = {
  selectedVoice: null,
  rate: 1.0,
  pitch: 1.2,
  ttsMode: 'hd',
  hdVoice: 'en-US-AriaNeural',
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

// HD TTS 오디오 캐시 (최대 50개)
const audioCache = new Map<string, string>()
const MAX_CACHE_SIZE = 50

function getCacheKey(text: string, voice: string, rate: number): string {
  return `${voice}:${rate}:${text}`
}

function addToCache(key: string, blobUrl: string) {
  if (audioCache.size >= MAX_CACHE_SIZE) {
    // 가장 오래된 항목 삭제
    const firstKey = audioCache.keys().next().value
    if (firstKey) {
      const oldUrl = audioCache.get(firstKey)
      if (oldUrl) URL.revokeObjectURL(oldUrl)
      audioCache.delete(firstKey)
    }
  }
  audioCache.set(key, blobUrl)
}

export function TTSProvider({ children }: { children: ReactNode }) {
  const [voices, setVoices] = useState<TTSVoice[]>([])
  const [settings, setSettingsState] = useState<TTSSettings>(DEFAULT_SETTINGS)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 음성 목록 로드
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsLoaded(true)
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
            ...DEFAULT_SETTINGS,
            ...parsed,
            selectedVoice: savedVoice || englishVoices[0] || null,
            ttsMode: 'hd',  // Force HD mode (device mode removed from UI)
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      audioCache.forEach(url => URL.revokeObjectURL(url))
      audioCache.clear()
    }
  }, [])

  // 설정 저장
  const setSettings = (newSettings: TTSSettings) => {
    setSettingsState(newSettings)
    localStorage.setItem('tts-settings', JSON.stringify(newSettings))

    // Firebase 동기화 (로그인된 경우)
    syncToFirebaseIfLoggedIn({ ttsSettings: newSettings })
  }

  // ===== Web Speech API (기기 음성) =====

  const createUtterance = (text: string, onEnd?: () => void, lang?: string): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text)
    const targetLang = lang || 'en-US'
    utterance.lang = targetLang
    const isNonEnglish = targetLang && !targetLang.startsWith('en')
    utterance.rate = isNonEnglish ? 0.9 : (Number.isFinite(settings.rate) ? settings.rate : DEFAULT_SETTINGS.rate)
    utterance.pitch = isNonEnglish ? 1.0 : (Number.isFinite(settings.pitch) ? settings.pitch : DEFAULT_SETTINGS.pitch)

    const synth = window.speechSynthesis
    const availableVoices = synth.getVoices()

    const langPrefix = targetLang.split('-')[0]

    if (langPrefix !== 'en') {
      // 비영어: 해당 언어 음성 자동 선택
      const langVoice = availableVoices.find(v => v.lang.startsWith(langPrefix))
      if (langVoice) utterance.voice = langVoice
    } else if (settings.selectedVoice) {
      const voice = availableVoices.find(v => v.voiceURI === settings.selectedVoice?.voiceURI)
      if (voice) {
        utterance.voice = voice
      } else {
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en'))
        if (englishVoice) utterance.voice = englishVoice
      }
    } else {
      const englishVoice = availableVoices.find(v => v.lang.startsWith('en'))
      if (englishVoice) utterance.voice = englishVoice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      onEnd?.()
    }
    utterance.onerror = (event) => {
      console.error('[TTS] utterance.onerror fired:', event.error, 'charIndex:', event.charIndex)
      setIsSpeaking(false)
      onEnd?.()
    }

    return utterance
  }

  const speakWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return

    const synth = window.speechSynthesis
    synth.cancel()

    const utterance = createUtterance(text)
    synth.speak(utterance)
  }

  const speakWebSpeechWithCallback = (text: string, onEnd?: () => void, lang?: string) => {
    if (!('speechSynthesis' in window)) {
      onEnd?.()
      return
    }

    const synth = window.speechSynthesis
    synth.cancel()

    let ended = false
    const safeOnEnd = onEnd ? () => {
      if (ended) return
      ended = true
      onEnd()
    } : undefined

    const utterance = createUtterance(text, safeOnEnd, lang)
    synth.speak(utterance)

    // Chrome에서 TTS가 시작되지 않을 경우를 위한 타임아웃
    const fallbackTimer = setTimeout(() => {
      if (!synth.speaking && !synth.pending) {
        console.warn('[TTS] Speech did not start after 500ms, calling onEnd')
        setIsSpeaking(false)
        safeOnEnd?.()
      }
    }, 500)

    // 정상 시작 시 fallback 타이머 취소
    utterance.addEventListener('start', () => {
      clearTimeout(fallbackTimer)
    }, { once: true })
  }

  // ===== HD TTS (Edge TTS via backend) =====

  const speakHD = async (text: string, onEnd?: () => void) => {
    // 기존 재생 중지
    stopAudio()

    // UI 피드백 즉시 제공
    setIsSpeaking(true)

    const cacheKey = getCacheKey(text, settings.hdVoice, settings.rate)
    let blobUrl = audioCache.get(cacheKey)

    if (!blobUrl) {
      try {
        const response = await apiFetch(`${API_BASE}/api/speech/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language: 'en',
            speed: settings.rate,
            voice: settings.hdVoice,
            engine: 'edge',
          }),
        })

        if (!response.ok) throw new Error(`TTS API error: ${response.status}`)

        const data = await response.json()
        const audioBytes = Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))
        const blob = new Blob([audioBytes], { type: 'audio/mp3' })
        blobUrl = URL.createObjectURL(blob)
        addToCache(cacheKey, blobUrl)
      } catch (error) {
        console.warn('[TTS-HD] Failed, falling back to device voice:', error)
        setIsSpeaking(false)
        // Web Speech API 폴백
        if (onEnd) {
          speakWebSpeechWithCallback(text, onEnd)
        } else {
          speakWebSpeech(text)
        }
        return
      }
    }

    try {
      const audio = new Audio(blobUrl)
      audioRef.current = audio

      audio.onended = () => {
        audioRef.current = null
        setIsSpeaking(false)
        onEnd?.()
      }
      audio.onerror = () => {
        console.error('[TTS-HD] audio.onerror fired')
        audioRef.current = null
        setIsSpeaking(false)
        // 재생 실패 시 Web Speech API 폴백
        if (onEnd) {
          speakWebSpeechWithCallback(text, onEnd)
        } else {
          speakWebSpeech(text)
        }
      }

      await audio.play()
    } catch (error) {
      console.warn('[TTS-HD] audio.play() failed, falling back:', error)
      audioRef.current = null
      setIsSpeaking(false)
      if (onEnd) {
        speakWebSpeechWithCallback(text, onEnd)
      } else {
        speakWebSpeech(text)
      }
    }
  }

  // ===== 통합 인터페이스 =====

  const speak = (text: string) => {
    if (settings.ttsMode === 'hd') {
      speakHD(text)
    } else {
      speakWebSpeech(text)
    }
  }

  const speakWithCallback = (text: string, onEnd?: () => void, lang?: string) => {
    // 비영어는 HD TTS 미지원, Web Speech API 직접 사용
    if (lang && !lang.startsWith('en')) {
      speakWebSpeechWithCallback(text, onEnd, lang)
      return
    }
    if (settings.ttsMode === 'hd') {
      speakHD(text, onEnd)
    } else {
      speakWebSpeechWithCallback(text, onEnd)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }

  const stop = () => {
    stopAudio()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  return (
    <TTSContext.Provider value={{
      voices,
      hdVoices: HD_VOICES,
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
