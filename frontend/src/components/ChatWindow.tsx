'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import VoiceRecorder from './VoiceRecorder'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  betterExpressions?: string[]
  learningTip?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

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

  // 마지막 AI 메시지 인덱스 찾기
  const lastAssistantIndex = messages.reduce((lastIdx, msg, idx) =>
    msg.role === 'assistant' ? idx : lastIdx, -1
  )

  return (
    <div className="flex flex-col h-full bg-[#faf9f7]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#f0f0f0] bg-[#faf9f7] px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="영어로 입력하세요..."
            className="flex-1 px-4 py-3 bg-white border border-[#e5e5e5] rounded-full text-sm text-[#1a1a1a] placeholder-[#c5c5c5] focus:outline-none focus:border-[#1a1a1a] transition-colors"
            disabled={loading}
          />
          <VoiceRecorder onResult={handleVoiceResult} disabled={loading} />
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
      </div>
    </div>
  )
}
