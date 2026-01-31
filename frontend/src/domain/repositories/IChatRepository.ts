import type { Result } from '@/shared/types/Result'

export interface ChatResponse {
  message: string
  conversationId: string
  suggestions?: string[]
  betterExpressions?: string[]
  learningTip?: string
}

export interface IChatRepository {
  sendMessage(
    message: string,
    conversationId?: string
  ): Promise<Result<ChatResponse>>
}
