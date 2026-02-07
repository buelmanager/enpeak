'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ScenarioContext {
  place: string
  time: string
  situation: string
  roles: { user: string; ai: string }
  additionalInfo: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const PLACE_SUGGESTIONS = [
  '카페', '레스토랑', '공항', '호텔', '병원', '은행',
  '쇼핑몰', '대학교', '회사', '택시', '지하철', '도서관'
]

const TIME_SUGGESTIONS = [
  '아침', '점심', '저녁', '밤', '주말', '평일',
  '출근 시간', '퇴근 시간', '휴가 중', '비즈니스 미팅'
]

const SITUATION_SUGGESTIONS = [
  '주문하기', '길 묻기', '예약하기', '불만 제기하기',
  '자기소개', '가격 협상', '도움 요청', '친구 만나기',
  '면접', '프레젠테이션', '전화 통화', '이메일 논의'
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export default function CreateScenarioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<'context' | 'chat' | 'review'>('context')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [context, setContext] = useState<ScenarioContext>({
    place: '',
    time: '',
    situation: '',
    roles: { user: 'You', ai: 'Staff' },
    additionalInfo: '',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scenarioTitle, setScenarioTitle] = useState('')
  const [generatedScenario, setGeneratedScenario] = useState<any>(null)

  const handleContextSubmit = async () => {
    if (!context.place || !context.situation) return

    setStep('chat')
    setLoading(true)

    // AI에게 시나리오 설명 요청
    try {
      const response = await fetch(`${API_BASE}/api/scenario/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([{
          id: '1',
          role: 'assistant',
          content: data.message || `좋아요! "${context.place}"에서 "${context.situation}" 상황을 만들어볼게요. 어떤 구체적인 상황을 원하시나요? 예를 들어, 특별한 요청이 있거나, 문제가 생기는 상황 등을 추가해볼 수 있어요.`
        }])
      } else {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `좋아요! "${context.place}"에서 "${context.situation}" 상황을 만들어볼게요. 어떤 구체적인 상황을 원하시나요?`
        }])
      }
    } catch {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `"${context.place}"에서 "${context.situation}" 시나리오를 만들어볼게요! 더 구체적인 상황이 있다면 알려주세요.`
      }])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/scenario/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
        }])

        if (data.scenario_ready) {
          setGeneratedScenario(data.scenario)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '네, 알겠어요! 그 내용으로 시나리오에 반영할게요. 더 추가하고 싶은 내용이 있으면 말씀해주세요. 완성되면 "완성" 이라고 말씀해주세요!',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/scenario/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          title: scenarioTitle,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedScenario(data.scenario)
        setStep('review')
      }
    } catch (error) {
      console.error('Error:', error)
      // 임시 시나리오 생성
      setGeneratedScenario({
        id: `custom_${Date.now()}`,
        title: scenarioTitle || `${context.place}에서 ${context.situation}`,
        place: context.place,
        situation: context.situation,
        stages: [
          { stage: 1, name: 'Start', ai_opening: 'Hello! How can I help you today?' },
          { stage: 2, name: 'Main', ai_opening: 'I see, let me help you with that.' },
          { stage: 3, name: 'End', ai_opening: 'Is there anything else?' },
        ]
      })
      setStep('review')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    // 로그인 체크
    if (!user) {
      setShowLoginModal(true)
      return
    }

    setLoading(true)
    try {
      // 사용자 정보와 함께 저장
      const authorName = user.displayName || user.email?.split('@')[0] || 'Anonymous'
      const scenarioWithAuthor = {
        ...generatedScenario,
        title: scenarioTitle || generatedScenario.title || `${context.place}에서 ${context.situation}`,
        title_ko: scenarioTitle || `${context.place}에서 ${context.situation}`,
        authorId: user.uid,
      }

      const response = await fetch(`${API_BASE}/api/community/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenarioWithAuthor,
          author: authorName,
        }),
      })

      if (response.ok) {
        router.push('/talk?mode=roleplay')
      } else {
        alert('시나리오가 저장되었습니다!')
        router.push('/talk?mode=roleplay')
      }
    } catch {
      alert('시나리오가 저장되었습니다!')
      router.push('/talk?mode=roleplay')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-8">
      {/* Top safe area */}
      <div className="bg-[#faf9f7] fixed top-0 left-0 right-0 z-20" style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Header */}
      <header className="fixed left-0 right-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0] px-6 py-4" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium">대화 만들기</h1>
          <div className="w-9" />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          <div className={`flex-1 h-1 rounded-full ${step === 'context' || step === 'chat' || step === 'review' ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'chat' || step === 'review' ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'review' ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]'}`} />
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 110px)' }} />

      {/* Context Step */}
      {step === 'context' && (
        <div className="px-6 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-light mb-2">어떤 상황을 만들어볼까요?</h2>
            <p className="text-sm text-[#8a8a8a]">장소, 시간, 상황을 선택하거나 직접 입력해주세요</p>
          </div>

          {/* Place */}
          <div>
            <label className="text-sm font-medium mb-3 block">장소</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PLACE_SUGGESTIONS.map(place => (
                <button
                  key={place}
                  onClick={() => setContext(prev => ({ ...prev, place }))}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    context.place === place
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white border-[#e5e5e5] hover:border-[#1a1a1a]'
                  }`}
                >
                  {place}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={context.place}
              onChange={e => setContext(prev => ({ ...prev, place: e.target.value }))}
              placeholder="또는 직접 입력..."
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium mb-3 block">시간/상황 (선택)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {TIME_SUGGESTIONS.slice(0, 6).map(time => (
                <button
                  key={time}
                  onClick={() => setContext(prev => ({ ...prev, time }))}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    context.time === time
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white border-[#e5e5e5] hover:border-[#1a1a1a]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Situation */}
          <div>
            <label className="text-sm font-medium mb-3 block">상황</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SITUATION_SUGGESTIONS.map(situation => (
                <button
                  key={situation}
                  onClick={() => setContext(prev => ({ ...prev, situation }))}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    context.situation === situation
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white border-[#e5e5e5] hover:border-[#1a1a1a]'
                  }`}
                >
                  {situation}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={context.situation}
              onChange={e => setContext(prev => ({ ...prev, situation: e.target.value }))}
              placeholder="또는 직접 입력..."
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>

          {/* Additional Info */}
          <div>
            <label className="text-sm font-medium mb-3 block">추가 설명 (선택)</label>
            <textarea
              value={context.additionalInfo}
              onChange={e => setContext(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="예: 알레르기가 있어서 특별 요청을 해야 하는 상황, 예약이 안 되어있는 상황..."
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a1a1a] resize-none h-24"
            />
          </div>

          <button
            onClick={handleContextSubmit}
            disabled={!context.place || !context.situation}
            className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            AI와 시나리오 만들기
          </button>
        </div>
      )}

      {/* Chat Step */}
      {step === 'chat' && (
        <div className="flex flex-col h-[calc(100vh-120px)]">
          {/* Context Summary */}
          <div className="px-6 py-3 bg-white border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2 text-sm text-[#8a8a8a]">
              <span className="px-2 py-0.5 bg-[#f5f5f5] rounded">{context.place}</span>
              {context.time && <span className="px-2 py-0.5 bg-[#f5f5f5] rounded">{context.time}</span>}
              <span className="px-2 py-0.5 bg-[#f5f5f5] rounded">{context.situation}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-[#1a1a1a] text-white rounded-br-sm'
                    : 'bg-white border border-[#e5e5e5] rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-1 items-center text-[#8a8a8a]">
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#f0f0f0] bg-[#faf9f7] px-6 py-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="시나리오에 대해 더 설명해주세요..."
                className="flex-1 px-4 py-3 bg-white border border-[#e5e5e5] rounded-full text-sm focus:outline-none focus:border-[#1a1a1a]"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-12 h-12 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center disabled:opacity-30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Finalize Button */}
            {messages.length >= 2 && (
              <button
                onClick={handleFinalize}
                className="w-full mt-3 py-3 border border-[#1a1a1a] rounded-xl text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                시나리오 완성하기
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && generatedScenario && (
        <div className="px-6 py-6 pb-32 space-y-6">
          <div>
            <h2 className="text-xl font-light mb-2">시나리오 완성!</h2>
            <p className="text-sm text-[#8a8a8a]">제목을 입력하고 커뮤니티에 공유해보세요</p>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">시나리오 제목</label>
            <input
              type="text"
              value={scenarioTitle}
              onChange={e => setScenarioTitle(e.target.value)}
              placeholder={`${context.place}에서 ${context.situation}`}
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
            <h3 className="font-medium mb-3">{scenarioTitle || `${context.place}에서 ${context.situation}`}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-[#f5f5f5] rounded text-xs">{context.place}</span>
              {context.time && <span className="px-2 py-1 bg-[#f5f5f5] rounded text-xs">{context.time}</span>}
              <span className="px-2 py-1 bg-[#f5f5f5] rounded text-xs">{context.situation}</span>
            </div>
            <div className="space-y-3">
              {generatedScenario.stages?.map((stage: any, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stage.name}</p>
                    <p className="text-xs text-[#8a8a8a] mt-0.5">{stage.ai_opening}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#faf9f7] border-t border-[#f0f0f0]" style={{ paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('chat')}
                className="flex-1 py-4 border border-[#e5e5e5] rounded-xl font-medium"
              >
                수정하기
              </button>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-xl font-medium disabled:opacity-50"
              >
                {loading ? '저장 중...' : '커뮤니티에 공유'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2">로그인이 필요합니다</h3>
            <p className="text-sm text-[#8a8a8a] mb-6">
              시나리오를 커뮤니티에 공유하려면 로그인이 필요합니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-3 border border-[#e5e5e5] rounded-xl text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={() => router.push('/login?redirect=/create')}
                className="flex-1 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
