'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import VoiceRecorder, { VoiceRecorderRef, STTResultMetadata } from './VoiceRecorder'
import { useTTS } from '@/contexts/TTSContext'
import { useAudioLevel } from '@/hooks/useAudioLevel'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })
import recAnimation from '../../public/rec.json'

type Status = 'idle' | 'listening' | 'result'

interface PronunciationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (text: string) => void
  targetText?: string
  autoRecord?: boolean
}

// 두 텍스트의 유사도 계산 (단어 기반)
function calculateSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[.,!?;:'"()\-]/g, '').replace(/\s+/g, ' ').trim()

  const wordsA = normalize(a).split(' ')
  const wordsB = normalize(b).split(' ')

  if (wordsA.length === 0 || wordsB.length === 0) return 0

  let matches = 0
  const used = new Set<number>()

  for (const wordA of wordsA) {
    for (let j = 0; j < wordsB.length; j++) {
      if (!used.has(j) && wordA === wordsB[j]) {
        matches++
        used.add(j)
        break
      }
    }
  }

  const maxLen = Math.max(wordsA.length, wordsB.length)
  return Math.round((matches / maxLen) * 100)
}

export default function PronunciationModal({ isOpen, onClose, onConfirm, targetText, autoRecord }: PronunciationModalProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [similarity, setSimilarity] = useState(0)

  const voiceRecorderRef = useRef<VoiceRecorderRef>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { speakWithCallback, stop: stopTTS, isSpeaking } = useTTS()
  const audioLevelMonitor = useAudioLevel()

  // 모달 열릴 때 상태 리셋
  useEffect(() => {
    if (isOpen) {
      setStatus('idle')
      setInterimTranscript('')
      setFinalTranscript('')
      setSimilarity(0)
    }
  }, [isOpen])

  // autoRecord: 모달 열릴 때 자동 녹음 시작
  useEffect(() => {
    if (isOpen && autoRecord) {
      const timer = setTimeout(() => {
        setStatus('listening')
        setInterimTranscript('')
        setFinalTranscript('')
        setSimilarity(0)
        voiceRecorderRef.current?.startRecording()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoRecord])

  // 모달 닫힐 때 정리
  useEffect(() => {
    if (!isOpen) {
      voiceRecorderRef.current?.stopRecording()
      audioLevelMonitor.stopMonitoring()
      stopTTS()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [isOpen])

  // 목표 텍스트 TTS 재생
  const playTargetAudio = useCallback(() => {
    if (targetText) {
      speakWithCallback(targetText)
    }
  }, [targetText, speakWithCallback])

  // 마이크 버튼 클릭
  const handleMicClick = useCallback(() => {
    if (status === 'listening') {
      voiceRecorderRef.current?.stopRecording()
      return
    }

    // 결과 초기화 후 녹음 시작
    setStatus('listening')
    setInterimTranscript('')
    setFinalTranscript('')
    setSimilarity(0)
    stopTTS()

    voiceRecorderRef.current?.startRecording()
  }, [status, stopTTS])

  // STT 결과 처리
  const handleVoiceResult = useCallback((text: string, _metadata?: STTResultMetadata) => {
    setFinalTranscript(text)
    setStatus('result')

    // 유사도 계산
    if (targetText) {
      const sim = calculateSimilarity(targetText, text)
      setSimilarity(sim)
    }

    // 오디오 정리
    audioLevelMonitor.stopMonitoring()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [targetText, audioLevelMonitor])

  // 중간 결과
  const handleInterimResult = useCallback((text: string) => {
    setInterimTranscript(text)
  }, [])

  // 스트림 준비 (audioLevel 연동)
  const handleStreamReady = useCallback((stream: MediaStream) => {
    streamRef.current = stream
    audioLevelMonitor.startMonitoring(stream)
  }, [audioLevelMonitor])

  // 녹음 상태 변경
  const handleRecordingChange = useCallback((_recording: boolean) => {
    // VoiceRecorder 상태 추적용
  }, [])

  // 다시 시도: TTS 재생 후 자동 녹음
  const handleRetry = useCallback(() => {
    setInterimTranscript('')
    setFinalTranscript('')
    setSimilarity(0)

    if (targetText) {
      setStatus('idle')
      speakWithCallback(targetText, () => {
        setStatus('listening')
        setTimeout(() => {
          voiceRecorderRef.current?.startRecording()
        }, 300)
      })
    } else {
      setStatus('listening')
      setTimeout(() => {
        voiceRecorderRef.current?.startRecording()
      }, 300)
    }
  }, [targetText, speakWithCallback])

  // 모달 닫기
  const handleClose = useCallback(() => {
    voiceRecorderRef.current?.stopRecording()
    audioLevelMonitor.stopMonitoring()
    stopTTS()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    onClose()
  }, [onClose, audioLevelMonitor, stopTTS])

  // 확인 (텍스트 전송)
  const handleConfirm = useCallback(() => {
    const text = finalTranscript.trim()
    if (!text || !onConfirm) return

    voiceRecorderRef.current?.stopRecording()
    audioLevelMonitor.stopMonitoring()
    stopTTS()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    onConfirm(text)
  }, [finalTranscript, onConfirm, audioLevelMonitor, stopTTS])

  // 유사도 색상
  const getSimilarityColor = (val: number): string => {
    if (val >= 80) return 'text-green-600'
    if (val >= 50) return 'text-yellow-600'
    return 'text-red-500'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 반투명 배경 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl shadow-xl pb-8 animate-slide-up">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#d5d5d5] rounded-full" />
        </div>

        {/* 목표 텍스트 (targetText가 있을 때만) */}
        {targetText && (
          <>
            <div className="px-6 pb-4">
              <p className="text-xs text-[#8a8a8a] mb-2">목표 문장</p>
              <div className="flex items-start gap-2">
                <p className="text-lg text-[#1a1a1a] font-light leading-relaxed flex-1">{targetText}</p>
                <button
                  onClick={playTargetAudio}
                  disabled={isSpeaking}
                  className="p-2 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mx-6 border-t border-[#f0f0f0]" />
          </>
        )}

        {/* 인식 결과 영역 */}
        <div className="px-6 pt-4 pb-2">
          {status === 'idle' && (
            <p className="text-sm text-[#c5c5c5] text-center py-4">
              {targetText ? '녹음 버튼을 눌러 따라 읽어보세요' : '녹음 버튼을 눌러 말해보세요'}
            </p>
          )}

          {status === 'listening' && (
            <div className="text-center py-3">
              {/* Lottie 웨이브 애니메이션 */}
              <div className="flex justify-center mb-2">
                <Lottie
                  animationData={recAnimation}
                  loop
                  autoplay
                  style={{ width: 800, height: 240 }}
                />
              </div>
              <p className="text-sm text-[#8a8a8a] animate-pulse">
                {interimTranscript || '듣고 있습니다...'}
              </p>
            </div>
          )}

          {status === 'result' && (
            <div className="space-y-3">
              {/* 수정 가능한 텍스트 입력 */}
              <input
                type="text"
                value={finalTranscript}
                onChange={(e) => {
                  setFinalTranscript(e.target.value)
                  // 입력값 변경 시 유사도 재계산
                  if (targetText) {
                    const sim = calculateSimilarity(targetText, e.target.value)
                    setSimilarity(sim)
                  }
                }}
                className="w-full px-4 py-3 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              />

              {/* 유사도 표시 (targetText가 있을 때만) */}
              {targetText && (
                <p className={`text-sm ${getSimilarityColor(similarity)}`}>
                  일치율 {similarity}%
                </p>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="px-6 pt-2 flex items-center justify-center gap-3">
          {status === 'idle' && (
            <button
              onClick={handleMicClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm hover:bg-[#333] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              녹음
            </button>
          )}

          {status === 'listening' && (
            <button
              onClick={handleMicClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              중지
            </button>
          )}

          {status === 'result' && (
            <>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] text-[#1a1a1a] border border-[#e5e5e5] rounded-full text-sm hover:bg-[#eee] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                다시
              </button>
              {onConfirm ? (
                <button
                  onClick={handleConfirm}
                  disabled={!finalTranscript.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  확인
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm hover:bg-[#333] transition-colors"
                >
                  닫기
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hidden VoiceRecorder */}
      <div className="hidden">
        <VoiceRecorder
          ref={voiceRecorderRef}
          onResult={handleVoiceResult}
          onInterimResult={handleInterimResult}
          onRecordingChange={handleRecordingChange}
          onStreamReady={handleStreamReady}
        />
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
