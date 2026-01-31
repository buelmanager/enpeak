import type { IVocabularyRepository } from '@/domain/repositories/IVocabularyRepository'
import type { Vocabulary } from '@/domain/entities/Vocabulary'
import type { Level } from '@/shared/constants/levels'
import type { Result } from '@/shared/types/Result'

export class FetchWordsUseCase {
  constructor(private vocabularyRepository: IVocabularyRepository) {}

  async execute(level: Level, limit = 10): Promise<Result<Vocabulary[]>> {
    return this.vocabularyRepository.fetchByLevel(level, limit)
  }
}
