'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'

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

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(
  ({ onResult, onInterimResult, onError, onStreamReady, disabled, autoStart, onRecordingChange, lang = 'en-US' }, ref) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const [permissionDenied, setPermissionDenied] = useState(false)
    const recognitionRef = useRef<any>(null)
    const retryCountRef = useRef(0)
    const manualStopRef = useRef(false)
    // 마이크 권한이 이미 확보되었는지 (첫 getUserMedia 성공 후)
    const permissionGrantedRef = useRef(false)

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
          setIsSupported(false)
          return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = lang
        recognition.maxAlternatives = 3

        recognition.onresult = (event: any) => {
          const result = event.results[0]

          if (result.isFinal) {
            retryCountRef.current = 0

            const alternatives: STTAlternative[] = []
            for (let i = 0; i < result.length; i++) {
              alternatives.push({
                transcript: result[i].transcript,
                confidence: result[i].confidence,
              })
            }

            const bestTranscript = result[0].transcript
            const bestConfidence = result[0].confidence

            console.log('[STT] Final result:', bestTranscript)
            console.log('[STT] Confidence:', bestConfidence)
            console.log('[STT] Alternatives:', alternatives.map(a => `${a.transcript} (${a.confidence})`))

            const metadata: STTResultMetadata = {
              confidence: bestConfidence,
              alternatives,
            }

            onResult(bestTranscript, metadata)
            setIsRecording(false)
            onRecordingChange?.(false)
          } else {
            onInterimResult?.(result[0].transcript)
          }
        }

        recognition.onerror = (event: any) => {
          const errorType = event.error as string
          console.error('[STT] Recognition error:', errorType)

          switch (errorType) {
            case 'no-speech':
              if (retryCountRef.current < MAX_NO_SPEECH_RETRIES) {
                retryCountRef.current++
                console.log(`[STT] no-speech retry ${retryCountRef.current}/${MAX_NO_SPEECH_RETRIES}`)
                setTimeout(() => {
                  try {
                    recognition.start()
                  } catch (e) {
                    console.error('[STT] Retry start failed:', e)
                    setIsRecording(false)
                    onRecordingChange?.(false)
                  }
                }, 300)
                return
              }
              retryCountRef.current = 0
              onError?.('no-speech', '말씀을 듣지 못했어요. 다시 시도해주세요.')
              break

            case 'network':
              onError?.('network', '네트워크 오류가 발생했어요.')
              break

            case 'audio-capture':
              setPermissionDenied(true)
              permissionGrantedRef.current = false
              onError?.('audio-capture', '마이크를 사용할 수 없어요. 브라우저 설정에서 마이크 권한을 확인해주세요.')
              break

            case 'not-allowed':
              setPermissionDenied(true)
              permissionGrantedRef.current = false
              onError?.('not-allowed', '마이크 권한이 차단되어 있어요. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크를 허용해주세요.')
              break

            default:
              onError?.(errorType, '음성 인식 오류가 발생했어요.')
              break
          }

          setIsRecording(false)
          onRecordingChange?.(false)
        }

        recognition.onend = () => {
          if (retryCountRef.current > 0 && retryCountRef.current <= MAX_NO_SPEECH_RETRIES) {
            return
          }
          setIsRecording(false)
          onRecordingChange?.(false)
        }

        recognitionRef.current = recognition
      }
    }, [onResult, onInterimResult, onRecordingChange, onError, lang])

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
        onStreamReady?.(stream)

        // recognition 시작 (권한이 이미 캐시되어 프롬프트 안 뜸)
        recognitionRef.current.start()
        return true
      } catch (e) {
        console.error('[STT] Permission denied:', e)
        setPermissionDenied(true)
        permissionGrantedRef.current = false
        onError?.('not-allowed', '마이크 권한이 차단되어 있어요. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크를 허용해주세요.')
        return false
      }
    }

    const isBlocked = disabled || permissionDenied

    useImperativeHandle(ref, () => ({
      startRecording: async () => {
        if (!recognitionRef.current || isRecording || isBlocked) return

        manualStopRef.current = false
        retryCountRef.current = 0
        const started = await startWithPermission()
        if (started) {
          setIsRecording(true)
          onRecordingChange?.(true)
        }
      },
      stopRecording: () => {
        if (recognitionRef.current && isRecording) {
          manualStopRef.current = true
          retryCountRef.current = 0
          recognitionRef.current.stop()
          setIsRecording(false)
          onRecordingChange?.(false)
        }
      },
      isRecording,
    }))

    // autoStart prop으로 자동 녹음 시작
    useEffect(() => {
      if (autoStart && recognitionRef.current && !isRecording && !isBlocked) {
        (async () => {
          manualStopRef.current = false
          retryCountRef.current = 0
          const started = await startWithPermission()
          if (started) {
            setIsRecording(true)
            onRecordingChange?.(true)
          }
        })()
      }
    }, [autoStart, isBlocked])

    const toggleRecording = async () => {
      if (!recognitionRef.current) return

      if (isRecording) {
        manualStopRef.current = true
        retryCountRef.current = 0
        recognitionRef.current.stop()
        setIsRecording(false)
        onRecordingChange?.(false)
      } else {
        // 권한 차단 상태에서도 재시도 가능
        if (permissionDenied) {
          setPermissionDenied(false)
        }

        manualStopRef.current = false
        retryCountRef.current = 0
        const started = await startWithPermission()
        if (started) {
          setIsRecording(true)
          onRecordingChange?.(true)
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
