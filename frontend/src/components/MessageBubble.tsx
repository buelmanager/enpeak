'use client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  learningTip?: string
}

interface MessageBubbleProps {
  message: Message
  onSpeak?: (text: string) => void
}

export default function MessageBubble({ message, onSpeak }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(message.content)
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.content)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* AI 메시지에 음성 재생 버튼 */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1 ml-1">
            <button
              onClick={handleSpeak}
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
              title="Listen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        )}

        {/* 학습 팁 */}
        {message.learningTip && (
          <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">💡</span>
              <p className="text-xs text-amber-800">{message.learningTip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
