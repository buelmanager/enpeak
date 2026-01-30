'use client'

import { useState } from 'react'
import { useTTS, TTSVoice } from '@/contexts/TTSContext'

interface TTSSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TTSSettingsModal({ isOpen, onClose }: TTSSettingsModalProps) {
  const { voices, settings, setSettings, speak, isLoaded } = useTTS()
  const [testText] = useState("Hello! How are you today?")

  if (!isOpen) return null

  const handleVoiceChange = (voiceURI: string) => {
    const voice = voices.find(v => v.voiceURI === voiceURI)
    if (voice) {
      setSettings({ ...settings, selectedVoice: voice })
    }
  }

  const handleRateChange = (rate: number) => {
    setSettings({ ...settings, rate })
  }

  const handlePitchChange = (pitch: number) => {
    setSettings({ ...settings, pitch })
  }

  const handleTest = () => {
    speak(testText)
  }

  const femaleVoices = voices.filter(v => v.gender === 'female')
  const maleVoices = voices.filter(v => v.gender === 'male')
  const otherVoices = voices.filter(v => v.gender === 'unknown')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-[90%] max-w-md max-h-[80vh] overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
          <h2 className="font-medium">음성 설정</h2>
          <button onClick={onClose} className="p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-6">
          {!isLoaded ? (
            <div className="text-center py-8 text-[#8a8a8a]">
              <p>음성 로딩 중...</p>
            </div>
          ) : voices.length === 0 ? (
            <div className="text-center py-8 text-[#8a8a8a]">
              <p>사용 가능한 영어 음성이 없습니다.</p>
              <p className="text-xs mt-2">브라우저 설정에서 TTS 음성을 확인해주세요.</p>
            </div>
          ) : (
            <>
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">음성 선택</label>
                <div className="space-y-3">
                  {/* Female Voices */}
                  {femaleVoices.length > 0 && (
                    <div>
                      <p className="text-xs text-[#8a8a8a] mb-2">여성</p>
                      <div className="space-y-1">
                        {femaleVoices.map(voice => (
                          <button
                            key={voice.voiceURI}
                            onClick={() => handleVoiceChange(voice.voiceURI)}
                            className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                              settings.selectedVoice?.voiceURI === voice.voiceURI
                                ? 'bg-[#1a1a1a] text-white'
                                : 'bg-[#f5f5f5] hover:bg-[#e5e5e5]'
                            }`}
                          >
                            <span className="font-medium">{voice.name.split(' ')[0]}</span>
                            <span className="text-xs ml-2 opacity-70">{voice.lang}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Male Voices */}
                  {maleVoices.length > 0 && (
                    <div>
                      <p className="text-xs text-[#8a8a8a] mb-2">남성</p>
                      <div className="space-y-1">
                        {maleVoices.map(voice => (
                          <button
                            key={voice.voiceURI}
                            onClick={() => handleVoiceChange(voice.voiceURI)}
                            className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                              settings.selectedVoice?.voiceURI === voice.voiceURI
                                ? 'bg-[#1a1a1a] text-white'
                                : 'bg-[#f5f5f5] hover:bg-[#e5e5e5]'
                            }`}
                          >
                            <span className="font-medium">{voice.name.split(' ')[0]}</span>
                            <span className="text-xs ml-2 opacity-70">{voice.lang}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Voices */}
                  {otherVoices.length > 0 && (
                    <div>
                      <p className="text-xs text-[#8a8a8a] mb-2">기타</p>
                      <div className="space-y-1">
                        {otherVoices.slice(0, 5).map(voice => (
                          <button
                            key={voice.voiceURI}
                            onClick={() => handleVoiceChange(voice.voiceURI)}
                            className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                              settings.selectedVoice?.voiceURI === voice.voiceURI
                                ? 'bg-[#1a1a1a] text-white'
                                : 'bg-[#f5f5f5] hover:bg-[#e5e5e5]'
                            }`}
                          >
                            <span className="font-medium">{voice.name.split(' ')[0]}</span>
                            <span className="text-xs ml-2 opacity-70">{voice.lang}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Speed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">속도</label>
                  <span className="text-xs text-[#8a8a8a]">{settings.rate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={settings.rate}
                  onChange={e => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#f0f0f0] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                />
                <div className="flex justify-between text-[10px] text-[#c5c5c5] mt-1">
                  <span>느림</span>
                  <span>보통</span>
                  <span>빠름</span>
                </div>
              </div>

              {/* Pitch */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">음높이</label>
                  <span className="text-xs text-[#8a8a8a]">{settings.pitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={settings.pitch}
                  onChange={e => handlePitchChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#f0f0f0] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                />
                <div className="flex justify-between text-[10px] text-[#c5c5c5] mt-1">
                  <span>낮음</span>
                  <span>보통</span>
                  <span>높음</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {isLoaded && voices.length > 0 && (
          <div className="px-5 py-4 border-t border-[#f0f0f0]">
            <button
              onClick={handleTest}
              className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              테스트 재생
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
