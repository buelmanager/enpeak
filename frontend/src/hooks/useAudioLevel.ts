'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface UseAudioLevelOptions {
  silenceThreshold?: number // 무음 판정 레벨 (0~1, default 0.01)
  silenceTimeoutMs?: number // 무음 경고까지 시간 (default 3000)
  noiseThreshold?: number // 과도한 소음 레벨 (0~1, default 0.8)
}

interface UseAudioLevelReturn {
  audioLevel: number // 0~1 정규화된 오디오 레벨
  isSilent: boolean // 무음 상태 지속 중
  isNoisy: boolean // 과도한 배경 소음
  silenceWarning: string | null
  startMonitoring: (stream?: MediaStream) => Promise<boolean>
  stopMonitoring: () => void
}

export function useAudioLevel(options?: UseAudioLevelOptions): UseAudioLevelReturn {
  const {
    silenceThreshold = 0.01,
    silenceTimeoutMs = 3000,
    noiseThreshold = 0.8,
  } = options || {}

  const [audioLevel, setAudioLevel] = useState(0)
  const [isSilent, setIsSilent] = useState(false)
  const [isNoisy, setIsNoisy] = useState(false)
  const [silenceWarning, setSilenceWarning] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const silenceStartRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ownStreamRef = useRef(false) // 직접 생성한 스트림인지 추적

  const analyze = useCallback(() => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.fftSize)
    analyser.getByteTimeDomainData(dataArray)

    // RMS 계산으로 오디오 레벨 구하기
    let sumSquares = 0
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128
      sumSquares += normalized * normalized
    }
    const rms = Math.sqrt(sumSquares / dataArray.length)
    const level = Math.min(1, rms * 3) // 스케일링하여 0~1 범위

    setAudioLevel(level)

    // 무음 감지
    if (level < silenceThreshold) {
      if (!silenceStartRef.current) {
        silenceStartRef.current = Date.now()
      } else if (Date.now() - silenceStartRef.current > silenceTimeoutMs) {
        setIsSilent(true)
        setSilenceWarning('마이크에 가까이 말씀해주세요')
      }
    } else {
      silenceStartRef.current = null
      setIsSilent(false)
      setSilenceWarning(null)
    }

    // 소음 감지
    if (level > noiseThreshold) {
      setIsNoisy(true)
      setSilenceWarning('조용한 곳에서 시도해주세요')
    } else if (level < noiseThreshold * 0.7) {
      setIsNoisy(false)
      if (!isSilent) {
        setSilenceWarning(null)
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyze)
  }, [silenceThreshold, silenceTimeoutMs, noiseThreshold, isSilent])

  const startMonitoring = useCallback(async (existingStream?: MediaStream): Promise<boolean> => {
    try {
      let stream = existingStream

      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        ownStreamRef.current = true
      } else {
        ownStreamRef.current = false
      }

      streamRef.current = stream

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.3

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source

      silenceStartRef.current = null
      setIsSilent(false)
      setIsNoisy(false)
      setSilenceWarning(null)

      // 분석 루프 시작
      animationFrameRef.current = requestAnimationFrame(analyze)
      console.log('[AudioLevel] Monitoring started')
      return true
    } catch (e) {
      console.error('[AudioLevel] Failed to start monitoring:', e)
      return false
    }
  }, [analyze])

  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // 직접 생성한 스트림만 정리
    if (ownStreamRef.current && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    streamRef.current = null

    analyserRef.current = null
    setAudioLevel(0)
    setIsSilent(false)
    setIsNoisy(false)
    setSilenceWarning(null)
    silenceStartRef.current = null
    console.log('[AudioLevel] Monitoring stopped')
  }, [])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [stopMonitoring])

  return {
    audioLevel,
    isSilent,
    isNoisy,
    silenceWarning,
    startMonitoring,
    stopMonitoring,
  }
}
