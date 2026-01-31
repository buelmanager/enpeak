import { BaseApi } from './baseApi'
import type { Vocabulary, RelatedContent } from '@/domain/entities/Vocabulary'
import type { Level } from '@/shared/constants/levels'
import type { Result } from '@/shared/types/Result'
import { ok } from '@/shared/types/Result'

export class VocabularyApi extends BaseApi {
  async fetchByLevel(level: Level, limit = 10): Promise<Result<Vocabulary[]>> {
    const result = await this.request<any>(`/api/vocabulary/level/${level}?limit=${limit}`)

    if (!result.success) return result

    return ok(
      result.data.words.map((w: any) => ({
        word: w.word,
        meaning: w.meaning,
        level: w.level,
        pronunciation: w.pronunciation,
        example: w.example,
        exampleKo: w.example_ko,
      }))
    )
  }

  async expand(word: string): Promise<Result<RelatedContent>> {
    const result = await this.request<any>('/api/vocabulary/expand', {
      method: 'POST',
      body: JSON.stringify({ word }),
    })

    if (!result.success) return result

    return ok({
      idioms: result.data.idioms || [],
      sentences: result.data.sentences || [],
      relatedWords: result.data.related_words || [],
    })
  }

  async evaluate(params: {
    word: string
    userAnswer: string
    streak: number
    currentLevel: Level
  }): Promise<Result<{ shouldLevelUp: boolean }>> {
    const result = await this.request<any>('/api/vocabulary/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        word: params.word,
        userAnswer: params.userAnswer,
        streak: params.streak,
        currentLevel: params.currentLevel,
      }),
    })

    if (!result.success) return result

    return ok({
      shouldLevelUp: result.data.should_level_up || false,
    })
  }
}
