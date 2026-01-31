'use client'

import { useState, useCallback, useMemo } from 'react'
import type { Message } from '@/domain/entities/Message'
import { SendMessageUseCase } from '@/application/useCases/chat/SendMessageUseCase'
import { ChatRepository } from '@/infrastructure/repositories/ChatRepository'

// 표현별 대화 시작 문장
function getConversationStarter(expression: string): string {
  const starters: Record<string, string> = {
    'break the ice': "Hi! We just met at this party, and it feels a bit awkward. What do you usually do to start conversations with new people?",
    'easier said than done': "I've been trying to wake up early every day, but it's so hard! Have you ever tried to change a habit?",
    'hit the nail on the head': "I think the main problem with our project is the deadline. What do you think?",
    'piece of cake': "I heard you passed the driving test on your first try! Was it difficult?",
    'cost an arm and a leg': "I love your new smartphone! I've been thinking about getting one too. How much did it cost?",
    'under the weather': "Hey, you don't look so good today. Are you feeling okay?",
    'once in a blue moon': "Do you visit your hometown often? I miss my family sometimes.",
    'bite the bullet': "I've been putting off going to the dentist for months. I really need to go soon.",
    'let the cat out of the bag': "We're planning a surprise party for Sarah! But please don't tell anyone.",
    'when pigs fly': "Do you think our boss will give us a day off this Friday?",
  }

  const key = expression.toLowerCase()
  return starters[key] || `Imagine a situation where you could use "${expression}". How would you respond?`
}

// 표현별 제안 응답
function getSuggestions(expression: string): string[] {
  const suggestions: Record<string, string[]> = {
    'break the ice': ["I usually try to break the ice by asking about their hobbies.", "Breaking the ice can be hard, but a simple compliment works!"],
    'easier said than done': ["Yeah, waking up early is easier said than done!", "I know what you mean. It's easier said than done."],
    'hit the nail on the head': ["You hit the nail on the head! That's exactly the problem.", "I think you hit the nail on the head with that."],
    'piece of cake': ["It was a piece of cake! I passed easily.", "Actually, it was a piece of cake for me."],
    'cost an arm and a leg': ["It cost an arm and a leg, but it's worth it.", "Be careful, these phones cost an arm and a leg!"],
    'under the weather': ["I'm feeling a bit under the weather today.", "Yeah, I've been under the weather since yesterday."],
    'once in a blue moon': ["I only visit once in a blue moon, unfortunately.", "We see each other once in a blue moon these days."],
    'bite the bullet': ["I think you should just bite the bullet and go.", "Time to bite the bullet and face your fears!"],
    'let the cat out of the bag': ["Don't worry, I won't let the cat out of the bag!", "Oops, I almost let the cat out of the bag!"],
    'when pigs fly': ["A day off? When pigs fly!", "That'll happen when pigs fly!"],
  }

  const key = expression.toLowerCase()
  return suggestions[key] || [`I would use "${expression}" here.`, "Let me try using this expression."]
}

interface PracticeExpression {
  expression: string
  meaning: string
}

interface UseChatOptions {
  practiceExpression?: PracticeExpression
}

export function useChat(options?: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const sendMessageUseCase = useMemo(() => {
    const repo = new ChatRepository()
    return new SendMessageUseCase(repo)
  }, [])

  // 표현 연습 모드 초기화
  const initializePracticeMode = useCallback(() => {
    if (options?.practiceExpression && !initialized) {
      const initialMessage: Message = {
        id: 'initial',
        role: 'assistant',
        content: `Let's practice using "${options.practiceExpression.expression}"! I'll start a conversation where you can use this expression naturally.`,
        learningTip: `"${options.practiceExpression.expression}" = ${options.practiceExpression.meaning}`,
      }

      const situationMessage: Message = {
        id: 'situation',
        role: 'assistant',
        content: getConversationStarter(options.practiceExpression.expression),
        suggestions: getSuggestions(options.practiceExpression.expression),
      }

      setMessages([initialMessage, situationMessage])
      setInitialized(true)
    }
  }, [options?.practiceExpression, initialized])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    setLoading(true)

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMessage])

    const result = await sendMessageUseCase.execute({
      text,
      conversationId: conversationId || undefined,
    })

    if (result.success) {
      // 더 나은 표현이 있으면 사용자 메시지에 추가
      if (result.data.betterExpressions && result.data.betterExpressions.length > 0) {
        setMessages(prev => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].role === 'user') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              betterExpressions: result.data.betterExpressions,
            }
          }
          return updated
        })
      }

      // AI 응답 추가
      setMessages(prev => [...prev, result.data.assistantMessage])
      setConversationId(result.data.conversationId)
    } else {
      // 에러 처리
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process your message. Please try again.",
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setLoading(false)
  }, [conversationId, sendMessageUseCase])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setInitialized(false)
  }, [])

  return {
    messages,
    loading,
    sendMessage,
    clearMessages,
    conversationId,
    initializePracticeMode,
  }
}
