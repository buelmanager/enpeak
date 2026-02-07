import { BaseApi } from './baseApi'
import type { ChatResponse } from '@/domain/repositories/IChatRepository'
import type { Result } from '@/shared/types/Result'
import { ok } from '@/shared/types/Result'

export class ChatApi extends BaseApi {
  async sendMessage(
    message: string,
    conversationId?: string,
    timeoutMs = 30000
  ): Promise<Result<ChatResponse>> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const result = await this.request<any>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    if (!result.success) return result

    return ok({
      message: result.data.message,
      conversationId: result.data.conversation_id,
      suggestions: result.data.suggestions,
      betterExpressions: result.data.better_expressions,
      learningTip: result.data.learning_tip,
    })
  }
}
