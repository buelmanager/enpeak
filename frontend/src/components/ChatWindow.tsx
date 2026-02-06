'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import MessageBubble from './MessageBubble'
import VoiceRecorder, { VoiceRecorderRef, STTResultMetadata } from './VoiceRecorder'
import ListeningIndicator from './ListeningIndicator'
import STTConfirmationBanner from './STTConfirmationBanner'
import PronunciationModal from './PronunciationModal'
import { useTTS } from '@/contexts/TTSContext'
import { useConversationSettings } from '@/contexts/ConversationSettingsContext'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useAudioLevel } from '@/hooks/useAudioLevel'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  betterExpressions?: string[]
  learningTip?: string
  // TTS 재생 완료 여부 (자동 사이클용)
  ttsPlayed?: boolean
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// 표현별 대화 시작 문장
function getConversationStarter(expression: string): string {
  const starters: Record<string, string> = {
    'break the ice': "Hi! We just met at this party, and it feels a bit awkward. What do you usually do to start conversations with new people?",
    'easier said than done': "I've been trying to wake up early every day, but it's so hard! Have you ever tried to change a habit?",
    'hit the nail on the head': "I think the main problem with our project is the deadline. What do you think?",
    'piece of cake': "I heard you passed the driving test on your first try! Was it difficult?",
    'cost an arm and a leg': "I love your new smartphone! I've been thinking about getting one too. How much did it cost?",
    'under the weather': "Hey, you don't look so good today. Are you feeling okay?",
    'once in a blue moon': "Do you visit your hometown often? I miss my family sometimes.",
    'bite the bullet': "I've been putting off going to the dentist for months. I really need to go soon.",
    'let the cat out of the bag': "We're planning a surprise party for Sarah! But please don't tell anyone.",
    'when pigs fly': "Do you think our boss will give us a day off this Friday?",
  }

  const key = expression.toLowerCase()
  return starters[key] || `Imagine a situation where you could use "${expression}". How would you respond?`
}

// 표현별 제안 응답
function getSuggestions(expression: string): string[] {
  const suggestions: Record<string, string[]> = {
    'break the ice': ["I usually try to break the ice by asking about their hobbies.", "Breaking the ice can be hard, but a simple compliment works!"],
    'easier said than done': ["Yeah, waking up early is easier said than done!", "I know what you mean. It's easier said than done."],
    'hit the nail on the head': ["You hit the nail on the head! That's exactly the problem.", "I think you hit the nail on the head with that."],
    'piece of cake': ["It was a piece of cake! I passed easily.", "Actually, it was a piece of cake for me."],
    'cost an arm and a leg': ["It cost an arm and a leg, but it's worth it.", "Be careful, these phones cost an arm and a leg!"],
    'under the weather': ["I'm feeling a bit under the weather today.", "Yeah, I've been under the weather since yesterday."],
    'once in a blue moon': ["I only visit once in a blue moon, unfortunately.", "We see each other once in a blue moon these days."],
    'bite the bullet': ["I think you should just bite the bullet and go.", "Time to bite the bullet and face your fears!"],
    'let the cat out of the bag': ["Don't worry, I won't let the cat out of the bag!", "Oops, I almost let the cat out of the bag!"],
    'when pigs fly': ["A day off? When pigs fly!", "That'll happen when pigs fly!"],
  }

  const key = expression.toLowerCase()
  return suggestions[key] || [`I would use "${expression}" here.`, "Let me try using this expression."]
}

interface PracticeExpression {
  expression: string
  meaning: string
}

interface ChatWindowProps {
  practiceExpression?: PracticeExpression
  onExpressionComplete?: () => void
  mode?: 'free' | 'expression' | 'roleplay'
  scenarioId?: string
  situation?: string
  situationLabel?: string
  onSituationSet?: (situation: string, label: string) => void
  onSituationClear?: () => void
  onReset?: () => void
}

// 폴백 요청 제한: 분당 3회
const FALLBACK_RATE_LIMIT = 3
const FALLBACK_RATE_WINDOW_MS = 60_000

export default function ChatWindow({
  practiceExpression,
  onExpressionComplete,
  mode = 'free',
  scenarioId,
  situation,
  situationLabel,
  onSituationSet,
  onSituationClear,
  onReset,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [roleplaySessionId, setRoleplaySessionId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const initializedRef = useRef(false)
  const [isRecording, setIsRecording] = useState(false)
  // 자동 음성 사이클 활성화 여부 (음성 모드일 때만)
  const [voiceCycleActive, setVoiceCycleActive] = useState(false)
  // 대화 시작 여부 (사용자가 처음 녹음 버튼을 누르거나, AI가 먼저 시작할 때)
  const [conversationStarted, setConversationStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const voiceRecorderRef = useRef<VoiceRecorderRef>(null)
  const pathname = usePathname()
  // TTS 완료 후 자동 녹음을 위한 플래그
  const shouldAutoRecordRef = useRef(false)
  // 공유 스트림 ref (audioRecorder + audioLevel이 공유)
  const sharedStreamRef = useRef<MediaStream | null>(null)

  // STT 확인 배너 상태
  const [pendingSTT, setPendingSTT] = useState<{ transcript: string; confidence: number; audioBlob: Blob | null } | null>(null)
  // STT 에러 메시지
  const [sttError, setSttError] = useState<string | null>(null)
  // 발음 연습 모달
  const [showPronunciationModal, setShowPronunciationModal] = useState(false)
  const [pronunciationTargetText, setPronunciationTargetText] = useState<string | undefined>(undefined)
  // 발음 연습 모드 (입력 영역 스위치)
  const [pronunciationMode, setPronunciationMode] = useState(false)
  // 모달이 어디서 열렸는지: practice (따라하기) vs send (발음 입력)
  const [pronunciationSource, setPronunciationSource] = useState<'practice' | 'send'>('practice')
  // 상황 설정 phase 관련 상태
  const [situationSetupPhase, setSituationSetupPhase] = useState(false)
  const setupMessagesRef = useRef<{ role: string; content: string }[]>([])
  const [setupUserMsgCount, setSetupUserMsgCount] = useState(0)
  // 단어 팁 배너 표시 여부
  const [showWordTip, setShowWordTip] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('word-tip-dismissed')
    }
    return true
  })
  // 폴백 요청 타임스탬프 추적
  const fallbackTimestampsRef = useRef<number[]>([])

  const { isSpeaking, stop: stopTTS, speakWithCallback } = useTTS()
  const { settings, setInputMode } = useConversationSettings()

  const isVoiceMode = settings.inputMode === 'voice'
  const sttFallbackEnabled = settings.sttFallbackEnabled

  // 오디오 레코더 (MediaRecorder, 폴백용 병렬 녹음)
  const audioRecorder = useAudioRecorder()

  // 오디오 레벨 모니터링
  const audioLevelMonitor = useAudioLevel()

  // iOS 감지 (MediaRecorder + SpeechRecognition 동시 실행 불가)
  const isIOSRef = useRef(false)
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      isIOSRef.current = /iPad|iPhone|iPod/.test(navigator.userAgent)
    }
  }, [])

  // 사이클 활성화 상태를 ref로 관리 (콜백에서 최신 값 참조)
  const voiceCycleActiveRef = useRef(false)

  // voiceCycleActive 상태와 ref 동기화
  useEffect(() => {
    voiceCycleActiveRef.current = voiceCycleActive
    console.log('[VoiceCycle] voiceCycleActive changed to:', voiceCycleActive)
  }, [voiceCycleActive])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 페이지 이동 시 녹음 중지
  useEffect(() => {
    return () => {
      voiceRecorderRef.current?.stopRecording()
      audioRecorder.stopRecording()
      audioLevelMonitor.stopMonitoring()
      if (sharedStreamRef.current) {
        sharedStreamRef.current.getTracks().forEach(track => track.stop())
        sharedStreamRef.current = null
      }
      stopTTS()
      setVoiceCycleActive(false)
      shouldAutoRecordRef.current = false
    }
  }, [pathname])

  // 자동 녹음 시작 함수
  const startAutoRecording = useCallback(() => {
    if (isVoiceMode && voiceCycleActive && !loading && !isSpeaking) {
      setTimeout(() => {
        if (voiceCycleActive && isVoiceMode) {
          voiceRecorderRef.current?.startRecording()
        }
      }, 500)
    }
  }, [isVoiceMode, voiceCycleActive, loading, isSpeaking])

  // AI 응답에 대해 TTS 재생 (사이클 활성화 시 녹음도 시작)
  const speakAndStartRecording = useCallback((text: string, forceAutoRecord = false, lang?: string) => {
    console.log('[VoiceCycle] speakAndStartRecording called')
    console.log('[VoiceCycle]   text:', text.substring(0, 80))
    console.log('[VoiceCycle]   forceAutoRecord:', forceAutoRecord)
    console.log('[VoiceCycle]   isVoiceMode:', isVoiceMode)
    console.log('[VoiceCycle]   voiceCycleActiveRef:', voiceCycleActiveRef.current)
    console.log('[VoiceCycle]   shouldAutoRecordRef:', shouldAutoRecordRef.current)

    if (!isVoiceMode) {
      console.log('[VoiceCycle] Not in voice mode, skipping TTS')
      return
    }

    shouldAutoRecordRef.current = true
    console.log('[VoiceCycle] Set shouldAutoRecordRef=true, calling speakWithCallback...')

    speakWithCallback(text, () => {
      const shouldAutoRecord = shouldAutoRecordRef.current && (voiceCycleActiveRef.current || forceAutoRecord)
      console.log('[VoiceCycle] TTS ended callback fired')
      console.log('[VoiceCycle]   shouldAutoRecordRef.current:', shouldAutoRecordRef.current)
      console.log('[VoiceCycle]   voiceCycleActiveRef.current:', voiceCycleActiveRef.current)
      console.log('[VoiceCycle]   forceAutoRecord:', forceAutoRecord)
      console.log('[VoiceCycle]   => shouldAutoRecord:', shouldAutoRecord)

      if (shouldAutoRecord) {
        console.log('[VoiceCycle] Will start recording in 500ms...')
        setTimeout(() => {
          console.log('[VoiceCycle] Starting recording now, voiceRecorderRef exists:', !!voiceRecorderRef.current)
          voiceRecorderRef.current?.startRecording()
        }, 500)
      } else {
        console.log('[VoiceCycle] Not starting auto recording')
      }
    }, lang)
  }, [isVoiceMode, speakWithCallback])

  // speakAndStartRecording을 ref로 저장
  const speakAndStartRecordingRef = useRef(speakAndStartRecording)
  useEffect(() => {
    speakAndStartRecordingRef.current = speakAndStartRecording
  }, [speakAndStartRecording])

  // 음성 모드 변경 시 사이클 처리
  useEffect(() => {
    if (!isVoiceMode) {
      console.log('[VoiceCycle] Switched to text mode, stopping cycle')
      voiceCycleActiveRef.current = false
      setVoiceCycleActive(false)
      shouldAutoRecordRef.current = false
      voiceRecorderRef.current?.stopRecording()
      audioRecorder.stopRecording()
      audioLevelMonitor.stopMonitoring()
      if (sharedStreamRef.current) {
        sharedStreamRef.current.getTracks().forEach(track => track.stop())
        sharedStreamRef.current = null
      }
    }
  }, [isVoiceMode])

  // 표현 연습 모드일 때 초기 메시지 설정
  useEffect(() => {
    if (practiceExpression && !initializedRef.current) {
      initializedRef.current = true
      const initialMessage: Message = {
        id: 'initial',
        role: 'assistant',
        content: `Let's practice using "${practiceExpression.expression}"! I'll start a conversation where you can use this expression naturally.`,
        learningTip: `"${practiceExpression.expression}" = ${practiceExpression.meaning}`,
      }
      setMessages([initialMessage])
      setInitialized(true)
      setConversationStarted(true)

      setTimeout(() => {
        const situationContent = getConversationStarter(practiceExpression.expression)
        const situationMessage: Message = {
          id: 'situation',
          role: 'assistant',
          content: situationContent,
          suggestions: getSuggestions(practiceExpression.expression),
        }
        setMessages(prev => [...prev, situationMessage])

        if (isVoiceMode) {
          console.log('[VoiceCycle] Expression mode: activating cycle and starting TTS')
          voiceCycleActiveRef.current = true
          setVoiceCycleActive(true)
          speakAndStartRecordingRef.current(situationContent, true)
        }
      }, 500)
    }
  }, [practiceExpression, initialized, isVoiceMode])

  // 상황 설정 모드일 때 초기 메시지 설정
  useEffect(() => {
    if (situation && !initializedRef.current && mode === 'free') {
      initializedRef.current = true
      setInitialized(true)
      setConversationStarted(true)
      setLoading(true)

      const startMessage = `[Situation: ${situation}] Hello, I'd like to start a conversation in this scenario.`

      fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: startMessage,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.conversation_id) {
            setConversationId(data.conversation_id)
          }
          const responseContent = data.response || data.message || "Hello! How can I help you today?"
          const assistantMessage: Message = {
            id: 'situation-start',
            role: 'assistant',
            content: responseContent,
            suggestions: data.suggestions,
          }
          setMessages([assistantMessage])

          if (isVoiceMode && responseContent) {
            console.log('[VoiceCycle] Situation mode: activating cycle and starting TTS')
            voiceCycleActiveRef.current = true
            setVoiceCycleActive(true)
            speakAndStartRecordingRef.current(responseContent, true)
          }
        })
        .catch(() => {
          const fallbackContent = "Hello! How can I help you today?"
          const fallbackMessage: Message = {
            id: 'situation-start',
            role: 'assistant',
            content: fallbackContent,
          }
          setMessages([fallbackMessage])

          if (isVoiceMode) {
            console.log('[VoiceCycle] Fallback mode: activating cycle and starting TTS')
            voiceCycleActiveRef.current = true
            setVoiceCycleActive(true)
            speakAndStartRecordingRef.current(fallbackContent, true)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [situation, initialized, mode, isVoiceMode])

  // 폴백 요청 레이트 체크
  const canUseFallback = useCallback(() => {
    if (!sttFallbackEnabled) return false
    const now = Date.now()
    // 오래된 타임스탬프 제거
    fallbackTimestampsRef.current = fallbackTimestampsRef.current.filter(
      ts => now - ts < FALLBACK_RATE_WINDOW_MS
    )
    return fallbackTimestampsRef.current.length < FALLBACK_RATE_LIMIT
  }, [sttFallbackEnabled])

  // 백엔드 Whisper STT 폴백 호출
  const fallbackToWhisper = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    if (!canUseFallback()) {
      console.log('[STT Fallback] Rate limit reached, skipping')
      return null
    }

    try {
      fallbackTimestampsRef.current.push(Date.now())

      // Blob -> Base64 변환
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      console.log('[STT Fallback] Sending to backend, size:', audioBlob.size)

      const response = await fetch(`${API_BASE}/api/speech/stt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_base64: base64,
          language: 'en',
          prompt: 'English conversation practice',
        }),
      })

      if (!response.ok) {
        console.error('[STT Fallback] Backend error:', response.status)
        return null
      }

      const data = await response.json()
      console.log('[STT Fallback] Result:', data.text, 'confidence:', data.confidence)
      return data.text || null
    } catch (e) {
      console.error('[STT Fallback] Error:', e)
      return null
    }
  }, [canUseFallback])

  // 상황 설정 시작
  const startSituationSetup = useCallback(() => {
    setSituationSetupPhase(true)
    setConversationStarted(true)
    setupMessagesRef.current = []
    setSetupUserMsgCount(0)

    const aiMessage: Message = {
      id: 'setup-start',
      role: 'assistant',
      content: '어떤 상황에서 영어 대화를 연습하고 싶으세요? 장소, 상대방, 상황 등을 자유롭게 설명해주세요.',
    }
    setMessages([aiMessage])

    if (isVoiceMode) {
      speakAndStartRecordingRef.current(aiMessage.content, true, 'ko-KR')
      voiceCycleActiveRef.current = true
      setVoiceCycleActive(true)
    }
  }, [isVoiceMode])

  // 상황 설정 대화 전송
  const sendSetupMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMessage])
    setupMessagesRef.current.push({ role: 'user', content: text })
    setSetupUserMsgCount(prev => prev + 1)
    setInput('')
    setLoading(true)

    try {
      const setupSystemPrompt = '너는 한국어로만 대화하는 도우미야. 영어를 절대 사용하지 마. 사용자가 영어 회화 연습 상황을 설정하고 있어. 사용자가 설명한 내용을 짧게 확인하고, "더 추가하고 싶은 내용이 있나요?"라고 물어봐. 1~2문장으로 짧게 답변해. 영어 대화를 시작하지 마.'

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          system_prompt: setupSystemPrompt,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()

      const aiContent = data.message || data.response || '알겠습니다. 더 추가하고 싶은 내용이 있나요?'
      setupMessagesRef.current.push({ role: 'assistant', content: aiContent })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
      }
      setMessages(prev => [...prev, aiMessage])

      if (isVoiceMode && aiContent) {
        speakAndStartRecording(aiContent, false, 'ko-KR')
      }
    } catch {
      const fallback = '알겠습니다. 더 추가하고 싶은 내용이 있나요?'
      setupMessagesRef.current.push({ role: 'assistant', content: fallback })
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallback,
      }
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setLoading(false)
    }
  }, [isVoiceMode, speakAndStartRecording])

  // 상황 설정 완료
  const completeSituationSetup = useCallback(async () => {
    if (!onSituationSet) return

    setLoading(true)
    stopTTS()

    const userDescriptions = setupMessagesRef.current
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('. ')

    try {
      const summarySystemPrompt = `You generate scenario configurations. Output EXACTLY this format (no other text):
LABEL: <short Korean label, max 10 characters, e.g. "카페 주문">
PROMPT: <English system prompt for an AI to role-play this scenario with the user>`

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `User's scenario description: "${userDescriptions}"`,
          system_prompt: summarySystemPrompt,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate summary')
      const data = await response.json()
      const responseText = data.message || data.response || ''

      const labelMatch = responseText.match(/LABEL:\s*(.+?)(?:\n|$)/)
      const promptMatch = responseText.match(/PROMPT:\s*([\s\S]+?)$/)

      const label = labelMatch ? labelMatch[1].trim() : '상황 연습'
      const prompt = promptMatch ? promptMatch[1].trim() : userDescriptions

      onSituationSet(prompt, label)
    } catch {
      onSituationSet(userDescriptions, '상황 연습')
    } finally {
      setLoading(false)
    }
  }, [onSituationSet, stopTTS])

  const SETUP_COMPLETE_PATTERN = /^(완료|done|finish|끝|that'?s?\s*(all|it)|설정\s*완료)$/i

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    // 상황 설정 phase일 때
    if (situationSetupPhase) {
      if (SETUP_COMPLETE_PATTERN.test(text.trim())) {
        completeSituationSetup()
      } else {
        sendSetupMessage(text)
      }
      return
    }

    if (mode === 'roleplay' && !scenarioId && !roleplaySessionId) {
      return
    }

    console.log('[SendMessage] Called with text:', text.substring(0, 50), 'mode:', mode, 'isVoiceMode:', isVoiceMode, 'voiceCycleActive:', voiceCycleActive)

    // 확인 배너 닫기
    setPendingSTT(null)
    setSttError(null)

    // TTS 중이면 중지
    console.log('[SendMessage] Stopping TTS before sending')
    stopTTS()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      if (mode === 'roleplay') {
        if (!roleplaySessionId) {
          const response = await fetch(`${API_BASE}/api/roleplay/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scenario_id: scenarioId,
            }),
          })

          if (!response.ok) throw new Error('Failed to start roleplay')

          const data = await response.json()
          setRoleplaySessionId(data.session_id)

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.ai_message,
            suggestions: data.suggested_responses?.slice(0, 2),
            learningTip: data.learning_tip,
          }

          setMessages(prev => [...prev, assistantMessage])

          console.log('[SendMessage] Roleplay start - isVoiceMode:', isVoiceMode, 'ai_message:', data.ai_message?.substring(0, 50))
          if (isVoiceMode && data.ai_message) {
            console.log('[SendMessage] Calling speakAndStartRecording for roleplay start')
            speakAndStartRecording(data.ai_message)
          }

          if (data.is_complete) {
            onReset?.()
          }
        } else {
          const response = await fetch(`${API_BASE}/api/roleplay/turn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: roleplaySessionId,
              user_message: text,
            }),
          })

          if (!response.ok) throw new Error('Failed to continue roleplay')

          const data = await response.json()

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.ai_message,
            suggestions: data.suggested_responses?.slice(0, 2),
            learningTip: data.learning_tip,
          }

          setMessages(prev => [...prev, assistantMessage])

          console.log('[SendMessage] Roleplay turn - isVoiceMode:', isVoiceMode, 'ai_message:', data.ai_message?.substring(0, 50))
          if (isVoiceMode && data.ai_message) {
            console.log('[SendMessage] Calling speakAndStartRecording for roleplay turn')
            speakAndStartRecording(data.ai_message)
          }

          if (data.is_complete) {
            onReset?.()
          }
        }
      } else {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversation_id: conversationId,
            situation: situation,
          }),
        })

        if (!response.ok) {
          console.error('[SendMessage] API response not ok:', response.status, response.statusText)
          throw new Error('Failed to get response')
        }

        const data = await response.json()
        console.log('[SendMessage] Free chat API response keys:', Object.keys(data), 'message:', data.message?.substring(0, 50), 'response:', data.response?.substring(0, 50))

        if (!conversationId) {
          setConversationId(data.conversation_id)
        }

        if (data.better_expressions && data.better_expressions.length > 0) {
          setMessages(prev => {
            const updated = [...prev]
            const lastUserIdx = updated.length - 1
            if (lastUserIdx >= 0 && updated[lastUserIdx].role === 'user') {
              updated[lastUserIdx] = {
                ...updated[lastUserIdx],
                betterExpressions: data.better_expressions,
              }
            }
            return updated
          })
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          suggestions: data.suggestions?.slice(0, 2),
          learningTip: data.learning_tip,
        }

        setMessages(prev => [...prev, assistantMessage])

        console.log('[SendMessage] Free chat - isVoiceMode:', isVoiceMode, 'data.message:', !!data.message, 'data.response:', !!data.response)
        if (isVoiceMode && data.message) {
          console.log('[SendMessage] Calling speakAndStartRecording for free chat, text:', data.message.substring(0, 50))
          speakAndStartRecording(data.message)
        } else if (isVoiceMode && !data.message) {
          console.warn('[SendMessage] isVoiceMode but data.message is falsy! Full data keys:', Object.keys(data))
        }
      }
    } catch (error) {
      console.error('[SendMessage] Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process your message. Please try again.",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // confidence 기반 분기 처리
  const handleVoiceResult = useCallback(async (text: string, metadata?: STTResultMetadata) => {
    const confidence = metadata?.confidence ?? 0

    console.log('[STT] handleVoiceResult:', text.substring(0, 50), 'confidence:', confidence)

    // MediaRecorder 녹음 중지 (폴백용 오디오 확보)
    const audioBlob = await audioRecorder.stopRecording()
    audioLevelMonitor.stopMonitoring()

    // Chrome은 confidence를 항상 0으로 반환하는 특수 케이스
    if (confidence === 0) {
      // 텍스트 길이가 3자 초과이면 수용 (Chrome 특수 케이스)
      if (text.trim().length > 3) {
        console.log('[STT] Chrome special case: confidence=0 but text length ok, sending directly')
        sendMessage(text)
        return
      }
      // 짧은 텍스트 + confidence 0: 폴백 시도
      if (audioBlob && canUseFallback()) {
        console.log('[STT] Short text with confidence=0, trying Whisper fallback')
        const whisperResult = await fallbackToWhisper(audioBlob)
        if (whisperResult && whisperResult.trim().length > 0) {
          sendMessage(whisperResult)
          return
        }
      }
      // 폴백도 실패: 원래 텍스트 사용
      if (text.trim().length > 0) {
        sendMessage(text)
      }
      return
    }

    // 높은 confidence (>= 0.8): 바로 전송
    if (confidence >= 0.8) {
      console.log('[STT] High confidence, sending directly')
      sendMessage(text)
      return
    }

    // 중간 confidence (0.4 ~ 0.8): 확인 UI 표시
    if (confidence >= 0.4) {
      console.log('[STT] Medium confidence, showing confirmation banner')
      setPendingSTT({ transcript: text, confidence, audioBlob })
      return
    }

    // 낮은 confidence (< 0.4): Whisper 폴백 시도
    console.log('[STT] Low confidence, trying Whisper fallback')
    if (audioBlob && canUseFallback()) {
      const whisperResult = await fallbackToWhisper(audioBlob)
      if (whisperResult && whisperResult.trim().length > 0) {
        sendMessage(whisperResult)
        return
      }
    }

    // 폴백 실패 시 확인 UI 표시 (사용자가 수정 가능)
    if (text.trim().length > 0) {
      setPendingSTT({ transcript: text, confidence, audioBlob })
    }
  }, [audioRecorder, audioLevelMonitor, canUseFallback, fallbackToWhisper, sendMessage])

  // STT 에러 처리
  const handleSTTError = useCallback((type: string, message: string) => {
    console.log('[STT Error]', type, message)

    setSttError(message)

    // 권한 관련 에러는 사용자가 직접 해결해야 하므로 유지
    // 그 외 에러는 3초 후 자동 제거
    if (type !== 'not-allowed' && type !== 'audio-capture') {
      setTimeout(() => setSttError(null), 3000)
    }
  }, [])

  // 확인 배너: 전송
  const handleSTTConfirm = useCallback((text: string) => {
    setPendingSTT(null)
    sendMessage(text)
  }, [sendMessage])

  // 확인 배너: 수정 후 전송
  const handleSTTEdit = useCallback((text: string) => {
    setPendingSTT(null)
    sendMessage(text)
  }, [sendMessage])

  // 확인 배너: 취소
  const handleSTTDismiss = useCallback(() => {
    setPendingSTT(null)
  }, [])

  // 발음 연습 모달 열기 (AI 메시지 따라하기): TTS 재생 후 모달 오픈
  const handlePronunciationPractice = useCallback((text: string) => {
    setPronunciationSource('practice')
    setPronunciationTargetText(text)
    speakWithCallback(text, () => {
      setShowPronunciationModal(true)
    })
  }, [speakWithCallback])

  // 발음 입력 모달 열기 (입력 영역 스위치 ON 상태에서)
  const handlePronunciationSend = useCallback(() => {
    setPronunciationSource('send')
    setPronunciationTargetText(undefined)
    setShowPronunciationModal(true)
  }, [])

  // 발음 연습: 확인 시 메시지 전송 + 모달 닫기
  const handlePronunciationConfirm = useCallback((text: string) => {
    setShowPronunciationModal(false)
    sendMessage(text)
  }, [sendMessage])

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  // VoiceRecorder가 getUserMedia로 확보한 스트림을 받아 audioRecorder/audioLevel에 공유
  const handleStreamReady = useCallback((stream: MediaStream) => {
    console.log('[VoiceCycle] Stream received from VoiceRecorder')
    sharedStreamRef.current = stream

    if (!isIOSRef.current) {
      if (audioRecorder.isSupported) {
        audioRecorder.startRecording(stream)
      }
      audioLevelMonitor.startMonitoring(stream)
    }
  }, [audioRecorder, audioLevelMonitor])

  const handleRecordingChange = useCallback((recording: boolean) => {
    setIsRecording(recording)
    console.log('[VoiceCycle] Recording changed to:', recording)

    if (recording && isVoiceMode) {
      console.log('[VoiceCycle] User started recording, activating cycle')
      voiceCycleActiveRef.current = true
      setVoiceCycleActive(true)
      setConversationStarted(true)
      setSttError(null)
    }

    if (!recording) {
      audioLevelMonitor.stopMonitoring()
      // 공유 스트림 정리
      if (sharedStreamRef.current) {
        sharedStreamRef.current.getTracks().forEach(track => track.stop())
        sharedStreamRef.current = null
      }
    }
  }, [isVoiceMode, audioLevelMonitor])

  const handleCancelRecording = () => {
    console.log('[VoiceCycle] Recording cancelled, stopping cycle')
    voiceRecorderRef.current?.stopRecording()
    audioRecorder.stopRecording()
    audioLevelMonitor.stopMonitoring()
    if (sharedStreamRef.current) {
      sharedStreamRef.current.getTracks().forEach(track => track.stop())
      sharedStreamRef.current = null
    }
    setIsRecording(false)
    voiceCycleActiveRef.current = false
    setVoiceCycleActive(false)
    shouldAutoRecordRef.current = false
    setPendingSTT(null)
    setSttError(null)
    stopTTS()
  }

  // 마지막 AI 메시지 인덱스 찾기
  const lastAssistantIndex = messages.reduce((lastIdx, msg, idx) =>
    msg.role === 'assistant' ? idx : lastIdx, -1
  )

  return (
    <div className="flex flex-col h-full bg-[#faf9f7]">

      {/* Situation Label Bar */}
      {situation && situationLabel && onSituationClear && (
        <div className="px-6 py-2 bg-white border-b border-[#f0f0f0] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-[#8a8a8a]">{situationLabel}</span>
          </div>
          <button
            onClick={onSituationClear}
            className="text-xs text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
          >
            해제
          </button>
        </div>
      )}

      {/* Word Tip Banner */}
      {showWordTip && messages.length > 0 && (
        <div className="px-6 py-2 bg-[#f5f5f5] border-b border-[#e5e5e5] flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-[#8a8a8a]">모르는 단어는 길게 눌러 보세요</p>
          <button
            onClick={() => setShowWordTip(false)}
            className="text-[#c5c5c5] hover:text-[#8a8a8a] transition-colors p-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            {/* Breathing Circle */}
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full border border-[#e5e5e5] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-[#d5d5d5] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-light text-[#1a1a1a] mb-2 tracking-wide">대화를 시작해보세요</h2>
            <p className="text-sm text-[#8a8a8a] max-w-xs text-center leading-relaxed">
              영어로 자유롭게 이야기해보세요. AI가 대화를 도와드립니다.
            </p>

            {/* Situation Setup CTA */}
            {mode === 'free' && !situation && onSituationSet && (
              <button
                onClick={startSituationSetup}
                className="mt-6 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm font-medium hover:bg-[#333] transition-colors"
              >
                원하는 상황을 설정하세요
              </button>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {['Hello!', 'What should we talk about?', 'How are you?'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-full text-sm text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={handleSuggestionClick}
              onPronunciationPractice={message.role === 'assistant' ? handlePronunciationPractice : undefined}
              onWordLookup={() => {
                sessionStorage.setItem('word-tip-dismissed', '1')
                setShowWordTip(false)
              }}
              isLatest={idx === lastAssistantIndex && !loading}
            />
          ))
        )}

        {/* TTS 재생 중 표시 */}
        {isSpeaking && (
          <div className="flex items-center gap-3 text-[#8a8a8a]">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs tracking-wide">읽는 중...</span>
            <button
              onClick={stopTTS}
              className="text-xs text-[#8a8a8a] hover:text-[#1a1a1a] underline"
            >
              중지
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-[#8a8a8a]">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs tracking-wide">생각 중...</span>
          </div>
        )}

        <div ref={messagesEndRef} className="h-20" />
      </div>

      {/* 상황 설정 완료 버튼 */}
      {situationSetupPhase && (
        <div className="px-6 py-2 flex-shrink-0">
          <button
            onClick={completeSituationSetup}
            disabled={loading || setupUserMsgCount === 0}
            className="w-full py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm font-medium hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            설정 완료
          </button>
        </div>
      )}

      {/* STT 에러 메시지 */}
      {sttError && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600 text-center">{sttError}</p>
        </div>
      )}

      {/* STT 확인 배너 (중간 confidence) */}
      {pendingSTT && (
        <STTConfirmationBanner
          transcript={pendingSTT.transcript}
          confidence={pendingSTT.confidence}
          onConfirm={handleSTTConfirm}
          onEdit={handleSTTEdit}
          onDismiss={handleSTTDismiss}
        />
      )}

      {/* 녹음 중 인디케이터 (입력창 바로 위) */}
      <ListeningIndicator
        isActive={isRecording}
        onCancel={handleCancelRecording}
        audioLevel={audioLevelMonitor.audioLevel}
        warningMessage={audioLevelMonitor.silenceWarning}
      />

      {/* Input Area */}
      <div className="border-t border-[#f0f0f0] bg-[#faf9f7] px-4 py-3">
        {/* Input Mode Toggle */}
        <div className="flex justify-center items-center gap-2 mb-3">
          <div className="inline-flex items-center bg-white border border-[#e5e5e5] rounded-full p-1">
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isVoiceMode
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#8a8a8a] hover:text-[#1a1a1a]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              음성
            </button>
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !isVoiceMode
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#8a8a8a] hover:text-[#1a1a1a]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              텍스트
            </button>
          </div>

          {/* 발음 연습 토글 (음성 모드일 때만) */}
          {isVoiceMode && (
            <button
              type="button"
              onClick={() => setPronunciationMode(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                pronunciationMode
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#8a8a8a] border-[#e5e5e5] hover:text-[#1a1a1a]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              발음 연습
            </button>
          )}
        </div>

        {/* Voice Input */}
        {isVoiceMode ? (
          pronunciationMode ? (
            <div className="flex justify-center">
              <button
                onClick={handlePronunciationSend}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full text-sm hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                녹음 시작
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <VoiceRecorder
                ref={voiceRecorderRef}
                onResult={handleVoiceResult}
                onInterimResult={(text) => setInput(text)}
                onError={handleSTTError}
                disabled={loading || !!pendingSTT}
                onRecordingChange={handleRecordingChange}
                onStreamReady={handleStreamReady}
                lang={situationSetupPhase ? 'ko-KR' : 'en-US'}
              />
            </div>
          )
        ) : (
          /* Text Input */
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={situationSetupPhase ? "원하는 상황을 한국어로 입력하세요..." : "영어로 입력하세요..."}
              className="flex-1 px-4 py-3 bg-white border border-[#e5e5e5] rounded-full text-sm text-[#1a1a1a] placeholder-[#c5c5c5] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        )}
      </div>

      {/* 발음 연습 모달 */}
      {showPronunciationModal && (
        <PronunciationModal
          isOpen={showPronunciationModal}
          onClose={() => setShowPronunciationModal(false)}
          onConfirm={handlePronunciationConfirm}
          autoRecord={true}
          {...(pronunciationTargetText ? { targetText: pronunciationTargetText } : {})}
        />
      )}
    </div>
  )
}
