'use client'

import { useState, useEffect } from 'react'
import { saveWord, isWordSaved } from '@/lib/savedWords'

interface WordPopupProps {
  word: string
  position: { x: number; y: number }
  onClose: () => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface WordInfo {
  word: string
  meaning: string
  pronunciation?: string
  examples?: string[]
}

export default function WordPopup({ word, position, onClose }: WordPopupProps) {
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(() => isWordSaved(word))

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const fetchWordInfo = async () => {
      setLoading(true)
      try {
        // 1. 백엔드 lookup 시도
        const response = await fetch(`${API_BASE}/api/vocabulary/lookup?word=${encodeURIComponent(word)}`, { signal })
        if (response.ok) {
          const data = await response.json()
          if (data.meaning && data.meaning !== '뜻을 찾을 수 없습니다') {
            setWordInfo(data)
            return
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        // 백엔드 실패 - 폴백 시도
      }

      try {
        // 2. 백엔드 번역 API 폴백
        const translateRes = await fetch(`${API_BASE}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: word, target_lang: 'ko' }),
          signal,
        })
        if (translateRes.ok) {
          const data = await translateRes.json()
          if (data.translation) {
            setWordInfo({ word, meaning: data.translation })
            return
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        // 번역 API도 실패
      }

      setWordInfo({ word, meaning: '뜻을 찾을 수 없습니다' })
    }

    fetchWordInfo().finally(() => {
      if (!signal.aborted) setLoading(false)
    })

    return () => controller.abort()
  }, [word])

  const handleSaveWord = () => {
    if (!wordInfo) return

    saveWord({
      word: wordInfo.word,
      meaning: wordInfo.meaning,
      pronunciation: wordInfo.pronunciation,
      example: wordInfo.examples?.[0],
    })
    setSaved(true)
    setTimeout(() => onClose(), 800)
  }

  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 280),
    top: Math.min(position.y + 10, window.innerHeight - 200),
    zIndex: 1000,
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[999]" 
        onClick={onClose}
      />
      <div 
        style={popupStyle}
        className="bg-white rounded-2xl shadow-xl border border-[#e5e5e5] p-4 w-64 z-[1000]"
      >
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : wordInfo ? (
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-[#1a1a1a]">{wordInfo.word}</h3>
              <button onClick={onClose} className="text-[#8a8a8a] p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {wordInfo.pronunciation && (
              <p className="text-sm text-[#8a8a8a] mb-2">{wordInfo.pronunciation}</p>
            )}
            
            <p className="text-sm text-[#666] mb-3">{wordInfo.meaning}</p>
            
            {wordInfo.examples && wordInfo.examples.length > 0 && (
              <div className="mb-3 p-2 bg-[#f5f5f5] rounded-lg">
                <p className="text-xs text-[#8a8a8a] mb-1">Example</p>
                <p className="text-sm text-[#666] italic">{wordInfo.examples[0]}</p>
              </div>
            )}
            
            <button
              onClick={handleSaveWord}
              disabled={saved}
              className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                saved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
              }`}
            >
              {saved ? '저장됨' : '단어장에 추가'}
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}
