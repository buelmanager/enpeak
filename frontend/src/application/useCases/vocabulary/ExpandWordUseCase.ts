import type { IVocabularyRepository } from '@/domain/repositories/IVocabularyRepository'
import type { RelatedContent } from '@/domain/entities/Vocabulary'
import type { Result } from '@/shared/types/Result'

export class ExpandWordUseCase {
  constructor(private vocabularyRepository: IVocabularyRepository) {}

  async execute(word: string): Promise<Result<RelatedContent>> {
    return this.vocabularyRepository.expand(word)
  }
}
