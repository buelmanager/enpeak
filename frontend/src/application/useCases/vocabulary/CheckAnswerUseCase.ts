import type { Vocabulary } from '@/domain/entities/Vocabulary'
import type { ILearningHistoryRepository } from '@/domain/repositories/ILearningHistoryRepository'
import type { Level } from '@/shared/constants/levels'

interface CheckAnswerParams {
  word: Vocabulary
  userAnswer: string
  mode: 'meaning' | 'spelling' | 'listening'
  currentLevel: Level
}

interface CheckAnswerResult {
  isCorrect: boolean
  correctAnswer: string
}

export class CheckAnswerUseCase {
  constructor(private learningHistoryRepo: ILearningHistoryRepository) {}

  execute(params: CheckAnswerParams): CheckAnswerResult {
    const { word, userAnswer, mode } = params

    let isCorrect = false
    let correctAnswer = ''

    if (mode === 'meaning') {
      isCorrect = userAnswer.trim() === word.meaning
      correctAnswer = word.meaning
    } else {
      const cleanWord = word.word.replace(/:/g, '').trim()
      isCorrect = userAnswer.toLowerCase().trim() === cleanWord.toLowerCase()
      correctAnswer = cleanWord
    }

    // 학습 기록 저장
    this.learningHistoryRepo.add({
      type: 'vocabulary',
      title: word.word,
      word: word.word,
      details: {
        correctCount: isCorrect ? 1 : 0,
        totalCount: 1,
        level: params.currentLevel,
      },
    })

    return { isCorrect, correctAnswer }
  }
}
