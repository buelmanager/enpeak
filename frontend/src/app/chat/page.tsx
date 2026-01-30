'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import ChatWindow from '@/components/ChatWindow'

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">홈</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">자유 회화</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="max-w-2xl mx-auto h-[calc(100vh-60px)]">
        <ChatWindow />
      </div>
    </main>
  )
}
