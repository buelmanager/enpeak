'use client'

import { useRef, useState, useCallback } from 'react'

interface UseAudioRecorderOptions {
  mimeType?: string
}

interface UseAudioRecorderReturn {
  isRecording: boolean
  startRecording: (existingStream?: MediaStream) => Promise<boolean>
  stopRecording: () => Promise<Blob | null>
  getAudioBlob: () => Blob | null
  isSupported: boolean
}

/**
 * MediaRecorder 래퍼 훅
 * Web Speech API와 동시에 오디오를 녹음하여
 * 폴백 시 백엔드 Whisper에 전송할 오디오 데이터 확보
 */
export function useAudioRecorder(options?: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioBlobRef = useRef<Blob | null>(null)
  const ownStreamRef = useRef(false)

  const isSupported = typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined'

  const getMimeType = useCallback(() => {
    if (options?.mimeType) return options.mimeType
    // 브라우저별 지원 mimeType 확인
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
    return ''
  }, [options?.mimeType])

  const startRecording = useCallback(async (existingStream?: MediaStream): Promise<boolean> => {
    if (!isSupported) return false

    try {
      let stream: MediaStream
      if (existingStream) {
        stream = existingStream
        ownStreamRef.current = false
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        ownStreamRef.current = true
      }

      streamRef.current = stream
      chunksRef.current = []
      audioBlobRef.current = null

      const mimeType = getMimeType()
      const recorderOptions: MediaRecorderOptions = {}
      if (mimeType) recorderOptions.mimeType = mimeType

      const recorder = new MediaRecorder(stream, recorderOptions)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const mType = recorder.mimeType || 'audio/webm'
        audioBlobRef.current = new Blob(chunksRef.current, { type: mType })
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      console.log('[AudioRecorder] Started recording, mimeType:', mimeType || 'default')
      return true
    } catch (e) {
      console.error('[AudioRecorder] Failed to start:', e)
      return false
    }
  }, [isSupported, getMimeType])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false)
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const mType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mType })
        audioBlobRef.current = blob
        console.log('[AudioRecorder] Stopped, blob size:', blob.size)
        setIsRecording(false)

        // 직접 생성한 스트림만 정리
        if (ownStreamRef.current && streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        streamRef.current = null

        resolve(blob)
      }

      recorder.stop()
    })
  }, [])

  const getAudioBlob = useCallback(() => {
    return audioBlobRef.current
  }, [])

  return {
    isRecording,
    startRecording,
    stopRecording,
    getAudioBlob,
    isSupported,
  }
}
