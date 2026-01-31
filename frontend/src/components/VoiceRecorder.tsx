'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'

interface VoiceRecorderProps {
  onResult: (text: string) => void
  disabled?: boolean
  autoStart?: boolean
  onRecordingChange?: (isRecording: boolean) => void
}

export interface VoiceRecorderRef {
  startRecording: () => void
  stopRecording: () => void
  isRecording: boolean
}

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(
  ({ onResult, disabled, autoStart, onRecordingChange }, ref) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
      // Web Speech API 지원 확인
      if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
          setIsSupported(false)
          return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onResult(transcript)
          setIsRecording(false)
          onRecordingChange?.(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
          onRecordingChange?.(false)
        }

        recognition.onend = () => {
          setIsRecording(false)
          onRecordingChange?.(false)
        }

        recognitionRef.current = recognition
      }
    }, [onResult, onRecordingChange])

    // 외부에서 녹음 제어 가능하도록
    useImperativeHandle(ref, () => ({
      startRecording: () => {
        if (recognitionRef.current && !isRecording && !disabled) {
          try {
            recognitionRef.current.start()
            setIsRecording(true)
            onRecordingChange?.(true)
          } catch (e) {
            console.error('Failed to start recording:', e)
          }
        }
      },
      stopRecording: () => {
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop()
          setIsRecording(false)
          onRecordingChange?.(false)
        }
      },
      isRecording,
    }))

    // autoStart prop으로 자동 녹음 시작
    useEffect(() => {
      if (autoStart && recognitionRef.current && !isRecording && !disabled) {
        try {
          recognitionRef.current.start()
          setIsRecording(true)
          onRecordingChange?.(true)
        } catch (e) {
          console.error('Failed to auto-start recording:', e)
        }
      }
    }, [autoStart, disabled])

    const toggleRecording = () => {
      if (!recognitionRef.current) return

      if (isRecording) {
        recognitionRef.current.stop()
        setIsRecording(false)
        onRecordingChange?.(false)
      } else {
        try {
          recognitionRef.current.start()
          setIsRecording(true)
          onRecordingChange?.(true)
        } catch (e) {
          console.error('Failed to start recording:', e)
        }
      }
    }

    if (!isSupported) {
      return null // 음성 인식 미지원 시 버튼 숨김
    }

    return (
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-white border border-[#e5e5e5] text-[#8a8a8a] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
        } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        title={isRecording ? '녹음 중지' : '음성 입력'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>
    )
  }
)

VoiceRecorder.displayName = 'VoiceRecorder'

export default VoiceRecorder
