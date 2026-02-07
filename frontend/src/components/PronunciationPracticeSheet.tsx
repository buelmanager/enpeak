'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import VoiceRecorder, { VoiceRecorderRef, STTResultMetadata } from './VoiceRecorder'
import { useTTS } from '@/contexts/TTSContext'
import { useAudioLevel } from '@/hooks/useAudioLevel'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })
import recAnimation from '../../public/rec.json'

type PracticeMode = 'full' | 'blank'
type Status = 'idle' | 'listening' | 'result'

interface PronunciationPracticeSheetProps {
  isOpen: boolean
  onClose: () => void
  targetText: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Stop words - 빈칸에서 제외할 기능어
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them',
  'his', 'her', 'its', 'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'must',
  'and', 'or', 'but', 'if', 'so', 'yet', 'for', 'nor',
  'in', 'on', 'at', 'to', 'of', 'by', 'up', 'as', 'from', 'with', 'into',
  'that', 'this', 'these', 'those', 'what', 'which', 'who', 'whom',
  'not', 'no', 'just', 'very', 'too', 'also', 'then', 'than',
  'here', 'there', 'when', 'where', 'how', 'all', 'each', 'every',
  "don't", "doesn't", "didn't", "won't", "wouldn't", "couldn't", "shouldn't",
  "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't",
  "i'm", "i've", "i'll", "i'd", "you're", "you've", "you'll", "you'd",
  "he's", "she's", "it's", "we're", "we've", "we'll", "they're", "they've", "they'll",
  "let's", "that's", "there's", "here's", "what's", "who's",
])

// 텍스트 정규화 (비교용)
function normalizeWord(s: string): string {
  return s.toLowerCase().replace(/[.,!?;:'"()\-]/g, '').trim()
}

// 빈칸 대상 단어 인덱스 선택 (~35% content words)
function selectBlankIndices(words: string[]): Set<number> {
  const contentIndices: number[] = []
  for (let i = 0; i < words.length; i++) {
    const norm = normalizeWord(words[i])
    if (norm.length > 0 && !STOP_WORDS.has(norm)) {
      contentIndices.push(i)
    }
  }

  const blankCount = Math.max(1, Math.round(contentIndices.length * 0.35))

  // 균등 분포 선택
  const selected = new Set<number>()
  if (contentIndices.length <= blankCount) {
    contentIndices.forEach(i => selected.add(i))
  } else {
    const step = contentIndices.length / blankCount
    for (let i = 0; i < blankCount; i++) {
      selected.add(contentIndices[Math.floor(i * step)])
    }
  }

  return selected
}

// 단어별 비교 결과
interface WordResult {
  word: string
  correct: boolean
  isBlank?: boolean
}

// Levenshtein 거리 (퍼지 매칭용)
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function compareWords(targetWords: string[], spokenText: string, blankIndices?: Set<number>): { results: WordResult[]; score: number } {
  const spokenWords = spokenText.toLowerCase().replace(/[.,!?;:'"()\-]/g, '').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0)

  const results: WordResult[] = []
  let matchCount = 0
  let totalScored = 0

  // 순서 기반 매칭: spoken 단어를 순차적으로 소비
  let spokenIdx = 0
  for (let i = 0; i < targetWords.length; i++) {
    const targetNorm = normalizeWord(targetWords[i])
    if (targetNorm.length === 0) continue

    const isBlank = blankIndices?.has(i) ?? false
    const shouldScore = blankIndices ? isBlank : true

    // 현재 spoken 위치부터 가장 가까운 매칭 검색 (최대 2칸 앞까지)
    let matched = false
    for (let j = spokenIdx; j < Math.min(spokenIdx + 3, spokenWords.length); j++) {
      const spokenNorm = spokenWords[j]
      // 정확 매칭 또는 퍼지 매칭 (Levenshtein 거리 <= 1, 3글자 이상 단어)
      if (spokenNorm === targetNorm || (targetNorm.length >= 3 && levenshtein(spokenNorm, targetNorm) <= 1)) {
        matched = true
        spokenIdx = j + 1
        break
      }
    }

    results.push({
      word: targetWords[i],
      correct: matched,
      isBlank,
    })

    if (shouldScore) {
      totalScored++
      if (matched) matchCount++
    }
  }

  const score = totalScored > 0 ? Math.round((matchCount / totalScored) * 100) : 0
  return { results, score }
}

// 점수별 피드백 메시지
function getFeedbackMessage(score: number): string {
  if (score >= 90) return '훌륭해요! 완벽에 가까운 발음이에요.'
  if (score >= 70) return '잘했어요! 조금만 더 연습하면 완벽해요.'
  if (score >= 50) return '좋은 시도예요! 다시 들어보고 연습해보세요.'
  return '다시 도전해보세요! 천천히 따라 읽어보세요.'
}

export default function PronunciationPracticeSheet({ isOpen, onClose, targetText }: PronunciationPracticeSheetProps) {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('full')
  const [status, setStatus] = useState<Status>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [wordResults, setWordResults] = useState<WordResult[]>([])
  const [score, setScore] = useState(0)
  const [translation, setTranslation] = useState<string | null>(null)

  const voiceRecorderRef = useRef<VoiceRecorderRef>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { speakWithCallback, stop: stopTTS, isSpeaking } = useTTS()
  const audioLevelMonitor = useAudioLevel()

  // 단어 분리 (targetText 변경 시만 재계산)
  const targetWords = useMemo(() => targetText.split(/\s+/).filter(w => w.length > 0), [targetText])
  const blankIndices = useMemo(() => selectBlankIndices(targetWords), [targetWords])

  // 시트 열릴 때 상태 리셋 + 번역 로드
  useEffect(() => {
    if (!isOpen) {
      voiceRecorderRef.current?.stopRecording()
      audioLevelMonitor.stopMonitoring()
      stopTTS()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      return
    }

    setStatus('idle')
    setInterimTranscript('')
    setWordResults([])
    setScore(0)
    setPracticeMode('full')

    const controller = new AbortController()
    const loadTranslation = async () => {
      try {
        const encodedText = encodeURIComponent(targetText)
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ko`,
          { signal: controller.signal }
        )
        if (response.ok) {
          const data = await response.json()
          if (data.responseStatus === 200 && data.responseData?.translatedText) {
            setTranslation(data.responseData.translatedText)
            return
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }

      try {
        const backendResponse = await fetch(`${API_BASE}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: targetText, target_lang: 'ko' }),
          signal: controller.signal,
        })
        if (backendResponse.ok) {
          const data = await backendResponse.json()
          setTranslation(data.translation)
        }
      } catch {
        // 번역 실패 - 무시
      }
    }

    loadTranslation()
    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetText])

  // TTS 재생
  const playTargetAudio = useCallback(() => {
    speakWithCallback(targetText)
  }, [targetText, speakWithCallback])

  // 녹음 시작/중지
  const handleRecord = useCallback(() => {
    if (status === 'listening') {
      voiceRecorderRef.current?.stopRecording()
      return
    }

    setStatus('listening')
    setInterimTranscript('')
    setWordResults([])
    setScore(0)
    stopTTS()
    voiceRecorderRef.current?.startRecording()
  }, [status, stopTTS])

  // STT 결과 처리
  const handleVoiceResult = useCallback((text: string, _metadata?: STTResultMetadata) => {
    const blanks = practiceMode === 'blank' ? blankIndices : undefined
    const { results, score: calcScore } = compareWords(targetWords, text, blanks)

    setWordResults(results)
    setScore(calcScore)
    setStatus('result')

    audioLevelMonitor.stopMonitoring()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [targetWords, blankIndices, practiceMode, audioLevelMonitor])

  // 중간 결과
  const handleInterimResult = useCallback((text: string) => {
    setInterimTranscript(text)
  }, [])

  // 스트림 준비
  const handleStreamReady = useCallback((stream: MediaStream) => {
    streamRef.current = stream
    audioLevelMonitor.startMonitoring(stream)
  }, [audioLevelMonitor])

  // 녹음 상태 변경 - VoiceRecorder에서 녹음이 끝나면 status를 idle로 복원
  const handleRecordingChange = useCallback((recording: boolean) => {
    if (!recording) {
      setStatus(prev => prev === 'listening' ? 'idle' : prev)
      audioLevelMonitor.stopMonitoring()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [audioLevelMonitor])

  // 다시 시도
  const handleRetry = useCallback(() => {
    setInterimTranscript('')
    setWordResults([])
    setScore(0)
    setStatus('idle')
  }, [])

  // 닫기
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

  // 모드 전환
  const handleModeChange = useCallback((mode: PracticeMode) => {
    setPracticeMode(mode)
    setStatus('idle')
    setInterimTranscript('')
    setWordResults([])
    setScore(0)
  }, [])

  // 단어 렌더링 (문장 표시)
  const renderTargetSentence = () => {
    return (
      <p className="text-xl text-[#1a1a1a] font-semibold leading-relaxed">
        {targetWords.map((word, idx) => {
          const isBlank = blankIndices.has(idx)

          // 결과 상태: 하이라이트
          if (status === 'result' && wordResults.length > 0) {
            const result = wordResults[idx]
            if (result) {
              const colorClass = result.correct ? 'text-green-600' : 'text-red-500'
              return (
                <span key={idx}>
                  <span className={`${colorClass} font-bold`}>{word}</span>
                  {idx < targetWords.length - 1 ? ' ' : ''}
                </span>
              )
            }
          }

          // blank 모드에서 빈칸 표시
          if (practiceMode === 'blank' && isBlank && status !== 'result') {
            const underscores = '\u00A0'.repeat(Math.max(word.length, 4))
            return (
              <span key={idx}>
                <span className="border-b-2 border-[#1a1a1a] text-transparent select-none">{underscores}</span>
                {idx < targetWords.length - 1 ? ' ' : ''}
              </span>
            )
          }

          return (
            <span key={idx}>
              {word}
              {idx < targetWords.length - 1 ? ' ' : ''}
            </span>
          )
        })}
      </p>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 반투명 배경 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl pb-6 animate-popup">
        {/* 닫기 버튼 */}
        <div className="flex justify-end pt-3 pr-3">
          <button
            onClick={handleClose}
            className="p-1.5 text-[#c5c5c5] hover:text-[#1a1a1a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 모드 탭 */}
        <div className="flex mx-6 mb-4 bg-[#f5f5f5] rounded-lg p-1">
          <button
            onClick={() => handleModeChange('full')}
            className={`flex-1 py-2 text-base rounded-md transition-colors ${
              practiceMode === 'full'
                ? 'bg-white text-[#1a1a1a] shadow-sm font-medium'
                : 'text-[#8a8a8a]'
            }`}
          >
            전체 문장
          </button>
          <button
            onClick={() => handleModeChange('blank')}
            className={`flex-1 py-2 text-base rounded-md transition-colors ${
              practiceMode === 'blank'
                ? 'bg-white text-[#1a1a1a] shadow-sm font-medium'
                : 'text-[#8a8a8a]'
            }`}
          >
            빈칸 채우기
          </button>
        </div>

        {/* 문장 표시 */}
        <div className="px-6 pb-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {renderTargetSentence()}
            </div>
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

          {/* 한국어 번역 */}
          {translation && (
            <p className="text-sm text-[#8a8a8a] mt-2">{translation}</p>
          )}
        </div>

        <div className="mx-6 border-t border-[#f0f0f0]" />

        {/* 녹음/결과 영역 */}
        <div className="px-6 pt-4 pb-2">
          {status === 'idle' && (
            <p className="text-base text-[#c5c5c5] text-center py-4">
              {practiceMode === 'full'
                ? '녹음 버튼을 눌러 따라 읽어보세요'
                : '빈칸 단어를 포함하여 전체 문장을 읽어보세요'}
            </p>
          )}

          {status === 'listening' && (
            <div className="text-center py-3">
              <div className="flex justify-center mb-2">
                <Lottie
                  animationData={recAnimation}
                  loop
                  autoplay
                  style={{ width: 800, height: 240 }}
                />
              </div>
              <p className="text-base text-[#8a8a8a] animate-pulse">
                {interimTranscript || '듣고 있습니다...'}
              </p>
            </div>
          )}

          {status === 'result' && (
            <div className="space-y-3 text-center">
              {/* 점수 */}
              <div>
                <span className={`text-4xl font-bold ${
                  score >= 90 ? 'text-green-600' :
                  score >= 70 ? 'text-green-500' :
                  score >= 50 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {score}
                </span>
                <span className="text-lg text-[#8a8a8a] ml-1">점</span>
              </div>
              {/* 피드백 */}
              <p className="text-base font-medium text-[#666]">{getFeedbackMessage(score)}</p>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="px-6 pt-2 flex items-center justify-center gap-3">
          {status === 'idle' && (
            <>
              <button
                onClick={playTargetAudio}
                disabled={isSpeaking}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] text-[#1a1a1a] border border-[#e5e5e5] rounded-full text-base font-medium hover:bg-[#eee] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                듣기
              </button>
              <button
                onClick={handleRecord}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] text-white rounded-full text-base font-medium hover:bg-[#0F766E] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                녹음
              </button>
            </>
          )}

          {status === 'listening' && (
            <button
              onClick={handleRecord}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-full text-base font-medium hover:bg-red-600 transition-colors"
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
                onClick={playTargetAudio}
                disabled={isSpeaking}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] text-[#1a1a1a] border border-[#e5e5e5] rounded-full text-base font-medium hover:bg-[#eee] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                듣기
              </button>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] text-white rounded-full text-base font-medium hover:bg-[#0F766E] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시하기
              </button>
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

      {/* Popup animation */}
      <style jsx>{`
        @keyframes popup {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-popup {
          animation: popup 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
