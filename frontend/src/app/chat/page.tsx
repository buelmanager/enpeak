'use client'

import Link from 'next/link'
import ChatWindow from '@/components/ChatWindow'

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] pb-20">
      {/* Header */}
      <header className="bg-[#faf9f7] border-b border-[#f0f0f0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-sm font-medium tracking-wide">자유 회화</h1>
          <div className="w-5"></div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="max-w-2xl mx-auto h-[calc(100vh-140px)]">
        <ChatWindow />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]">
        <div className="flex items-center justify-around py-5">
          <Link href="/" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">홈</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
            <span className="text-[10px] text-[#1a1a1a] tracking-wide">대화</span>
          </Link>
          <Link href="/roleplay" className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">연습</span>
          </Link>
          <button className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            <span className="text-[10px] text-[#8a8a8a] tracking-wide">설정</span>
          </button>
        </div>
      </nav>
    </main>
  )
}
