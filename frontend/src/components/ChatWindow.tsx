'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import MessageBubble from './MessageBubble'
import VoiceRecorder, { VoiceRecorderRef } from './VoiceRecorder'
import ListeningIndicator from './ListeningIndicator'
import ConversationSettingsPanel from './ConversationSettingsPanel'
import ChatSettingsGuide from './ChatSettingsGuide'
import { useTTS } from '@/contexts/TTSContext'
import { useConversationSettings } from '@/contexts/ConversationSettingsContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  betterExpressions?: string[]
  learningTip?: string
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
}

export default function ChatWindow({ practiceExpression }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [shouldAutoRecord, setShouldAutoRecord] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const voiceRecorderRef = useRef<VoiceRecorderRef>(null)
  const pathname = usePathname()

  const { speakWithCallback, isSpeaking, stop: stopTTS } = useTTS()
  const { settings } = useConversationSettings()

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
    }
  }, [pathname])

  // 표현 연습 모드일 때 초기 메시지 설정
  useEffect(() => {
    if (practiceExpression && !initialized) {
      const initialMessage: Message = {
        id: 'initial',
        role: 'assistant',
        content: `Let's practice using "${practiceExpression.expression}"! I'll start a conversation where you can use this expression naturally.`,
        learningTip: `"${practiceExpression.expression}" = ${practiceExpression.meaning}`,
      }
      setMessages([initialMessage])
      setInitialized(true)

      // AI가 먼저 상황을 제시하는 메시지 추가
      setTimeout(() => {
        const situationMessage: Message = {
          id: 'situation',
          role: 'assistant',
          content: getConversationStarter(practiceExpression.expression),
          suggestions: getSuggestions(practiceExpression.expression),
        }
        setMessages(prev => [...prev, situationMessage])
      }, 500)
    }
  }, [practiceExpression, initialized])

  // AI 응답 후 자동 TTS 재생
  useEffect(() => {
    if (!settings.autoTTS || loading || messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'assistant' && lastMessage.id !== 'initial' && lastMessage.id !== 'situation') {
      // TTS 재생 후 자동 녹음 시작
      speakWithCallback(lastMessage.content, () => {
        if (settings.autoRecord) {
          setShouldAutoRecord(true)
        }
      })
    }
  }, [messages, loading, settings.autoTTS, settings.autoRecord])

  // 자동 녹음 트리거
  useEffect(() => {
    if (shouldAutoRecord && !isSpeaking && !loading) {
      voiceRecorderRef.current?.startRecording()
      setShouldAutoRecord(false)
    }
  }, [shouldAutoRecord, isSpeaking, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    // TTS 중이면 중지
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
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

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
    } catch (error) {
      console.error('Chat error:', error)
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
    sendMessage(text)
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording)
  }

  const handleCancelRecording = () => {
    voiceRecorderRef.current?.stopRecording()
    setIsRecording(false)
  }

  // 마지막 AI 메시지 인덱스 찾기
  const lastAssistantIndex = messages.reduce((lastIdx, msg, idx) =>
    msg.role === 'assistant' ? idx : lastIdx, -1
  )

  // 입력 모드에 따른 UI 표시
  const showTextInput = settings.inputMode === 'text' || settings.inputMode === 'both'
  const showVoiceInput = settings.inputMode === 'voice' || settings.inputMode === 'both'

  return (
    <div className="flex flex-col h-full bg-[#faf9f7]">
      {/* 설정 버튼 (우상단) */}
      <div className="absolute top-[40px] right-4 z-10">
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 bg-white rounded-full shadow-sm border border-[#f0f0f0] flex items-center justify-center text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
          title="대화 설정"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

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
              {['Hello!', 'How are you?', "Nice to meet you"].map(suggestion => (
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

      {/* Input Area */}
      <div className="border-t border-[#f0f0f0] bg-[#faf9f7] px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          {showTextInput && (
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="영어로 입력하세요..."
              className="flex-1 px-4 py-3 bg-white border border-[#e5e5e5] rounded-full text-sm text-[#1a1a1a] placeholder-[#c5c5c5] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              disabled={loading || isRecording}
            />
          )}
          {showVoiceInput && (
            <VoiceRecorder
              ref={voiceRecorderRef}
              onResult={handleVoiceResult}
              disabled={loading}
              onRecordingChange={handleRecordingChange}
            />
          )}
          {showTextInput && (
            <button
              type="submit"
              disabled={loading || !input.trim() || isRecording}
              className="w-12 h-12 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* 설정 패널 */}
      <ConversationSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* 처음 방문자를 위한 설정 가이드 */}
      <ChatSettingsGuide onOpenSettings={() => setShowSettings(true)} />

      {/* 녹음 중 팝업 */}
      {isRecording && settings.autoRecord && (
        <ListeningIndicator isActive={isRecording} onCancel={handleCancelRecording} />
      )}
    </div>
  )
}
