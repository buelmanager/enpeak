import type { IChatRepository, ChatResponse } from '@/domain/repositories/IChatRepository'
import type { Result } from '@/shared/types/Result'
import { ChatApi } from '../api/chatApi'

export class ChatRepository implements IChatRepository {
  private api: ChatApi

  constructor(api?: ChatApi) {
    this.api = api || new ChatApi()
  }

  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<Result<ChatResponse>> {
    return this.api.sendMessage(message, conversationId)
  }
}
