'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import {
  getTodayRecords,
  getStats,
  getWeeklyActivity,
  getLearningTypeInfo,
  type LearningRecord,
  type TodayStats,
} from '@/lib/learningHistory'

export default function Home() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<TodayStats>({
    totalSessions: 0,
    totalMinutes: 0,
    vocabularyWords: 0,
    conversationScenarios: 0,
    streak: 0,
  })
  const [todayRecords, setTodayRecords] = useState<LearningRecord[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [greeting, setGreeting] = useState('Good morning')
  const [showTodayDetail, setShowTodayDetail] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // 학습 데이터 로드
    loadLearningData()
  }, [])

  const loadLearningData = () => {
    const loadedStats = getStats()
    const loadedRecords = getTodayRecords()
    const loadedWeekly = getWeeklyActivity()

    setStats(loadedStats)
    setTodayRecords(loadedRecords)
    setWeeklyActivity(loadedWeekly)
  }

  const handleLogout = async () => {
    await logOut()
  }

  const activeDays = weeklyActivity.filter(Boolean).length

  // 학습 기록 시간 포맷
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-32">
      {/* Top safe area - 30px */}
      <div className="h-[30px] bg-[#faf9f7]" />

      {/* Header */}
      <header className="px-6 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#8a8a8a] text-sm tracking-wide">{greeting}</p>
            <h1 className="text-3xl font-light mt-2 tracking-tight">
              오늘의 <span className="font-medium">영어</span>
            </h1>
          </div>
          {loading ? (
            <div className="w-10 h-10 rounded-full border border-[#e5e5e5]" />
          ) : user ? (
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-medium"
            >
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </button>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full border border-[#1a1a1a] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">{stats.totalSessions}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">오늘 학습</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">{stats.streak}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">연속 일</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">{stats.totalMinutes}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">총 분</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#f0f0f0]">
            <p className="text-2xl font-light">{stats.vocabularyWords}</p>
            <p className="text-[10px] text-[#8a8a8a] mt-1 tracking-wide">단어</p>
          </div>
        </div>

        {/* Today's Learning - Clickable */}
        <button
          onClick={() => setShowTodayDetail(!showTodayDetail)}
          className="w-full bg-white rounded-2xl p-5 border border-[#f0f0f0] text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">오늘의 학습</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8a8a8a]">{todayRecords.length}개 완료</span>
              <svg
                className={`w-4 h-4 text-[#8a8a8a] transition-transform ${showTodayDetail ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {todayRecords.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-[#8a8a8a]">아직 오늘 학습한 내용이 없어요</p>
              <p className="text-xs text-[#b5b5b5] mt-1">회화나 단어 연습을 시작해보세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* 최근 3개만 미리보기 */}
              {todayRecords.slice(0, showTodayDetail ? undefined : 3).map(record => {
                const typeInfo = getLearningTypeInfo(record.type)
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 py-2 border-b border-[#f5f5f5] last:border-b-0"
                  >
                    <div className={`w-8 h-8 rounded-full ${typeInfo.color} bg-opacity-20 flex items-center justify-center`}>
                      {record.type === 'conversation' && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )}
                      {record.type === 'vocabulary' && (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {record.type === 'community' && (
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      {record.type === 'chat' && (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{record.title}</p>
                      <p className="text-[10px] text-[#8a8a8a]">
                        {typeInfo.label}
                        {record.details?.correctCount !== undefined && (
                          <> - {record.details.correctCount}/{record.details.totalCount} 정답</>
                        )}
                        {record.details?.stage && (
                          <> - Stage {record.details.stage}/{record.details.totalStages}</>
                        )}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#b5b5b5]">{formatTime(record.completedAt)}</span>
                  </div>
                )
              })}
              {!showTodayDetail && todayRecords.length > 3 && (
                <p className="text-xs text-center text-[#8a8a8a] py-1">
                  +{todayRecords.length - 3}개 더보기
                </p>
              )}
            </div>
          )}
        </button>

        {/* Main CTA - Conversation Practice */}
        <Link href="/conversations" className="block">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium">상황별 회화 연습</span>
                </div>
                <p className="text-sm text-[#a0a0a0] leading-relaxed">
                  12개 카테고리, 100개 이상의 실생활 대화 상황
                </p>
              </div>
              <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#333]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#888]">여행</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#888]">비즈니스</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#888]">일상</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#888]">+9</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {/* Free Chat */}
          <Link href="/chat" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] h-full text-center">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-2 mx-auto">
                <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="font-medium text-xs">자유 대화</h4>
            </div>
          </Link>

          {/* Vocabulary Practice */}
          <Link href="/vocabulary" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] h-full text-center">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-2 mx-auto">
                <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-medium text-xs">단어 연습</h4>
            </div>
          </Link>

          {/* Create Scenario */}
          <Link href="/create" className="block">
            <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] h-full text-center">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-2 mx-auto">
                <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h4 className="font-medium text-xs">대화 만들기</h4>
            </div>
          </Link>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">이번 주 학습</h3>
            <span className="text-xs text-[#8a8a8a]">{activeDays}/7일</span>
          </div>
          <div className="flex justify-between">
            {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  weeklyActivity[idx] ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f5] text-[#c5c5c5]'
                }`}>
                  {weeklyActivity[idx] ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs">{day}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="py-4 text-center">
          <p className="text-[#8a8a8a] text-sm italic leading-relaxed">
            "꾸준함이 완벽함을 이긴다"
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
