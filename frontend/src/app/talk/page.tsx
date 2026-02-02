'use client'

import { Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'
import { ModeSelector, TalkMode } from '@/components/ModeSelector'
import { useTalk } from '@/contexts/TalkContext'

function TalkContent() {
  const searchParams = useSearchParams()
  const { mode, setMode, setExpression, setScenario, clearConversation } = useTalk()
  const initializedRef = useRef(false)
  const chatKeyRef = useRef(0)

  // Handle URL params on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const urlMode = searchParams.get('mode') as TalkMode | null

    if (urlMode === 'expression') {
      const expression = searchParams.get('expression')
      const meaning = searchParams.get('meaning')
      if (expression) {
        setMode('expression')
        setExpression({ expression, meaning: meaning || '' })
      }
    } else if (urlMode === 'roleplay') {
      const scenario = searchParams.get('scenario')
      if (scenario) {
        setMode('roleplay')
        setScenario({ id: scenario, title: scenario })
      }
    }
  }, [searchParams, setMode, setExpression, setScenario])

  const handleModeChange = (newMode: TalkMode) => {
    if (newMode !== mode) {
      clearConversation()
      setMode(newMode)
      // Force ChatWindow re-mount by changing key
      chatKeyRef.current += 1
    }
  }

  return (
    <main className="h-screen bg-[#faf9f7] text-[#1a1a1a] flex flex-col">
      {/* Top safe area */}
      <div className="h-[30px] bg-[#faf9f7] flex-shrink-0" />

      {/* Header with back button */}
      <header className="bg-[#faf9f7] border-b border-[#f0f0f0] flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-sm font-medium tracking-wide">Talk</h1>
          <div className="w-5" />
        </div>
      </header>

      {/* Mode Selector */}
      <div className="bg-[#faf9f7] flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-2xl mx-auto w-full flex-1 overflow-hidden">
        <ChatWindow key={chatKeyRef.current} mode={mode} />
      </div>

      {/* Bottom safe area */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[#faf9f7] flex-shrink-0" />
    </main>
  )
}

export default function TalkPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#faf9f7] flex items-center justify-center">
          <p className="text-[#8a8a8a]">Loading...</p>
        </div>
      }
    >
      <TalkContent />
    </Suspense>
  )
}
