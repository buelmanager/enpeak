'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useTTS } from '@/contexts/TTSContext'
import { addLearningRecord } from '@/lib/learningHistory'
import { getSavedWords, removeWord, SavedWord } from '@/lib/savedWords'

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

export default function CardsPage() {
  const router = useRouter()
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
  const [tab, setTab] = useState<'level' | 'saved'>('level')
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])

  useEffect(() => {
    setSavedWords(getSavedWords())
  }, [tab])

  const fetchWords = useCallback(async (level: string, signal?: AbortSignal) => {
    setLoading(true)
    try {
      // 정적 파일에서 전체 단어 로드
      const response = await fetch('/data/vocabulary.json', { signal })
      if (response.ok) {
        const data = await response.json()
        const levelWords: { w: string; m: string; e: string }[] = data[level] || []
        if (levelWords.length > 0) {
          // 셔플
          const shuffled = [...levelWords].sort(() => Math.random() - 0.5)
          const words: VocabWord[] = shuffled.map(v => ({
            word: v.w,
            meaning: v.m,
            level,
            example: v.e || undefined,
          }))
          setState(prev => ({
            ...prev,
            words,
            currentWord: words[0],
            currentIndex: 0,
            currentLevel: level,
            revealed: false,
          }))
          return
        }
      }
    } catch {
      // 정적 파일 실패 시 API 폴백
    }

    try {
      const response = await fetch(`${API_BASE}/api/vocabulary/level/${level}?limit=500`, { signal })
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
          return
        }
      }
    } catch {
      // API도 실패
    }

    // 최종 폴백
    const sampleWords: VocabWord[] = [
      { word: 'hello', meaning: '안녕하세요', level: 'A1', example: 'Hello, how are you?' },
      { word: 'goodbye', meaning: '안녕히 가세요', level: 'A1', example: 'Goodbye, see you later!' },
      { word: 'thank you', meaning: '감사합니다', level: 'A1', example: 'Thank you for your help.' },
      { word: 'happy', meaning: '행복한', level: 'A1', example: "I'm so happy today!" },
    ]
    setState(prev => ({
      ...prev,
      words: sampleWords,
      currentWord: sampleWords[0],
      currentIndex: 0,
      currentLevel: level,
      revealed: false,
    }))
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLoading(false) }, [state.words])

  useEffect(() => {
    const controller = new AbortController()
    fetchWords('A1', controller.signal)
    return () => controller.abort()
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
        error: '관련 콘텐츠를 불러올 수 없습니다.',
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
      <div className="bg-[#faf9f7] fixed top-0 left-0 right-0 z-20" style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Header */}
      <header className="fixed left-0 right-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0] px-6 py-4" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-medium">Cards</h1>
          <div className="flex items-center gap-2">
            {tab === 'level' && (
              <span className={`px-2 py-1 rounded text-xs text-white ${LEVEL_COLORS[state.currentLevel]}`}>
                {state.currentLevel}
              </span>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex mt-3 bg-[#f0f0f0] rounded-xl p-0.5">
          <button
            onClick={() => setTab('level')}
            className={`flex-1 py-1.5 rounded-[10px] text-[13px] font-medium transition-all ${
              tab === 'level' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#8a8a8a]'
            }`}
          >
            레벨별
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 py-1.5 rounded-[10px] text-[13px] font-medium transition-all relative ${
              tab === 'saved' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#8a8a8a]'
            }`}
          >
            내 단어장
            {savedWords.length > 0 && tab !== 'saved' && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {savedWords.length}
              </span>
            )}
          </button>
        </div>

        {/* Progress (level tab only) */}
        {tab === 'level' && (
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
        )}
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: `calc(env(safe-area-inset-top, 0px) + ${tab === 'level' ? '160px' : '120px'})` }} />

      {/* Saved Words Tab */}
      {tab === 'saved' && (
        <div className="px-6 py-4">
          {savedWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-[#d5d5d5] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-[#8a8a8a] text-sm mb-1">저장된 단어가 없습니다</p>
              <p className="text-[#c5c5c5] text-xs">대화 중 모르는 단어를 길게 눌러 저장해보세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedWords.map((sw) => (
                <div key={sw.word} className="bg-white rounded-xl border border-[#f0f0f0] p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#1a1a1a]">{sw.word}</span>
                      <button
                        onClick={() => speak(sw.word)}
                        className="text-[#8a8a8a] hover:text-[#1a1a1a] flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-[#666]">{sw.meaning}</p>
                    {sw.example && (
                      <p className="text-xs text-[#8a8a8a] mt-1 italic">{sw.example}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      removeWord(sw.word)
                      setSavedWords(getSavedWords())
                    }}
                    className="text-[#c5c5c5] hover:text-red-400 p-1 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode Selector (level tab only) */}
      {tab === 'level' && (
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
      )}

      {/* Flashcard */}
      {tab === 'level' && state.currentWord && (
        <div className="px-6">
          <div
            className="bg-white rounded-3xl border border-[#f0f0f0] p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer active:bg-[#fafafa] transition-colors"
            onClick={!state.revealed ? revealAnswer : undefined}
            data-testid="flashcard"
          >
            {mode === 'hide-meaning' ? (
              <>
                {/* 단어 보여주고 뜻 가리기 */}
                <p className="text-3xl font-light mb-3" data-testid="card-word">{cleanWord(state.currentWord.word)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); speakWord(); }}
                  className="text-[#8a8a8a] hover:text-[#1a1a1a] mb-6"
                  data-testid="speak-button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>

                {state.revealed ? (
                  <div className="text-center animate-fade-in" data-testid="revealed-content">
                    <p className="text-xl text-[#1a1a1a]" data-testid="card-meaning">{state.currentWord.meaning}</p>
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
                  <div className="text-center" data-testid="hidden-content">
                    <div className="w-32 h-8 bg-[#e5e5e5] rounded-lg mx-auto mb-2" />
                    <p className="text-sm text-[#8a8a8a]">탭하여 뜻 보기</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 뜻 보여주고 단어 가리기 */}
                <p className="text-xl text-[#666] mb-6" data-testid="card-meaning">{state.currentWord.meaning}</p>

                {state.revealed ? (
                  <div className="text-center animate-fade-in" data-testid="revealed-content">
                    <p className="text-3xl font-light mb-3" data-testid="card-word">{cleanWord(state.currentWord.word)}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); speakWord(); }}
                      className="text-[#8a8a8a] hover:text-[#1a1a1a]"
                      data-testid="speak-button"
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
                  <div className="text-center" data-testid="hidden-content">
                    <div className="w-40 h-10 bg-[#e5e5e5] rounded-lg mx-auto mb-2" />
                    <p className="text-sm text-[#8a8a8a]">탭하여 단어 보기</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          {state.revealed && (
            <div className="mt-6 space-y-3" data-testid="action-buttons">
              <div className="flex gap-3">
                <button
                  onClick={() => nextWord(false)}
                  className="flex-1 py-4 bg-[#f5f5f5] text-[#666] rounded-xl font-medium"
                  data-testid="dont-know-button"
                >
                  모르겠어요
                </button>
                <button
                  onClick={() => nextWord(true)}
                  className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-xl font-medium"
                  data-testid="know-button"
                >
                  알아요
                </button>
              </div>

              {/* Expand Button */}
              <button
                onClick={expandWord}
                disabled={loadingExpand}
                className="w-full py-3 border border-[#1a1a1a] rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="expand-button"
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
            <div className="mt-6 bg-white rounded-2xl border border-[#f0f0f0] p-5 space-y-4" data-testid="expanded-content">
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
                  {relatedContent.error || '관련 숙어와 예문을 찾는 중...'}
                </p>
              )}

              {/* Practice Button */}
               <Link
                 href={`/talk?context=vocabulary&word=${expandedWord}`}
                 className="block w-full py-3 bg-[#1a1a1a] text-white rounded-xl text-sm text-center font-medium"
               >
                 이 단어로 대화 연습하기
               </Link>
            </div>
          )}
        </div>
      )}

      {/* Level Selector */}
      {tab === 'level' && (
      <div className="px-6 mt-8">
        <p className="text-sm font-medium mb-3">레벨 선택</p>
        <div className="flex gap-2 overflow-x-auto pb-2" data-testid="level-selector">
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => fetchWords(level)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                state.currentLevel === level
                  ? `${LEVEL_COLORS[level]} text-white`
                  : 'bg-white border border-[#e5e5e5]'
              }`}
              data-testid={`level-${level}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      )}

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
