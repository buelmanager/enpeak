'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTTS } from '@/contexts/TTSContext'
import BottomNav from '@/components/BottomNav'

interface CommunityScenario {
  id: string
  title: string
  title_ko?: string
  description?: string
  author: string
  authorId?: string
  place: string
  situation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  likes: number
  plays: number
  createdAt: string
  tags?: string[]
  stages?: any[]
}

interface RoleplaySession {
  sessionId: string
  scenarioTitle: string
  scenarioTitleKo?: string
  aiMessage: string
  currentStage: number
  totalStages: number
  learningTip?: string
  suggestedResponses: string[]
  isComplete: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  translation?: string
  showTranslation?: boolean
  isTranslating?: boolean
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// 샘플 데이터 (API 연동 전)
const SAMPLE_SCENARIOS: CommunityScenario[] = [
  {
    id: '1',
    title: 'Coffee Shop Small Talk',
    title_ko: '카페에서 가벼운 대화',
    author: 'Sarah',
    place: '카페',
    situation: '바리스타와 대화',
    difficulty: 'beginner',
    likes: 24,
    plays: 156,
    createdAt: '2025-01-29',
    tags: ['일상', '카페']
  },
  {
    id: '2',
    title: 'Job Interview Practice',
    title_ko: '취업 면접 연습',
    author: 'Mike',
    place: '회사',
    situation: '면접',
    difficulty: 'advanced',
    likes: 89,
    plays: 423,
    createdAt: '2025-01-28',
    tags: ['비즈니스', '면접']
  },
  {
    id: '3',
    title: 'Airport Check-in',
    title_ko: '공항 체크인',
    author: 'Emily',
    place: '공항',
    situation: '체크인',
    difficulty: 'intermediate',
    likes: 45,
    plays: 287,
    createdAt: '2025-01-28',
    tags: ['여행', '공항']
  },
  {
    id: '4',
    title: 'Restaurant Complaint',
    title_ko: '레스토랑 불만 제기',
    author: 'David',
    place: '레스토랑',
    situation: '불만 제기',
    difficulty: 'intermediate',
    likes: 31,
    plays: 198,
    createdAt: '2025-01-27',
    tags: ['일상', '레스토랑']
  },
]

function CommunityContent() {
  const searchParams = useSearchParams()
  const [scenarios, setScenarios] = useState<CommunityScenario[]>(SAMPLE_SCENARIOS)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'popular' | 'recent' | 'beginner'>('popular')
  const [showPublishedToast, setShowPublishedToast] = useState(false)

  // 롤플레이 모달 상태
  const [selectedScenario, setSelectedScenario] = useState<CommunityScenario | null>(null)
  const [roleplaySession, setRoleplaySession] = useState<RoleplaySession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isRoleplayLoading, setIsRoleplayLoading] = useState(false)
  const [showRoleplayModal, setShowRoleplayModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { speak, stop, isSpeaking } = useTTS()

  useEffect(() => {
    if (searchParams.get('published') === 'true') {
      setShowPublishedToast(true)
      setTimeout(() => setShowPublishedToast(false), 3000)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE}/api/community/scenarios?sort=${filter}`)
        if (response.ok) {
          const data = await response.json()
          if (data.scenarios?.length > 0) {
            setScenarios(data.scenarios)
          }
        }
      } catch (error) {
        console.log('Using sample data')
      } finally {
        setLoading(false)
      }
    }

    fetchScenarios()
  }, [filter])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50'
      case 'intermediate': return 'text-yellow-600 bg-yellow-50'
      case 'advanced': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급'
      case 'intermediate': return '중급'
      case 'advanced': return '고급'
      default: return difficulty
    }
  }

  const startRoleplay = async (scenario: CommunityScenario) => {
    setSelectedScenario(scenario)
    setShowRoleplayModal(true)
    setIsRoleplayLoading(true)
    setMessages([])

    try {
      const response = await fetch(`${API_BASE}/api/community/roleplay/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenario.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setRoleplaySession({
          sessionId: data.session_id,
          scenarioTitle: data.scenario_title,
          scenarioTitleKo: data.scenario_title_ko,
          aiMessage: data.ai_message,
          currentStage: data.current_stage,
          totalStages: data.total_stages,
          learningTip: data.learning_tip,
          suggestedResponses: data.suggested_responses || [],
          isComplete: false,
        })
        setMessages([{ role: 'assistant', content: data.ai_message }])
      } else {
        // Fallback for scenarios without stages
        const fallbackMessage = `Hello! Welcome. Let's practice a conversation about "${scenario.title}". How can I help you today?`
        setRoleplaySession({
          sessionId: 'fallback',
          scenarioTitle: scenario.title,
          scenarioTitleKo: scenario.title_ko,
          aiMessage: fallbackMessage,
          currentStage: 1,
          totalStages: 3,
          learningTip: 'Try to respond naturally in English.',
          suggestedResponses: ["Hi! I'd like to practice.", "Hello, can you help me?"],
          isComplete: false,
        })
        setMessages([{ role: 'assistant', content: fallbackMessage }])
      }
    } catch (error) {
      console.error('Failed to start roleplay:', error)
      const fallbackMessage = `Hello! Let's practice "${scenario.title}". How can I help you today?`
      setRoleplaySession({
        sessionId: 'fallback',
        scenarioTitle: scenario.title,
        scenarioTitleKo: scenario.title_ko,
        aiMessage: fallbackMessage,
        currentStage: 1,
        totalStages: 3,
        learningTip: 'Try to respond naturally.',
        suggestedResponses: ["Hi!", "Hello!"],
        isComplete: false,
      })
      setMessages([{ role: 'assistant', content: fallbackMessage }])
    } finally {
      setIsRoleplayLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !roleplaySession || isRoleplayLoading) return

    const userMessage = inputText.trim()
    setInputText('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsRoleplayLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/community/roleplay/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: roleplaySession.sessionId,
          user_message: userMessage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.ai_message }])
        setRoleplaySession(prev => prev ? {
          ...prev,
          aiMessage: data.ai_message,
          currentStage: data.current_stage,
          learningTip: data.learning_tip,
          suggestedResponses: data.suggested_responses || [],
          isComplete: data.is_complete,
        } : null)
      } else {
        // Fallback response
        const fallbackResponse = "I understand. That's great practice! Would you like to continue?"
        setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: "I see. Let's keep practicing!" }])
    } finally {
      setIsRoleplayLoading(false)
    }
  }

  const closeRoleplay = () => {
    setShowRoleplayModal(false)
    setSelectedScenario(null)
    setRoleplaySession(null)
    setMessages([])
    setInputText('')
  }

  const useSuggestion = (suggestion: string) => {
    setInputText(suggestion)
  }

  const speakMessage = (text: string) => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text)
    }
  }

  const translateMessage = async (idx: number) => {
    const msg = messages[idx]
    if (msg.translation) {
      // 이미 번역이 있으면 토글
      setMessages(prev => prev.map((m, i) =>
        i === idx ? { ...m, showTranslation: !m.showTranslation } : m
      ))
      return
    }

    // 번역 중 상태 표시
    setMessages(prev => prev.map((m, i) =>
      i === idx ? { ...m, isTranslating: true } : m
    ))

    // 번역 요청 - MyMemory 무료 번역 API 사용
    try {
      let translation = ''

      // MyMemory 무료 번역 API 사용
      const encodedText = encodeURIComponent(msg.content)
      const translateResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ko`
      )

      if (translateResponse.ok) {
        const data = await translateResponse.json()
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          translation = data.responseData.translatedText
        }
      }

      // 폴백: 백엔드 API 시도
      if (!translation) {
        const backendResponse = await fetch(`${API_BASE}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: msg.content,
            target_lang: 'ko'
          }),
        })
        if (backendResponse.ok) {
          const data = await backendResponse.json()
          translation = data.translation
        }
      }

      if (translation) {
        setMessages(prev => prev.map((m, i) =>
          i === idx ? { ...m, translation, showTranslation: true, isTranslating: false } : m
        ))
      } else {
        setMessages(prev => prev.map((m, i) =>
          i === idx ? { ...m, isTranslating: false } : m
        ))
      }
    } catch (error) {
      console.error('Translation failed:', error)
      setMessages(prev => prev.map((m, i) =>
        i === idx ? { ...m, isTranslating: false } : m
      ))
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-32">
      {/* Top safe area - 30px */}
      <div className="h-[30px] bg-[#faf9f7] fixed top-0 left-0 right-0 z-20" />

      {/* Toast */}
      {showPublishedToast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#1a1a1a] text-white rounded-full text-sm shadow-lg" style={{ top: '40px' }}>
          시나리오가 공유되었습니다!
        </div>
      )}

      {/* Header - Fixed at 30px from top */}
      <header className="fixed left-0 right-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0] px-6 py-4" style={{ top: '30px' }}>
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium">커뮤니티</h1>
          <Link href="/create" className="p-2 -mr-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { key: 'popular', label: '인기' },
            { key: 'recent', label: '최신' },
            { key: 'beginner', label: '초급용' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filter === tab.key
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-[#e5e5e5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-36" />

      {/* Scenarios List */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-[#8a8a8a]">
            <div className="flex justify-center gap-1 mb-2">
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm">시나리오를 불러오는 중...</p>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#c5c5c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[#8a8a8a] mb-4">아직 시나리오가 없어요</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-full text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              첫 시나리오 만들기
            </Link>
          </div>
        ) : (
          scenarios.map(scenario => (
            <div
              key={scenario.id}
              onClick={() => startRoleplay(scenario)}
              className="block bg-white rounded-2xl border border-[#f0f0f0] p-5 active:bg-[#f5f5f5] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{scenario.title}</h3>
                  {scenario.title_ko && (
                    <p className="text-xs text-[#8a8a8a]">{scenario.title_ko}</p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                  {getDifficultyLabel(scenario.difficulty)}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 bg-[#f5f5f5] rounded text-xs">{scenario.place}</span>
                <span className="px-2 py-0.5 bg-[#f5f5f5] rounded text-xs">{scenario.situation}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {scenario.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {scenario.plays}
                  </span>
                </div>
                <span>by {scenario.author}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Roleplay Modal */}
      {showRoleplayModal && selectedScenario && (
        <div className="fixed inset-0 z-50 bg-[#faf9f7] flex flex-col">
          {/* Modal Header */}
          <header className="bg-white border-b border-[#f0f0f0] px-4 py-3 pt-safe flex items-center justify-between">
            <button onClick={closeRoleplay} className="p-2 -ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center flex-1">
              <h2 className="font-medium text-sm">{selectedScenario.title}</h2>
              {roleplaySession && (
                <p className="text-xs text-[#8a8a8a]">
                  Stage {roleplaySession.currentStage}/{roleplaySession.totalStages}
                </p>
              )}
            </div>
            <div className="w-9" />
          </header>

          {/* Learning Tip */}
          {roleplaySession?.learningTip && (
            <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700">
              Tip: {roleplaySession.learningTip}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, idx) => {
              const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#1a1a1a] text-white rounded-br-md'
                        : 'bg-white border border-[#f0f0f0] rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                    {msg.showTranslation && msg.translation && (
                      <div className={`mt-2 pt-2 border-t text-xs ${
                        msg.role === 'user' ? 'border-white/20 text-white/80' : 'border-[#e5e5e5] text-[#666]'
                      }`}>
                        {msg.translation}
                      </div>
                    )}
                  </div>
                  {/* 스피커 + 번역 버튼 */}
                  <div className={`flex items-center gap-1 mt-1.5 ${msg.role === 'user' ? 'mr-1 justify-end' : 'ml-1'}`}>
                    {/* 음성 재생 버튼 */}
                    <button
                      onClick={() => speakMessage(msg.content)}
                      className="p-1.5 text-[#c5c5c5] hover:text-[#1a1a1a] transition-colors"
                      title="Listen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                    {/* 번역 버튼 */}
                    <button
                      onClick={() => translateMessage(idx)}
                      disabled={msg.isTranslating}
                      className={`p-1.5 transition-colors ${
                        msg.showTranslation && msg.translation
                          ? 'text-[#1a1a1a]'
                          : 'text-[#c5c5c5] hover:text-[#1a1a1a]'
                      } ${msg.isTranslating ? 'opacity-50' : ''}`}
                      title={msg.showTranslation ? '번역 숨기기' : '번역 보기'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </button>
                  </div>
                  {/* 추천 응답 - 마지막 AI 메시지 바로 아래 */}
                  {isLastAssistant && !isRoleplayLoading && roleplaySession?.suggestedResponses && roleplaySession.suggestedResponses.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {roleplaySession.suggestedResponses.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => useSuggestion(suggestion)}
                          className="px-3 py-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full text-xs hover:bg-white hover:border-[#1a1a1a] transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {isRoleplayLoading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#f0f0f0] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Completion Message */}
          {roleplaySession?.isComplete && (
            <div className="px-4 py-3 bg-green-50 text-center">
              <p className="text-sm text-green-700 font-medium">Great job! You completed this conversation.</p>
              <button
                onClick={closeRoleplay}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm"
              >
                Done
              </button>
            </div>
          )}

          {/* Input */}
          {!roleplaySession?.isComplete && (
            <div className="bg-white border-t border-[#f0f0f0] px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your response..."
                  className="flex-1 px-4 py-2.5 bg-[#f5f5f5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                  disabled={isRoleplayLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isRoleplayLoading}
                  className="p-2.5 bg-[#1a1a1a] text-white rounded-full disabled:opacity-50 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </main>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7] flex items-center justify-center"><p className="text-[#8a8a8a]">로딩 중...</p></div>}>
      <CommunityContent />
    </Suspense>
  )
}
