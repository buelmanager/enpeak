import type { Vocabulary, RelatedContent } from '../entities/Vocabulary'
import type { Level } from '@/shared/constants/levels'
import type { Result } from '@/shared/types/Result'

export interface IVocabularyRepository {
  fetchByLevel(level: Level, limit?: number): Promise<Result<Vocabulary[]>>
  expand(word: string): Promise<Result<RelatedContent>>
  evaluate(params: {
    word: string
    userAnswer: string
    streak: number
    currentLevel: Level
  }): Promise<Result<{ shouldLevelUp: boolean }>>
}
