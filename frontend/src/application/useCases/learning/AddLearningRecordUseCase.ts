import type { ILearningHistoryRepository } from '@/domain/repositories/ILearningHistoryRepository'
import type { LearningRecord } from '@/domain/entities/LearningRecord'

type NewRecord = Omit<LearningRecord, 'id' | 'completedAt'>

export class AddLearningRecordUseCase {
  constructor(private learningHistoryRepo: ILearningHistoryRepository) {}

  execute(record: NewRecord): LearningRecord {
    return this.learningHistoryRepo.add(record)
  }
}
