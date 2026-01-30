'use client'

import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  betterExpressions?: string[]
  learningTip?: string
}

interface MessageBubbleProps {
  message: Message
  onSpeak?: (text: string) => void
  onSuggestionClick?: (suggestion: string) => void
  isLatest?: boolean
}

// 한국어 번역 추출 함수
function extractKorean(text: string): { english: string; korean: string | null } {
  // 괄호 안의 한국어 추출: (한국어 텍스트)
  const koreanMatch = text.match(/\(([^)]*[\uAC00-\uD7A3]+[^)]*)\)/g)

  if (koreanMatch) {
    let english = text
    const koreanParts: string[] = []

    koreanMatch.forEach(match => {
      // 괄호 안에 한국어가 포함된 경우만 추출
      const inner = match.slice(1, -1)
      if (/[\uAC00-\uD7A3]/.test(inner)) {
        koreanParts.push(inner)
        english = english.replace(match, '').trim()
      }
    })

    // 연속된 공백 정리
    english = english.replace(/\s+/g, ' ').trim()

    if (koreanParts.length > 0) {
      return { english, korean: koreanParts.join(' / ') }
    }
  }

  return { english: text, korean: null }
}

export default function MessageBubble({ message, onSpeak, onSuggestionClick, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [showKorean, setShowKorean] = useState(false)
  const [showBetterExpressions, setShowBetterExpressions] = useState(true)

  const { english, korean } = extractKorean(message.content)

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(english)
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(english)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  // 추천 답변 2개만 표시
  const displaySuggestions = message.suggestions?.slice(0, 2) || []
  const betterExpressions = message.betterExpressions || []

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[85%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-[#1a1a1a] text-white rounded-br-sm'
              : 'bg-white text-[#1a1a1a] rounded-bl-sm border border-[#e5e5e5]'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{english}</p>

          {/* 한국어 번역 (토글) */}
          {!isUser && korean && showKorean && (
            <p className="text-[13px] text-[#8a8a8a] mt-2 pt-2 border-t border-[#f0f0f0]">
              {korean}
            </p>
          )}
        </div>

        {/* 사용자 메시지 - 더 나은 표현 제안 */}
        {isUser && betterExpressions.length > 0 && showBetterExpressions && (
          <div className="mt-2 mr-1">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] text-[#8a8a8a] tracking-wide">💡 이렇게도 말해보세요</span>
              <button
                onClick={() => setShowBetterExpressions(false)}
                className="text-[#c5c5c5] hover:text-[#8a8a8a]"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {betterExpressions.map((expr, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-[#f0f0f0] rounded-full text-xs text-[#666] italic"
                >
                  "{expr}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI 메시지 하단 버튼들 */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            {/* 음성 재생 버튼 */}
            <button
              onClick={handleSpeak}
              className="p-1.5 text-[#c5c5c5] hover:text-[#1a1a1a] transition-colors"
              title="Listen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>

            {/* 한국어 번역 토글 버튼 */}
            {korean && (
              <button
                onClick={() => setShowKorean(!showKorean)}
                className={`p-1.5 transition-colors ${showKorean ? 'text-[#1a1a1a]' : 'text-[#c5c5c5] hover:text-[#1a1a1a]'}`}
                title={showKorean ? '번역 숨기기' : '번역 보기'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 학습 팁 */}
        {message.learningTip && (
          <div className="mt-2 px-3 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-[#8a8a8a] mt-0.5 text-sm">💡</span>
              <p className="text-xs text-[#666]">{message.learningTip}</p>
            </div>
          </div>
        )}
      </div>

      {/* 추천 답변 - AI 말풍선 아래에 표시 (최신 메시지만) */}
      {!isUser && isLatest && displaySuggestions.length > 0 && onSuggestionClick && (
        <div className="mt-3 flex flex-wrap gap-2">
          {displaySuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full text-sm text-[#1a1a1a] hover:bg-white hover:border-[#1a1a1a] transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
