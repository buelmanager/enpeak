'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import MessageBubble from './MessageBubble'
import VoiceRecorder, { VoiceRecorderRef } from './VoiceRecorder'
import ListeningIndicator from './ListeningIndicator'
import { useTTS } from '@/contexts/TTSContext'
import { useConversationSettings } from '@/contexts/ConversationSettingsContext'

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
  onReset?: () => void
}

export default function ChatWindow({ 
  practiceExpression,
  onExpressionComplete,
  mode = 'free',
  scenarioId,
  situation,
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

  const { isSpeaking, stop: stopTTS, speakWithCallback } = useTTS()
  const { settings, setInputMode } = useConversationSettings()

  const isVoiceMode = settings.inputMode === 'voice'

  // 사이클 활성화 상태를 ref로 관리 (콜백에서 최신 값 참조)
  const voiceCycleActiveRef = useRef(false)

  // voiceCycleActive 상태와 ref 동기화
  useEffect(() => {
    voiceCycleActiveRef.current = voiceCycleActive
    console.log('[VoiceCycle] voiceCycleActive changed to:', voiceCycleActive)
  }, [voiceCycleActive])

  const scrollToBottom = () => {
    // 메시지 컨테이너를 맨 아래로 스크롤
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
      // 컴포넌트 언마운트 시 녹음 중지
      voiceRecorderRef.current?.stopRecording()
      stopTTS()
      setVoiceCycleActive(false)
      shouldAutoRecordRef.current = false
    }
  }, [pathname])

  // 자동 녹음 시작 함수
  const startAutoRecording = useCallback(() => {
    if (isVoiceMode && voiceCycleActive && !loading && !isSpeaking) {
      // 약간의 딜레이 후 녹음 시작 (자연스러운 UX)
      setTimeout(() => {
        if (voiceCycleActive && isVoiceMode) {
          voiceRecorderRef.current?.startRecording()
        }
      }, 500)
    }
  }, [isVoiceMode, voiceCycleActive, loading, isSpeaking])

  // AI 응답에 대해 TTS 재생 (사이클 활성화 시 녹음도 시작)
  // forceAutoRecord: true면 사이클 상태와 관계없이 TTS 후 자동 녹음
  const speakAndStartRecording = useCallback((text: string, forceAutoRecord = false) => {
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
      // TTS 완료 후, 사이클이 활성화되어 있거나 강제 녹음이면 자동 녹음 시작
      // ref를 사용해서 최신 값 참조
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
    })
  }, [isVoiceMode, speakWithCallback])

  // speakAndStartRecording을 ref로 저장 (useEffect에서 의존성 없이 사용)
  const speakAndStartRecordingRef = useRef(speakAndStartRecording)
  useEffect(() => {
    speakAndStartRecordingRef.current = speakAndStartRecording
  }, [speakAndStartRecording])

  // 음성 모드 변경 시 사이클 처리
  useEffect(() => {
    if (!isVoiceMode) {
      // 텍스트 모드로 변경 시 사이클 중지
      console.log('[VoiceCycle] Switched to text mode, stopping cycle')
      voiceCycleActiveRef.current = false
      setVoiceCycleActive(false)
      shouldAutoRecordRef.current = false
      voiceRecorderRef.current?.stopRecording()
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

        // 음성 모드면 사이클 활성화 후 TTS 재생 + 자동 녹음
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

      // situation을 포함한 시작 메시지 구성
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
          // API 응답이 response 또는 message 필드를 사용할 수 있음
          const responseContent = data.response || data.message || "Hello! How can I help you today?"
          const assistantMessage: Message = {
            id: 'situation-start',
            role: 'assistant',
            content: responseContent,
            suggestions: data.suggestions,
          }
          setMessages([assistantMessage])

          // 음성 모드면 사이클 활성화 후 TTS 재생 + 자동 녹음
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

          // 폴백 메시지도 TTS 재생 + 자동 녹음
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



  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    if (mode === 'roleplay' && !scenarioId && !roleplaySessionId) {
      return
    }

    console.log('[SendMessage] Called with text:', text.substring(0, 50), 'mode:', mode, 'isVoiceMode:', isVoiceMode, 'voiceCycleActive:', voiceCycleActive)

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

          // 음성 모드면 TTS 재생 (사이클 활성화 시 자동 녹음도)
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

          // 음성 모드면 TTS 재생 (사이클 활성화 시 자동 녹음도)
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

        // 이전 사용자 메시지에 더 나은 표현 추가
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
          suggestions: data.suggestions?.slice(0, 2), // 2개만 저장
          learningTip: data.learning_tip,
        }

        setMessages(prev => [...prev, assistantMessage])

        // 음성 모드면 TTS 재생 (사이클 활성화 시 자동 녹음도)
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

  const handleVoiceResult = (text: string) => {
    console.log('[VoiceCycle] handleVoiceResult called with text:', text.substring(0, 50), 'isVoiceMode:', isVoiceMode, 'voiceCycleActive:', voiceCycleActive)
    sendMessage(text)
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording)
    console.log('[VoiceCycle] Recording changed to:', recording)

    // 녹음이 시작되면 음성 사이클 활성화
    if (recording && isVoiceMode) {
      console.log('[VoiceCycle] User started recording, activating cycle')
      voiceCycleActiveRef.current = true
      setVoiceCycleActive(true)
      setConversationStarted(true)
    }
  }

  const handleCancelRecording = () => {
    console.log('[VoiceCycle] Recording cancelled, stopping cycle')
    voiceRecorderRef.current?.stopRecording()
    setIsRecording(false)
    // 녹음 취소 시 사이클 중지
    voiceCycleActiveRef.current = false
    setVoiceCycleActive(false)
    shouldAutoRecordRef.current = false
    stopTTS()
  }

  // 마지막 AI 메시지 인덱스 찾기
  const lastAssistantIndex = messages.reduce((lastIdx, msg, idx) =>
    msg.role === 'assistant' ? idx : lastIdx, -1
  )

  return (
    <div className="flex flex-col h-full bg-[#faf9f7]">

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

      {/* 녹음 중 인디케이터 (입력창 바로 위) */}
      <ListeningIndicator isActive={isRecording} onCancel={handleCancelRecording} />

      {/* Input Area */}
      <div className="border-t border-[#f0f0f0] bg-[#faf9f7] px-4 py-3">
        {/* Input Mode Toggle */}
        <div className="flex justify-center mb-3">
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
        </div>

        {/* Voice Input */}
        {isVoiceMode ? (
          <div className="flex justify-center">
            <VoiceRecorder
              ref={voiceRecorderRef}
              onResult={handleVoiceResult}
              onInterimResult={(text) => setInput(text)}
              disabled={loading}
              onRecordingChange={handleRecordingChange}
            />
          </div>
        ) : (
          /* Text Input */
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="영어로 입력하세요..."
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
    </div>
  )
}
