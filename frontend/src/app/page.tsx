'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getStats, getWeeklyActivity, getTodayRecords, type TodayStats, type LearningRecord } from '@/lib/learningHistory'
import { API_BASE, apiFetch } from '@/shared/constants/api'


interface DailyExpression {
  expression: string
  meaning: string
}

interface VocabWord {
  word: string
  meaning: string
  level: string
}

interface QuizQuestion {
  word: string
  correctMeaning: string
  options: string[]
  correctIndex: number
}

interface DailyChallenge {
  date: string
  goals: { label: string; target: number; current: number; type: string }[]
}

interface ScenarioRecommendation {
  id: string
  title: string
  titleKo: string
  difficulty: string
  category: string
  icon: string
  estimatedTime: string
}

const FALLBACK_EXPRESSIONS: DailyExpression[] = [
  { expression: "break the ice", meaning: "어색한 분위기를 깨다" },
  { expression: "a piece of cake", meaning: "아주 쉬운 일" },
  { expression: "hit the nail on the head", meaning: "정곡을 찌르다" },
  { expression: "once in a blue moon", meaning: "아주 드물게" },
  { expression: "under the weather", meaning: "몸이 안 좋다" },
]

const QUIZ_WORDS: VocabWord[] = [
  { word: 'achieve', meaning: '달성하다', level: 'B1' },
  { word: 'opportunity', meaning: '기회', level: 'B1' },
  { word: 'consider', meaning: '고려하다', level: 'B1' },
  { word: 'experience', meaning: '경험', level: 'A2' },
  { word: 'decision', meaning: '결정', level: 'B1' },
  { word: 'improve', meaning: '개선하다', level: 'A2' },
  { word: 'comfortable', meaning: '편안한', level: 'A2' },
  { word: 'challenge', meaning: '도전', level: 'B1' },
  { word: 'negotiate', meaning: '협상하다', level: 'B2' },
  { word: 'sophisticated', meaning: '세련된', level: 'C1' },
  { word: 'essential', meaning: '필수적인', level: 'B1' },
  { word: 'ridiculous', meaning: '터무니없는', level: 'B2' },
  { word: 'appreciate', meaning: '감사하다', level: 'B1' },
  { word: 'inevitable', meaning: '불가피한', level: 'C1' },
  { word: 'struggle', meaning: '분투하다', level: 'B1' },
]

const SCENARIO_RECOMMENDATIONS: ScenarioRecommendation[] = [
  { id: 'cafe_order', title: 'Ordering at a Cafe', titleKo: '카페 주문', difficulty: 'beginner', category: 'daily', icon: 'coffee', estimatedTime: '3-5 min' },
  { id: 'hotel_checkin', title: 'Hotel Check-in', titleKo: '호텔 체크인', difficulty: 'beginner', category: 'travel', icon: 'hotel', estimatedTime: '5-7 min' },
  { id: 'job_interview', title: 'Job Interview', titleKo: '영어 면접', difficulty: 'advanced', category: 'business', icon: 'briefcase', estimatedTime: '10-15 min' },
  { id: 'doctor_visit', title: 'Doctor Visit', titleKo: '병원 방문', difficulty: 'intermediate', category: 'daily', icon: 'medical', estimatedTime: '5-7 min' },
  { id: 'restaurant_order', title: 'Restaurant Ordering', titleKo: '레스토랑 주문', difficulty: 'intermediate', category: 'daily', icon: 'restaurant', estimatedTime: '5-7 min' },
  { id: 'airport_checkin', title: 'Airport Check-in', titleKo: '공항 체크인', difficulty: 'intermediate', category: 'travel', icon: 'plane', estimatedTime: '5-7 min' },
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return 'bg-[#e8f5e9] text-[#2e7d32]'
    case 'intermediate': return 'bg-[#fff3e0] text-[#e65100]'
    case 'advanced': return 'bg-[#fce4ec] text-[#c62828]'
    default: return 'bg-[#f5f5f5] text-[#666]'
  }
}

function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return '초급'
    case 'intermediate': return '중급'
    case 'advanced': return '고급'
    default: return difficulty
  }
}

function getCategoryIcon(icon: string) {
  switch (icon) {
    case 'coffee':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
        </svg>
      )
    case 'hotel':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0h2a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
        </svg>
      )
    case 'medical':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      )
    case 'restaurant':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12" />
        </svg>
      )
    case 'plane':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
  }
}

function generateQuiz(words: VocabWord[]): QuizQuestion | null {
  if (words.length < 3) return null

  const shuffled = [...words].sort(() => Math.random() - 0.5)
  const correct = shuffled[0]
  const wrongs = shuffled.slice(1, 3)

  const options = [correct.meaning, wrongs[0].meaning, wrongs[1].meaning]
  const correctIndex = 0

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]
  }

  return {
    word: correct.word,
    correctMeaning: correct.meaning,
    options,
    correctIndex: options.indexOf(correct.meaning),
  }
}

function getDailyChallenge(stats: TodayStats): DailyChallenge {
  const today = new Date().toISOString().split('T')[0]

  return {
    date: today,
    goals: [
      { label: '대화 연습', target: 3, current: stats.conversationScenarios + stats.totalSessions, type: 'conversation' },
      { label: '단어 학습', target: 10, current: stats.vocabularyWords, type: 'vocabulary' },
    ],
  }
}

function getRecentActivity(records: LearningRecord[]): LearningRecord | null {
  if (records.length === 0) return null
  return records[0]
}

function getActivityLabel(record: LearningRecord): string {
  switch (record.type) {
    case 'conversation': return '회화 연습'
    case 'vocabulary': return '단어 학습'
    case 'chat': return '자유 대화'
    case 'community': return '커뮤니티'
    default: return '학습'
  }
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return '어제'
}

export default function Home() {
  const { user, cachedUser } = useAuth()
  const displayUser = user || cachedUser

  const [greeting, setGreeting] = useState('Good morning')
  const [stats, setStats] = useState<TodayStats>({ totalSessions: 0, totalMinutes: 0, vocabularyWords: 0, conversationScenarios: 0, streak: 0 })
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [expression, setExpression] = useState<DailyExpression | null>(null)
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([])
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [recentRecord, setRecentRecord] = useState<LearningRecord | null>(null)
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null)

  const generateNewQuiz = useCallback(() => {
    const allWords = [...QUIZ_WORDS, ...vocabWords]
    const uniqueWords = allWords.filter((w, i, arr) => arr.findIndex(x => x.word === w.word) === i)
    if (uniqueWords.length >= 3) {
      setQuiz(generateQuiz(uniqueWords))
      setQuizAnswer(null)
    }
  }, [vocabWords])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    const currentStats = getStats()
    setStats(currentStats)
    setWeeklyActivity(getWeeklyActivity())
    setChallenge(getDailyChallenge(currentStats))
    setRecentRecord(getRecentActivity(getTodayRecords()))
    fetchExpression()
    fetchVocabWords()
  }, [])

  useEffect(() => {
    if (vocabWords.length > 0 || QUIZ_WORDS.length >= 3) {
      generateNewQuiz()
    }
  }, [vocabWords, generateNewQuiz])

  const fetchVocabWords = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/vocabulary/level/A1?limit=5`)
      if (response.ok) {
        const data = await response.json()
        if (data.words?.length > 0) {
          setVocabWords(data.words)
        }
      }
    } catch {
      setVocabWords([
        { word: 'hello', meaning: '안녕하세요', level: 'A1' },
        { word: 'thank you', meaning: '감사합니다', level: 'A1' },
        { word: 'please', meaning: '부탁합니다', level: 'A1' },
      ])
    }
  }

  const fetchExpression = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/rag/daily-expression`)
      if (response.ok) {
        const data = await response.json()
        setExpression({ expression: data.expression, meaning: data.meaning })
      } else {
        throw new Error('API failed')
      }
    } catch {
      const randomIndex = Math.floor(Math.random() * FALLBACK_EXPRESSIONS.length)
      setExpression(FALLBACK_EXPRESSIONS[randomIndex])
    }
  }

  const handleQuizAnswer = (index: number) => {
    if (quizAnswer !== null) return
    setQuizAnswer(index)
    if (quiz && index === quiz.correctIndex) {
      setQuizScore(prev => prev + 1)
    }
  }

  const totalChallengeProgress = challenge
    ? challenge.goals.reduce((sum, g) => sum + Math.min(g.current / g.target, 1), 0) / challenge.goals.length
    : 0

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-24">
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      <div className="px-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[13px] text-[#8a8a8a] tracking-wide">{greeting}</p>
            <h1 className="text-[22px] font-semibold tracking-tight mt-0.5">Flu</h1>
          </div>
          {displayUser ? (
            <Link
              href="/my"
              className="w-10 h-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-sm font-medium transition-transform active:scale-95"
            >
              {displayUser.displayName?.charAt(0) || displayUser.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center transition-transform active:scale-95"
            >
              <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Streak & Session Badges */}
        <div className="flex items-center justify-center gap-4 mb-5">
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
              <span className="text-[13px] text-[#1a1a1a] font-medium">{stats.streak}일 연속</span>
            </div>
          )}
          {stats.streak > 0 && stats.totalSessions > 0 && (
            <div className="w-px h-3 bg-[#e0e0e0]" />
          )}
          {stats.totalSessions > 0 && (
            <span className="text-[13px] text-[#8a8a8a]">오늘 {stats.totalSessions}회</span>
          )}
        </div>

        {/* --- NEW: Quick Mode Cards --- */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link href="/talk" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.96] text-center">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center mx-auto mb-2.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#1a1a1a]">자유 대화</p>
              <p className="text-[11px] text-[#8a8a8a] mt-0.5">Free Chat</p>
            </div>
          </Link>
          <Link
            href={expression
              ? `/talk?mode=expression&expression=${encodeURIComponent(expression.expression)}&meaning=${encodeURIComponent(expression.meaning)}`
              : '/talk?mode=expression'
            }
            className="block"
          >
            <div className="bg-white rounded-2xl p-4 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.96] text-center">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center mx-auto mb-2.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#1a1a1a]">표현 연습</p>
              <p className="text-[11px] text-[#8a8a8a] mt-0.5">Expressions</p>
            </div>
          </Link>
          <Link href="/talk?mode=roleplay" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.96] text-center">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center mx-auto mb-2.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#1a1a1a]">롤플레이</p>
              <p className="text-[11px] text-[#8a8a8a] mt-0.5">Roleplay</p>
            </div>
          </Link>
        </div>

        {/* --- NEW: Daily Challenge Card --- */}
        {challenge && (
          <div className="bg-[#0D9488] rounded-2xl p-5 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Today&apos;s Challenge</span>
              </div>
              <span className="text-[12px] text-white/50">{Math.round(totalChallengeProgress * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
              <div
                className="bg-white rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${Math.round(totalChallengeProgress * 100)}%` }}
              />
            </div>
            <div className="flex gap-3">
              {challenge.goals.map((goal) => {
                const progress = Math.min(goal.current / goal.target, 1)
                return (
                  <div key={goal.type} className="flex-1 bg-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-white/80">{goal.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[20px] font-bold text-white">{Math.min(goal.current, goal.target)}</span>
                      <span className="text-[13px] text-white/40">/ {goal.target}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1 mt-2">
                      <div
                        className="bg-white/60 rounded-full h-1 transition-all duration-500"
                        style={{ width: `${Math.round(progress * 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* --- NEW: Recent Activity Quick Resume --- */}
        {recentRecord && (
          <Link
            href={recentRecord.type === 'vocabulary' ? '/cards' : '/talk'}
            className="block mb-3"
          >
            <div className="bg-white rounded-2xl px-5 py-4 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#1a1a1a]">
                      {recentRecord.title || getActivityLabel(recentRecord)}
                    </p>
                    <p className="text-[11px] text-[#8a8a8a]">{getTimeAgo(recentRecord.completedAt)}</p>
                  </div>
                </div>
                <span className="text-[12px] text-[#8a8a8a] bg-[#f5f5f5] px-3 py-1 rounded-full">이어하기</span>
              </div>
            </div>
          </Link>
        )}

        {/* --- NEW: Quick Quiz Widget --- */}
        {quiz && (
          <div className="bg-white rounded-2xl p-5 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
                <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Quick Quiz</span>
              </div>
              {quizScore > 0 && (
                <span className="text-[12px] text-[#1a1a1a] font-medium">{quizScore}문제 정답</span>
              )}
            </div>
            <p className="text-[11px] text-[#8a8a8a] mb-2">이 단어의 뜻은?</p>
            <p className="text-[22px] font-bold text-[#1a1a1a] mb-4 tracking-tight">{quiz.word}</p>
            <div className="space-y-2">
              {quiz.options.map((option, idx) => {
                let btnClass = 'bg-[#f5f5f5] text-[#1a1a1a]'
                if (quizAnswer !== null) {
                  if (idx === quiz.correctIndex) {
                    btnClass = 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]'
                  } else if (idx === quizAnswer && idx !== quiz.correctIndex) {
                    btnClass = 'bg-[#fce4ec] text-[#c62828] border-[#f8bbd0]'
                  } else {
                    btnClass = 'bg-[#f5f5f5] text-[#aaa]'
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={quizAnswer !== null}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-medium border border-transparent transition-all active:scale-[0.98] ${btnClass}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {quizAnswer !== null && (
              <button
                onClick={generateNewQuiz}
                className="w-full mt-3 py-2.5 text-[13px] font-medium text-[#1a1a1a] bg-[#f5f5f5] rounded-xl transition-all active:scale-[0.98]"
              >
                다음 문제
              </button>
            )}
          </div>
        )}

        {/* Today's Expression */}
        {expression && (
          <Link
            href={`/talk?mode=expression&expression=${encodeURIComponent(expression.expression)}&meaning=${encodeURIComponent(expression.meaning)}`}
            className="block mb-3"
          >
            <div className="bg-white rounded-2xl p-5 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
                    <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Today&apos;s Expression</span>
                  </div>
                  <p className="text-[17px] font-semibold text-[#1a1a1a] mb-1.5 tracking-tight">{expression.expression}</p>
                  <p className="text-[14px] text-[#666]">{expression.meaning}</p>
                </div>
                <div className="ml-4 mt-1">
                  <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* --- NEW: Recommended Scenarios --- */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
              <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Scenarios</span>
            </div>
            <Link href="/talk?mode=roleplay" className="text-[12px] text-[#8a8a8a]">
              전체 보기
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6">
            {SCENARIO_RECOMMENDATIONS.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/talk?mode=roleplay&scenario=${scenario.id}`}
                className="block flex-shrink-0"
              >
                <div className="bg-white rounded-2xl p-4 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.97] w-[150px]">
                  <div className="w-9 h-9 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-3 text-[#666]">
                    {getCategoryIcon(scenario.icon)}
                  </div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a] mb-0.5 leading-snug">{scenario.titleKo}</p>
                  <p className="text-[11px] text-[#8a8a8a] mb-2 leading-snug">{scenario.title}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                      {getDifficultyLabel(scenario.difficulty)}
                    </span>
                    <span className="text-[10px] text-[#aaa]">{scenario.estimatedTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Vocabulary Preview */}
        {vocabWords.length > 0 && (
          <Link href="/cards" className="block mb-3">
            <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98] overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
                  <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">Vocabulary</span>
                </div>
                <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="flex gap-2 overflow-x-auto px-5 pb-5">
                {vocabWords.map((w) => (
                  <div
                    key={w.word}
                    className="flex-shrink-0 bg-[#f5f5f5] rounded-xl px-4 py-3 min-w-[110px]"
                  >
                    <p className="text-[15px] font-semibold text-[#1a1a1a] mb-0.5">{w.word}</p>
                    <p className="text-[12px] text-[#888]">{w.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        )}

        {/* Weekly Activity */}
        <Link href="/stats" className="block mb-3">
          <div className="bg-white rounded-2xl p-5 border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-[#0D9488] rounded-full" />
                  <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-wider">This Week</span>
                </div>
                <div className="flex justify-between">
                  {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-[#8a8a8a]">{day}</span>
                      <div className={`w-8 h-8 rounded-lg ${
                        weeklyActivity[idx] ? 'bg-[#0D9488]' : 'bg-[#f0f0f0]'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="ml-4 mt-1">
                <svg className="w-5 h-5 text-[#c0c0c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <BottomNav />
    </main>
  )
}
