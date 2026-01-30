'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

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
  userAnswer: string
  showAnswer: boolean
  streak: number
  correctCount: number
  totalCount: number
  currentLevel: string
  levelProgress: number
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
  const [state, setState] = useState<LearningState>({
    currentWord: null,
    userAnswer: '',
    showAnswer: false,
    streak: 0,
    correctCount: 0,
    totalCount: 0,
    currentLevel: 'A1',
    levelProgress: 0,
    words: [],
    currentIndex: 0,
  })
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'meaning' | 'spelling' | 'listening'>('meaning')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  const [relatedContent, setRelatedContent] = useState<any>(null)

  const fetchWords = useCallback(async (level: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/vocabulary/level/${level}?limit=10`)
      if (response.ok) {
        const data = await response.json()
        if (data.words?.length > 0) {
          setState(prev => ({
            ...prev,
            words: data.words,
            currentWord: data.words[0],
            currentIndex: 0,
            currentLevel: level,
          }))
        }
      }
    } catch (error) {
      console.log('Using sample words')
      // 샘플 단어
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
      }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWords('A1')
  }, [fetchWords])

  const checkAnswer = async () => {
    if (!state.currentWord) return

    const isCorrect = state.userAnswer.toLowerCase().trim() === state.currentWord.word.toLowerCase().trim()

    setState(prev => ({
      ...prev,
      showAnswer: true,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      totalCount: prev.totalCount + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      levelProgress: isCorrect ? prev.levelProgress + 10 : Math.max(0, prev.levelProgress - 5),
    }))

    // 레벨업 체크
    if (isCorrect && state.levelProgress >= 90) {
      const currentLevelIndex = LEVELS.indexOf(state.currentLevel)
      if (currentLevelIndex < LEVELS.length - 1) {
        setShowLevelUp(true)
        setTimeout(() => {
          const newLevel = LEVELS[currentLevelIndex + 1]
          setState(prev => ({ ...prev, levelProgress: 0, currentLevel: newLevel }))
          fetchWords(newLevel)
          setShowLevelUp(false)
        }, 2000)
      }
    }

    // AI 판단 요청 (선택적)
    try {
      const response = await fetch(`${API_BASE}/api/vocabulary/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: state.currentWord.word,
          userAnswer: state.userAnswer,
          streak: state.streak,
          currentLevel: state.currentLevel,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.should_level_up) {
          setShowLevelUp(true)
        }
      }
    } catch {
      // AI 평가 실패 시 로컬 로직 사용
    }
  }

  const nextWord = () => {
    const nextIndex = (state.currentIndex + 1) % state.words.length
    setState(prev => ({
      ...prev,
      currentIndex: nextIndex,
      currentWord: prev.words[nextIndex],
      userAnswer: '',
      showAnswer: false,
    }))
    setExpandedWord(null)
    setRelatedContent(null)
  }

  const expandWord = async () => {
    if (!state.currentWord) return

    setExpandedWord(state.currentWord.word)
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/vocabulary/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: state.currentWord.word }),
      })

      if (response.ok) {
        const data = await response.json()
        setRelatedContent(data)
      }
    } catch {
      // 샘플 확장 데이터
      setRelatedContent({
        idioms: [
          { phrase: `say ${state.currentWord?.word}`, meaning: '~라고 말하다' },
        ],
        sentences: [
          { en: `I always ${state.currentWord?.word}.`, ko: '나는 항상 ~해요.' },
        ],
        related_words: ['similar', 'example', 'practice'],
      })
    } finally {
      setLoading(false)
    }
  }

  const speakWord = () => {
    if ('speechSynthesis' in window && state.currentWord) {
      const utterance = new SpeechSynthesisUtterance(state.currentWord.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
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

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-28">
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
            <p className="text-[#8a8a8a]">
              {state.currentLevel} → {LEVELS[LEVELS.indexOf(state.currentLevel) + 1]}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#faf9f7] border-b border-[#f0f0f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium">단어 연습</h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs text-white ${LEVEL_COLORS[state.currentLevel]}`}>
              {state.currentLevel}
            </span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[#8a8a8a] mb-1">
            <span>레벨 진행률</span>
            <span>{state.levelProgress}%</span>
          </div>
          <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${LEVEL_COLORS[state.currentLevel]}`}
              style={{ width: `${state.levelProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around mt-4 py-2">
          <div className="text-center">
            <p className="text-lg font-medium">{state.correctCount}/{state.totalCount}</p>
            <p className="text-[10px] text-[#8a8a8a]">정답</p>
          </div>
          <div className="w-px h-8 bg-[#e5e5e5]" />
          <div className="text-center">
            <p className="text-lg font-medium">🔥 {state.streak}</p>
            <p className="text-[10px] text-[#8a8a8a]">연속</p>
          </div>
          <div className="w-px h-8 bg-[#e5e5e5]" />
          <div className="text-center">
            <p className="text-lg font-medium">{state.words.length}</p>
            <p className="text-[10px] text-[#8a8a8a]">단어</p>
          </div>
        </div>
      </header>

      {/* Mode Selector */}
      <div className="px-6 py-4">
        <div className="flex gap-2">
          {[
            { key: 'meaning', label: '뜻 맞추기' },
            { key: 'spelling', label: '철자 맞추기' },
            { key: 'listening', label: '듣고 맞추기' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key as any)}
              className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                mode === m.key
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-[#e5e5e5]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word Card */}
      {state.currentWord && (
        <div className="px-6">
          <div className="bg-white rounded-3xl border border-[#f0f0f0] p-8 text-center">
            {/* Word Display */}
            {mode === 'meaning' && (
              <>
                <p className="text-3xl font-light mb-2">{state.currentWord.word}</p>
                <button onClick={speakWord} className="text-[#8a8a8a] hover:text-[#1a1a1a]">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                {state.showAnswer ? (
                  <p className="text-xl text-[#1a1a1a] mt-4">{state.currentWord.meaning}</p>
                ) : (
                  <p className="text-[#c5c5c5] mt-4">이 단어의 뜻은?</p>
                )}
              </>
            )}

            {mode === 'spelling' && (
              <>
                <p className="text-xl text-[#8a8a8a] mb-4">{state.currentWord.meaning}</p>
                <input
                  type="text"
                  value={state.userAnswer}
                  onChange={e => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && !state.showAnswer && checkAnswer()}
                  placeholder="영어 단어를 입력하세요"
                  className="w-full text-center text-2xl py-3 border-b-2 border-[#e5e5e5] focus:border-[#1a1a1a] outline-none bg-transparent"
                  disabled={state.showAnswer}
                  autoFocus
                />
                {state.showAnswer && (
                  <p className={`mt-4 text-lg ${
                    state.userAnswer.toLowerCase().trim() === state.currentWord.word.toLowerCase()
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {state.userAnswer.toLowerCase().trim() === state.currentWord.word.toLowerCase()
                      ? '✓ 정답!'
                      : `✗ 정답: ${state.currentWord.word}`}
                  </p>
                )}
              </>
            )}

            {mode === 'listening' && (
              <>
                <button
                  onClick={speakWord}
                  className="w-20 h-20 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                <p className="text-sm text-[#8a8a8a] mb-4">클릭해서 들어보세요</p>
                <input
                  type="text"
                  value={state.userAnswer}
                  onChange={e => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && !state.showAnswer && checkAnswer()}
                  placeholder="들은 단어를 입력하세요"
                  className="w-full text-center text-xl py-3 border-b-2 border-[#e5e5e5] focus:border-[#1a1a1a] outline-none bg-transparent"
                  disabled={state.showAnswer}
                />
                {state.showAnswer && (
                  <p className={`mt-4 text-lg ${
                    state.userAnswer.toLowerCase().trim() === state.currentWord.word.toLowerCase()
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {state.userAnswer.toLowerCase().trim() === state.currentWord.word.toLowerCase()
                      ? '✓ 정답!'
                      : `✗ 정답: ${state.currentWord.word}`}
                  </p>
                )}
              </>
            )}

            {/* Example Sentence */}
            {state.showAnswer && state.currentWord.example && (
              <div className="mt-6 p-4 bg-[#f5f5f5] rounded-xl text-left">
                <p className="text-sm">{state.currentWord.example}</p>
                {state.currentWord.example_ko && (
                  <p className="text-xs text-[#8a8a8a] mt-1">{state.currentWord.example_ko}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {!state.showAnswer ? (
              <button
                onClick={mode === 'meaning' ? () => setState(prev => ({ ...prev, showAnswer: true })) : checkAnswer}
                className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl font-medium"
              >
                {mode === 'meaning' ? '정답 보기' : '확인'}
              </button>
            ) : (
              <>
                <button
                  onClick={nextWord}
                  className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl font-medium"
                >
                  다음 단어
                </button>

                {/* Expand Button */}
                <button
                  onClick={expandWord}
                  className="w-full py-3 border border-[#1a1a1a] rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  숙어 & 문장 연습
                </button>
              </>
            )}
          </div>

          {/* Expanded Content */}
          {expandedWord && relatedContent && (
            <div className="mt-6 bg-white rounded-2xl border border-[#f0f0f0] p-5 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <span className="text-lg">📚</span>
                "{expandedWord}" 확장 학습
              </h3>

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
                  <p className="text-xs text-[#8a8a8a] mb-2">예문 연습</p>
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

              {/* Related Words */}
              {relatedContent.related_words?.length > 0 && (
                <div>
                  <p className="text-xs text-[#8a8a8a] mb-2">관련 단어</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedContent.related_words.map((word: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-[#f5f5f5] rounded-full text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]">
        <div className="flex items-center justify-around py-5">
          <Link href="/" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">홈</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">대화</span>
          </Link>
          <Link href="/vocabulary" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
            <span className="text-[10px] text-[#1a1a1a] tracking-wide">단어</span>
          </Link>
          <Link href="/community" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">커뮤니티</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
