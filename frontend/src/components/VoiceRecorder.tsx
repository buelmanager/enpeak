'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'

export interface STTAlternative {
  transcript: string
  confidence: number
}

export interface STTResultMetadata {
  confidence: number
  alternatives: STTAlternative[]
}

interface VoiceRecorderProps {
  onResult: (text: string, metadata?: STTResultMetadata) => void
  onInterimResult?: (text: string) => void
  onError?: (type: string, message: string) => void
  onStreamReady?: (stream: MediaStream) => void
  disabled?: boolean
  autoStart?: boolean
  onRecordingChange?: (isRecording: boolean) => void
  lang?: string
}

export interface VoiceRecorderRef {
  startRecording: () => void
  stopRecording: () => void
  isRecording: boolean
}

const MAX_NO_SPEECH_RETRIES = 2
// continuous 모드에서 발화 종료 판단을 위한 silence timeout (ms)
const SILENCE_TIMEOUT_MS = 2000

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(
  ({ onResult, onInterimResult, onError, onStreamReady, disabled, autoStart, onRecordingChange, lang = 'en-US' }, ref) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const [permissionDenied, setPermissionDenied] = useState(false)
    const recognitionRef = useRef<any>(null)
    const retryCountRef = useRef(0)
    const manualStopRef = useRef(false)
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    // 마이크 권한이 이미 확보되었는지 (첫 getUserMedia 성공 후)
    const permissionGrantedRef = useRef(false)
    // continuous 모드: 누적 transcript + silence 타이머
    const accumulatedTranscriptRef = useRef('')
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastResultIndexRef = useRef(0)

    // 콜백을 ref로 저장하여 useEffect 재실행 방지
    const onResultRef = useRef(onResult)
    const onInterimResultRef = useRef(onInterimResult)
    const onRecordingChangeRef = useRef(onRecordingChange)
    const onErrorRef = useRef(onError)
    const onStreamReadyRef = useRef(onStreamReady)
    useEffect(() => { onResultRef.current = onResult }, [onResult])
    useEffect(() => { onInterimResultRef.current = onInterimResult }, [onInterimResult])
    useEffect(() => { onRecordingChangeRef.current = onRecordingChange }, [onRecordingChange])
    useEffect(() => { onErrorRef.current = onError }, [onError])
    useEffect(() => { onStreamReadyRef.current = onStreamReady }, [onStreamReady])

    // silence timeout 후 최종 결과를 전달하고 녹음 종료
    const finishRecording = useCallback(() => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }

      const transcript = accumulatedTranscriptRef.current.trim()
      if (transcript.length > 0) {
        const metadata: STTResultMetadata = {
          confidence: 0,
          alternatives: [{ transcript, confidence: 0 }],
        }
        onResultRef.current(transcript, metadata)
      }

      accumulatedTranscriptRef.current = ''
      lastResultIndexRef.current = 0

      // recognition 정지
      if (recognitionRef.current) {
        manualStopRef.current = true
        try {
          recognitionRef.current.stop()
        } catch {
          // already stopped
        }
      }

      setIsRecording(false)
      onRecordingChangeRef.current?.(false)
    }, [])

    // silence 타이머 리셋 (발화 감지 시마다 호출)
    const resetSilenceTimer = useCallback(() => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      silenceTimerRef.current = setTimeout(() => {
        silenceTimerRef.current = null
        finishRecording()
      }, SILENCE_TIMEOUT_MS)
    }, [finishRecording])

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
          setIsSupported(false)
          return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = lang
        recognition.maxAlternatives = 3

        recognition.onresult = (event: any) => {
          retryCountRef.current = 0

          // 모든 결과를 조합 (final + interim)
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
            } else {
              interimTranscript += result[0].transcript
            }
          }

          accumulatedTranscriptRef.current = finalTranscript

          // interim을 포함한 전체 텍스트를 실시간 표시
          const displayText = (finalTranscript + interimTranscript).trim()
          if (displayText) {
            onInterimResultRef.current?.(displayText)
          }

          // 발화 감지 시 silence 타이머 리셋
          resetSilenceTimer()
        }

        recognition.onerror = (event: any) => {
          const errorType = event.error as string

          // abort()에 의한 정상 종료 - 에러 처리 불필요
          if (errorType === 'aborted') {
            return
          }

          console.error('[STT] Recognition error:', errorType)

          switch (errorType) {
            case 'no-speech':
              if (retryCountRef.current < MAX_NO_SPEECH_RETRIES) {
                retryCountRef.current++
                retryTimeoutRef.current = setTimeout(() => {
                  retryTimeoutRef.current = null
                  if (manualStopRef.current) return
                  try {
                    recognition.start()
                  } catch (e) {
                    console.error('[STT] Retry start failed:', e)
                    setIsRecording(false)
                    onRecordingChangeRef.current?.(false)
                  }
                }, 300)
                return
              }
              retryCountRef.current = 0
              onErrorRef.current?.('no-speech', '말씀을 듣지 못했어요. 다시 시도해주세요.')
              break

            case 'network':
              onErrorRef.current?.('network', '네트워크 오류가 발생했어요.')
              break

            case 'audio-capture':
              setPermissionDenied(true)
              permissionGrantedRef.current = false
              onErrorRef.current?.('audio-capture', '마이크를 사용할 수 없어요. 브라우저 설정에서 마이크 권한을 확인해주세요.')
              break

            case 'not-allowed':
              setPermissionDenied(true)
              permissionGrantedRef.current = false
              onErrorRef.current?.('not-allowed', '마이크 권한이 차단되어 있어요. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크를 허용해주세요.')
              break

            default:
              onErrorRef.current?.(errorType, '음성 인식 오류가 발생했어요.')
              break
          }

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
          }
          accumulatedTranscriptRef.current = ''
          lastResultIndexRef.current = 0
          setIsRecording(false)
          onRecordingChangeRef.current?.(false)
        }

        recognition.onend = () => {
          // no-speech 재시도 중이면 무시
          if (retryCountRef.current > 0 && retryCountRef.current <= MAX_NO_SPEECH_RETRIES) {
            return
          }
          // manualStop이 아닌 예상치 못한 종료: 아직 녹음 중이면 재시작
          if (!manualStopRef.current && accumulatedTranscriptRef.current.trim().length === 0) {
            // 누적된 텍스트 없이 끝남 - 그냥 종료
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current)
              silenceTimerRef.current = null
            }
            setIsRecording(false)
            onRecordingChangeRef.current?.(false)
            return
          }
          if (!manualStopRef.current) {
            // continuous 모드에서 브라우저가 자체적으로 끊는 경우 재시작
            try {
              recognition.start()
              return
            } catch {
              // 재시작 실패 시 현재까지 누적된 결과 전달
            }
          }
          // 수동 중지이거나 재시작 실패: 결과 처리는 finishRecording/stopRecording에서 담당
        }

        recognitionRef.current = recognition
      }

      return () => {
        // unmount 시 SpeechRecognition 정리
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort()
          } catch {
            // already stopped
          }
          recognitionRef.current = null
        }
        accumulatedTranscriptRef.current = ''
        lastResultIndexRef.current = 0
      }
    }, [lang, resetSilenceTimer])

    // getUserMedia로 먼저 권한 확보 후 recognition 시작
    // -> 권한 프롬프트가 1회만 뜸 (Safari 대응)
    const startWithPermission = async () => {
      if (!recognitionRef.current) return false

      try {
        // 이미 권한이 확보된 경우 바로 시작
        if (permissionGrantedRef.current) {
          recognitionRef.current.start()
          return true
        }

        // getUserMedia로 권한 확보 (프롬프트 1회)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

        permissionGrantedRef.current = true
        setPermissionDenied(false)

        // 스트림을 부모에게 전달 (audioRecorder/audioLevel용)
        onStreamReadyRef.current?.(stream)

        // recognition 시작 (권한이 이미 캐시되어 프롬프트 안 뜸)
        recognitionRef.current.start()
        return true
      } catch (e) {
        console.error('[STT] Permission denied:', e)
        setPermissionDenied(true)
        permissionGrantedRef.current = false
        onErrorRef.current?.('not-allowed', '마이크 권한이 차단되어 있어요. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크를 허용해주세요.')
        return false
      }
    }

    const isBlocked = disabled || permissionDenied

    useImperativeHandle(ref, () => ({
      startRecording: async () => {
        if (!recognitionRef.current || isRecording || isBlocked) return

        manualStopRef.current = false
        retryCountRef.current = 0
        accumulatedTranscriptRef.current = ''
        lastResultIndexRef.current = 0
        const started = await startWithPermission()
        if (started) {
          setIsRecording(true)
          onRecordingChangeRef.current?.(true)
        }
      },
      stopRecording: () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }

        // 누적된 텍스트가 있으면 결과 전달
        const transcript = accumulatedTranscriptRef.current.trim()
        if (transcript.length > 0) {
          const metadata: STTResultMetadata = {
            confidence: 0,
            alternatives: [{ transcript, confidence: 0 }],
          }
          onResultRef.current(transcript, metadata)
        }
        accumulatedTranscriptRef.current = ''
        lastResultIndexRef.current = 0

        if (recognitionRef.current) {
          manualStopRef.current = true
          retryCountRef.current = 0
          try {
            recognitionRef.current.abort()
          } catch {
            // already stopped
          }
        }
        setIsRecording(false)
        onRecordingChangeRef.current?.(false)
      },
      isRecording,
    }))

    // autoStart prop으로 자동 녹음 시작
    useEffect(() => {
      if (autoStart && recognitionRef.current && !isRecording && !isBlocked) {
        (async () => {
          manualStopRef.current = false
          retryCountRef.current = 0
          accumulatedTranscriptRef.current = ''
          lastResultIndexRef.current = 0
          const started = await startWithPermission()
          if (started) {
            setIsRecording(true)
            onRecordingChangeRef.current?.(true)
          }
        })()
      }
    }, [autoStart, isBlocked])

    const toggleRecording = async () => {
      if (!recognitionRef.current) return

      if (isRecording) {
        // 수동 중지: 누적된 텍스트 결과 전달
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }

        const transcript = accumulatedTranscriptRef.current.trim()
        if (transcript.length > 0) {
          const metadata: STTResultMetadata = {
            confidence: 0,
            alternatives: [{ transcript, confidence: 0 }],
          }
          onResultRef.current(transcript, metadata)
        }
        accumulatedTranscriptRef.current = ''
        lastResultIndexRef.current = 0

        manualStopRef.current = true
        retryCountRef.current = 0
        try {
          recognitionRef.current.stop()
        } catch {
          // already stopped
        }
        setIsRecording(false)
        onRecordingChangeRef.current?.(false)
      } else {
        // 권한 차단 상태에서도 재시도 가능
        if (permissionDenied) {
          setPermissionDenied(false)
        }

        manualStopRef.current = false
        retryCountRef.current = 0
        accumulatedTranscriptRef.current = ''
        lastResultIndexRef.current = 0
        const started = await startWithPermission()
        if (started) {
          setIsRecording(true)
          onRecordingChangeRef.current?.(true)
        }
      }
    }

    if (!isSupported) {
      return null
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : permissionDenied
                ? 'bg-white border border-red-300 text-red-400 hover:border-red-500 hover:text-red-500'
                : 'bg-white border border-[#e5e5e5] text-[#8a8a8a] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
          } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          title={
            permissionDenied
              ? '마이크 권한이 필요합니다 (탭하여 재시도)'
              : isRecording ? '녹음 중지' : '음성 입력'
          }
        >
          {permissionDenied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>
        {permissionDenied && (
          <p className="text-xs text-red-400 text-center max-w-[200px]">
            탭하여 다시 시도
          </p>
        )}
      </div>
    )
  }
)

VoiceRecorder.displayName = 'VoiceRecorder'

export default VoiceRecorder
