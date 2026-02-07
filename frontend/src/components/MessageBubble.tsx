'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTTS } from '@/contexts/TTSContext'
import WordPopup from './WordPopup'
import { API_BASE, apiFetch } from '@/shared/constants/api'

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
  onPronunciationPractice?: (text: string) => void
  onWordLookup?: () => void
  isLatest?: boolean
}

const LONG_PRESS_DURATION = 500

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

export default function MessageBubble({ message, onSpeak, onSuggestionClick, onPronunciationPractice, onWordLookup, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const { speak: ttsSpeak } = useTTS()
  const [showKorean, setShowKorean] = useState(false)
  const [showBetterExpressions, setShowBetterExpressions] = useState(true)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedWord, setSelectedWord] = useState<{ word: string; position: { x: number; y: number } } | null>(null)
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const pressedWord = useRef<string | null>(null)

  const { english, korean } = extractKorean(message.content)

  const handleWordPress = useCallback((word: string, e: React.TouchEvent | React.MouseEvent) => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase()
    if (cleanWord.length < 2) return
    
    pressedWord.current = cleanWord
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    
    longPressTimer.current = setTimeout(() => {
      if (pressedWord.current) {
        setSelectedWord({
          word: pressedWord.current,
          position: { x: rect.left, y: rect.bottom }
        })
        onWordLookup?.()
      }
    }, LONG_PRESS_DURATION)
  }, [onWordLookup])

  const handleWordRelease = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    pressedWord.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const renderInteractiveText = (text: string) => {
    const words = text.split(/(\s+)/)
    return words.map((word, idx) => {
      if (/^\s+$/.test(word)) return word
      return (
        <span
          key={idx}
          className="cursor-pointer select-none"
          onTouchStart={(e) => handleWordPress(word, e)}
          onTouchEnd={handleWordRelease}
          onTouchCancel={handleWordRelease}
          onMouseDown={(e) => handleWordPress(word, e)}
          onMouseUp={handleWordRelease}
          onMouseLeave={handleWordRelease}
        >
          {word}
        </span>
      )
    })
  }

  // 번역 함수
  const translateText = async () => {
    if (translatedText) {
      setShowKorean(!showKorean)
      return
    }

    if (korean) {
      setTranslatedText(korean)
      setShowKorean(true)
      return
    }

    setIsTranslating(true)
    try {
      let translated = false

      // MyMemory 무료 번역 API 사용
      const encodedText = encodeURIComponent(english)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ko`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          setTranslatedText(data.responseData.translatedText)
          setShowKorean(true)
          translated = true
        }
      }

      // 폴백: 백엔드 API 시도 (MyMemory 실패 시만)
      if (!translated) {
        const backendResponse = await apiFetch(`${API_BASE}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: english,
            target_lang: 'ko'
          }),
        })
        if (backendResponse.ok) {
          const data = await backendResponse.json()
          setTranslatedText(data.translation)
          setShowKorean(true)
        }
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(english)
    } else {
      ttsSpeak(english)
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
              ? 'bg-[#0D9488] text-white rounded-br-sm'
              : 'bg-white text-[#1a1a1a] rounded-bl-sm border border-[#e5e5e5]'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {renderInteractiveText(english)}
          </p>

          {/* 한국어 번역 (토글) */}
          {!isUser && showKorean && (translatedText || korean) && (
            <p className="text-[13px] text-[#8a8a8a] mt-2 pt-2 border-t border-[#f0f0f0]">
              {translatedText || korean}
            </p>
          )}
        </div>

        {/* 사용자 메시지 - 더 나은 표현 제안 */}
        {isUser && betterExpressions.length > 0 && showBetterExpressions && (
          <div className="mt-2 mr-1">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3.5 h-3.5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-[10px] text-[#8a8a8a] tracking-wide">이렇게도 말해보세요</span>
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

        {/* 사용자 메시지 - 발음 연습 버튼 */}
        {isUser && onPronunciationPractice && (
          <div className="flex items-center gap-1 mt-1.5 mr-1 justify-end">
            <button
              onClick={() => onPronunciationPractice(english)}
              className="p-1.5 text-[#c5c5c5] hover:text-[#1a1a1a] transition-colors"
              title="발음 연습"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 4l-4 4m4 0l-4-4" />
              </svg>
            </button>
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

            {/* 한국어 번역 토글 버튼 - 항상 표시 */}
            <button
              onClick={translateText}
              disabled={isTranslating}
              className={`p-1.5 transition-colors ${
                showKorean ? 'text-[#1a1a1a]' : 'text-[#c5c5c5] hover:text-[#1a1a1a]'
              } ${isTranslating ? 'opacity-50' : ''}`}
              title={showKorean ? '번역 숨기기' : '번역 보기'}
            >
              {isTranslating ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              )}
            </button>

            {/* 발음 연습 버튼 */}
            {onPronunciationPractice && (
              <button
                onClick={() => onPronunciationPractice(english)}
                className="p-1.5 text-[#c5c5c5] hover:text-[#1a1a1a] transition-colors"
                title="발음 연습"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 4l-4 4m4 0l-4-4" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 학습 팁 */}
        {message.learningTip && (
          <div className="mt-2 px-3 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#8a8a8a] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
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
              className="px-3 py-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full text-sm text-[#1a1a1a] hover:bg-white hover:border-[#0D9488] transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          position={selectedWord.position}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  )
}
