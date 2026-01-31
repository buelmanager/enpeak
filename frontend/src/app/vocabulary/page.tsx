'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useTTS } from '@/contexts/TTSContext'
import { addLearningRecord } from '@/lib/learningHistory'

interface VocabWord {
  word: string
  meaning: string
  level: string
  pronunciation?: string
  example?: string
  example_ko?: string
}

interface LearningState {
  currentWord: VocabWord | null
  revealed: boolean
  learnedCount: number
  totalCount: number
  currentLevel: string
  words: VocabWord[]
  currentIndex: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LEVEL_COLORS: Record<string, string> = {
  'A1': 'bg-green-500',
  'A2': 'bg-green-400',
  'B1': 'bg-yellow-500',
  'B2': 'bg-orange-500',
  'C1': 'bg-red-500',
  'C2': 'bg-purple-500',
}

export default function VocabularyPage() {
  const { speak } = useTTS()
  const [state, setState] = useState<LearningState>({
    currentWord: null,
    revealed: false,
    learnedCount: 0,
    totalCount: 0,
    currentLevel: 'A1',
    words: [],
    currentIndex: 0,
  })
  const [loading, setLoading] = useState(true)
  const [mode, setModeState] = useState<'hide-meaning' | 'hide-word'>('hide-meaning')

  const setMode = (newMode: 'hide-meaning' | 'hide-word') => {
    setModeState(newMode)
    setState(prev => ({ ...prev, revealed: false }))
  }
  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  const [relatedContent, setRelatedContent] = useState<any>(null)
  const [loadingExpand, setLoadingExpand] = useState(false)

  const fetchWords = useCallback(async (level: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/vocabulary/level/${level}?limit=20`)
      if (response.ok) {
        const data = await response.json()
        if (data.words?.length > 0) {
          setState(prev => ({
            ...prev,
            words: data.words,
            currentWord: data.words[0],
            currentIndex: 0,
            currentLevel: level,
            revealed: false,
          }))
        }
      }
    } catch (error) {
      console.log('Using sample words')
      const sampleWords: VocabWord[] = [
        { word: 'hello', meaning: '안녕하세요', level: 'A1', example: 'Hello, how are you?', example_ko: '안녕하세요, 어떻게 지내세요?' },
        { word: 'goodbye', meaning: '안녕히 가세요', level: 'A1', example: 'Goodbye, see you later!', example_ko: '안녕히 가세요, 나중에 봐요!' },
        { word: 'thank you', meaning: '감사합니다', level: 'A1', example: 'Thank you for your help.', example_ko: '도와주셔서 감사합니다.' },
        { word: 'please', meaning: '부탁드립니다', level: 'A1', example: 'Please help me.', example_ko: '도와주세요.' },
        { word: 'sorry', meaning: '죄송합니다', level: 'A1', example: "I'm sorry for being late.", example_ko: '늦어서 죄송합니다.' },
        { word: 'friend', meaning: '친구', level: 'A1', example: 'She is my best friend.', example_ko: '그녀는 내 가장 친한 친구야.' },
        { word: 'family', meaning: '가족', level: 'A1', example: 'I love my family.', example_ko: '나는 가족을 사랑해.' },
        { word: 'water', meaning: '물', level: 'A1', example: 'Can I have some water?', example_ko: '물 좀 주시겠어요?' },
        { word: 'food', meaning: '음식', level: 'A1', example: 'The food is delicious.', example_ko: '음식이 맛있어요.' },
        { word: 'happy', meaning: '행복한', level: 'A1', example: "I'm so happy today!", example_ko: '오늘 정말 행복해!' },
      ]
      setState(prev => ({
        ...prev,
        words: sampleWords,
        currentWord: sampleWords[0],
        currentIndex: 0,
        currentLevel: level,
        revealed: false,
      }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWords('A1')
  }, [fetchWords])

  const revealAnswer = () => {
    setState(prev => ({ ...prev, revealed: true }))

    // 학습 기록 저장
    if (state.currentWord) {
      addLearningRecord({
        type: 'vocabulary',
        title: state.currentWord.word,
        word: state.currentWord.word,
        details: {
          level: state.currentLevel,
        },
      })
    }
  }

  const nextWord = (known: boolean) => {
    const nextIndex = (state.currentIndex + 1) % state.words.length
    setState(prev => ({
      ...prev,
      currentIndex: nextIndex,
      currentWord: prev.words[nextIndex],
      revealed: false,
      learnedCount: known ? prev.learnedCount + 1 : prev.learnedCount,
      totalCount: prev.totalCount + 1,
    }))
    setExpandedWord(null)
    setRelatedContent(null)
  }

  const expandWord = async () => {
    if (!state.currentWord) return

    setExpandedWord(state.currentWord.word)
    setLoadingExpand(true)

    try {
      const response = await fetch(`${API_BASE}/api/vocabulary/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: state.currentWord.word }),
      })

      if (response.ok) {
        const data = await response.json()
        setRelatedContent({
          idioms: data.idioms || [],
          sentences: data.sentences || [],
          related_words: data.related_words || [],
        })
      } else {
        throw new Error('API failed')
      }
    } catch {
      setRelatedContent({
        idioms: [],
        sentences: [],
        related_words: [],
      })
    } finally {
      setLoadingExpand(false)
    }
  }

  const speakWord = () => {
    if (state.currentWord) {
      speak(state.currentWord.word)
    }
  }

  if (loading && !state.currentWord) {
    return (
      <main className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-2">
            <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#c5c5c5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-[#8a8a8a]">단어를 불러오는 중...</p>
        </div>
      </main>
    )
  }

  const cleanWord = (word: string) => word.replace(/:/g, '').trim()

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-32">
      {/* Top safe area */}
      <div className="h-[30px] bg-[#faf9f7] fixed top-0 left-0 right-0 z-20" />

      {/* Header */}
      <header className="fixed left-0 right-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0] px-6 py-4" style={{ top: '30px' }}>
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium">단어 암기</h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs text-white ${LEVEL_COLORS[state.currentLevel]}`}>
              {state.currentLevel}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[#8a8a8a] mb-1">
            <span>{state.currentIndex + 1} / {state.words.length}</span>
            <span>학습: {state.learnedCount}개</span>
          </div>
          <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${LEVEL_COLORS[state.currentLevel]}`}
              style={{ width: `${((state.currentIndex + 1) / state.words.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-32" />

      {/* Mode Selector */}
      <div className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('hide-meaning')}
            className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
              mode === 'hide-meaning'
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-[#e5e5e5]'
            }`}
          >
            뜻 가리기
          </button>
          <button
            onClick={() => setMode('hide-word')}
            className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
              mode === 'hide-word'
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-[#e5e5e5]'
            }`}
          >
            단어 가리기
          </button>
        </div>
      </div>

      {/* Flashcard */}
      {state.currentWord && (
        <div className="px-6">
          <div
            className="bg-white rounded-3xl border border-[#f0f0f0] p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer active:bg-[#fafafa] transition-colors"
            onClick={!state.revealed ? revealAnswer : undefined}
          >
            {mode === 'hide-meaning' ? (
              <>
                {/* 단어 보여주고 뜻 가리기 */}
                <p className="text-3xl font-light mb-3">{cleanWord(state.currentWord.word)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); speakWord(); }}
                  className="text-[#8a8a8a] hover:text-[#1a1a1a] mb-6"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>

                {state.revealed ? (
                  <div className="text-center animate-fade-in">
                    <p className="text-xl text-[#1a1a1a]">{state.currentWord.meaning}</p>
                    {state.currentWord.example && (
                      <div className="mt-4 p-3 bg-[#f5f5f5] rounded-xl text-left">
                        <p className="text-sm">{state.currentWord.example}</p>
                        {state.currentWord.example_ko && (
                          <p className="text-xs text-[#8a8a8a] mt-1">{state.currentWord.example_ko}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-8 bg-[#e5e5e5] rounded-lg mx-auto mb-2" />
                    <p className="text-sm text-[#8a8a8a]">탭하여 뜻 보기</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 뜻 보여주고 단어 가리기 */}
                <p className="text-xl text-[#666] mb-6">{state.currentWord.meaning}</p>

                {state.revealed ? (
                  <div className="text-center animate-fade-in">
                    <p className="text-3xl font-light mb-3">{cleanWord(state.currentWord.word)}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); speakWord(); }}
                      className="text-[#8a8a8a] hover:text-[#1a1a1a]"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                    {state.currentWord.example && (
                      <div className="mt-4 p-3 bg-[#f5f5f5] rounded-xl text-left">
                        <p className="text-sm">{state.currentWord.example}</p>
                        {state.currentWord.example_ko && (
                          <p className="text-xs text-[#8a8a8a] mt-1">{state.currentWord.example_ko}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-40 h-10 bg-[#e5e5e5] rounded-lg mx-auto mb-2" />
                    <p className="text-sm text-[#8a8a8a]">탭하여 단어 보기</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          {state.revealed && (
            <div className="mt-6 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => nextWord(false)}
                  className="flex-1 py-4 bg-[#f5f5f5] text-[#666] rounded-xl font-medium"
                >
                  모르겠어요
                </button>
                <button
                  onClick={() => nextWord(true)}
                  className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-xl font-medium"
                >
                  알아요
                </button>
              </div>

              {/* Expand Button */}
              <button
                onClick={expandWord}
                disabled={loadingExpand}
                className="w-full py-3 border border-[#1a1a1a] rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingExpand ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    관련 숙어 & 예문
                  </>
                )}
              </button>
            </div>
          )}

          {/* Expanded Content */}
          {expandedWord && relatedContent && (
            <div className="mt-6 bg-white rounded-2xl border border-[#f0f0f0] p-5 space-y-4">
              <h3 className="font-medium">"{expandedWord}" 확장 학습</h3>

              {/* Idioms */}
              {relatedContent.idioms?.length > 0 && (
                <div>
                  <p className="text-xs text-[#8a8a8a] mb-2">관련 숙어</p>
                  <div className="space-y-2">
                    {relatedContent.idioms.map((idiom: any, idx: number) => (
                      <div key={idx} className="p-3 bg-[#f5f5f5] rounded-xl">
                        <p className="font-medium text-sm">{idiom.phrase}</p>
                        <p className="text-xs text-[#8a8a8a]">{idiom.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sentences */}
              {relatedContent.sentences?.length > 0 && (
                <div>
                  <p className="text-xs text-[#8a8a8a] mb-2">예문</p>
                  <div className="space-y-2">
                    {relatedContent.sentences.map((sentence: any, idx: number) => (
                      <div key={idx} className="p-3 bg-[#f5f5f5] rounded-xl">
                        <p className="text-sm">{sentence.en}</p>
                        <p className="text-xs text-[#8a8a8a]">{sentence.ko}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No content message */}
              {(!relatedContent.idioms?.length && !relatedContent.sentences?.length) && (
                <p className="text-sm text-[#8a8a8a] text-center py-4">
                  관련 숙어와 예문을 찾는 중...
                </p>
              )}

              {/* Practice Button */}
              <Link
                href={`/chat?context=vocabulary&word=${expandedWord}`}
                className="block w-full py-3 bg-[#1a1a1a] text-white rounded-xl text-sm text-center font-medium"
              >
                이 단어로 대화 연습하기
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Level Selector */}
      <div className="px-6 mt-8">
        <p className="text-sm font-medium mb-3">레벨 선택</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => fetchWords(level)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                state.currentLevel === level
                  ? `${LEVEL_COLORS[level]} text-white`
                  : 'bg-white border border-[#e5e5e5]'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>

      <BottomNav />
    </main>
  )
}
