'use client'

import { useState, useEffect, useRef } from 'react'

interface STTConfirmationBannerProps {
  transcript: string
  confidence: number
  onConfirm: (text: string) => void
  onEdit: (text: string) => void
  onDismiss: () => void
  autoSendDelay?: number // ms, default 5000
}

export default function STTConfirmationBanner({
  transcript,
  confidence,
  onConfirm,
  onEdit,
  onDismiss,
  autoSendDelay = 5000,
}: STTConfirmationBannerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(transcript)
  const [countdown, setCountdown] = useState(autoSendDelay / 1000)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 자동 전송 타이머
  useEffect(() => {
    if (isEditing) return

    timerRef.current = setTimeout(() => {
      onConfirm(transcript)
    }, autoSendDelay)

    // 카운트다운 표시
    const startTime = Date.now()
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, (autoSendDelay - elapsed) / 1000)
      setCountdown(Math.ceil(remaining))
    }, 100)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [transcript, autoSendDelay, isEditing, onConfirm])

  const handleEdit = () => {
    // 타이머 취소
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editText.trim()) {
      onEdit(editText.trim())
    }
  }

  const confidencePercent = Math.round(confidence * 100)

  if (isEditing) {
    return (
      <div className="mx-4 mb-2 p-3 bg-white border border-[#e5e5e5] rounded-xl shadow-sm">
        <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg hover:bg-[#333]"
          >
            전송
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-2 text-sm text-[#8a8a8a] hover:text-[#1a1a1a]"
          >
            취소
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-2 p-3 bg-white border border-[#e5e5e5] rounded-xl shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#1a1a1a] truncate">&quot;{transcript}&quot;</p>
          <p className="text-xs text-[#8a8a8a] mt-1">
            인식률 {confidencePercent}% - {countdown}초 후 자동 전송
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleEdit}
            className="px-2.5 py-1.5 text-xs border border-[#e5e5e5] rounded-lg text-[#8a8a8a] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onConfirm(transcript)}
            className="px-2.5 py-1.5 text-xs bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors"
          >
            전송
          </button>
        </div>
      </div>

      {/* 자동 전송 진행 바 */}
      <div className="mt-2 h-0.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1a1a1a] rounded-full transition-all duration-100"
          style={{ width: `${(1 - countdown / (autoSendDelay / 1000)) * 100}%` }}
        />
      </div>
    </div>
  )
}
