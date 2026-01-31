'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'

function ChatContent() {
  const searchParams = useSearchParams()
  const expression = searchParams.get('expression')
  const meaning = searchParams.get('meaning')

  // 표현 연습 모드인지 확인
  const practiceExpression = expression ? { expression, meaning: meaning || '' } : undefined

  return (
    <main className="h-screen bg-[#faf9f7] text-[#1a1a1a] flex flex-col">
      {/* Top safe area - 30px */}
      <div className="h-[30px] bg-[#faf9f7] flex-shrink-0" />

      {/* Header */}
      <header className="bg-[#faf9f7] border-b border-[#f0f0f0] flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={practiceExpression ? "/daily" : "/"} className="flex items-center gap-2 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-sm font-medium tracking-wide">
            {practiceExpression ? '표현 연습' : '자유 회화'}
          </h1>
          <div className="w-5"></div>
        </div>
      </header>

      {/* Chat Area - Full Height */}
      <div className="max-w-2xl mx-auto w-full flex-1 overflow-hidden">
        <ChatWindow practiceExpression={practiceExpression} />
      </div>
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#faf9f7] flex items-center justify-center"><p className="text-[#8a8a8a]">로딩 중...</p></div>}>
      <ChatContent />
    </Suspense>
  )
}
