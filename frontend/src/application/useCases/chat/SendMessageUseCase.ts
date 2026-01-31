import type { IChatRepository } from '@/domain/repositories/IChatRepository'
import type { Message } from '@/domain/entities/Message'
import type { Result } from '@/shared/types/Result'
import { ok, err } from '@/shared/types/Result'

interface SendMessageParams {
  text: string
  conversationId?: string
}

interface SendMessageResult {
  userMessage: Message
  assistantMessage: Message
  conversationId: string
  betterExpressions?: string[]
}

export class SendMessageUseCase {
  constructor(private chatRepository: IChatRepository) {}

  async execute(params: SendMessageParams): Promise<Result<SendMessageResult>> {
    const { text, conversationId } = params

    if (!text.trim()) {
      return err(new Error('Message cannot be empty'))
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    const result = await this.chatRepository.sendMessage(text, conversationId)

    if (!result.success) {
      return err(result.error)
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.data.message,
      suggestions: result.data.suggestions?.slice(0, 2),
      learningTip: result.data.learningTip,
      timestamp: new Date(),
    }

    return ok({
      userMessage: {
        ...userMessage,
        betterExpressions: result.data.betterExpressions,
      },
      assistantMessage,
      conversationId: result.data.conversationId,
      betterExpressions: result.data.betterExpressions,
    })
  }
}
