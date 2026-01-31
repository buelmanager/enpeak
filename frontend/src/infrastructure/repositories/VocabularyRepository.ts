import type { IVocabularyRepository } from '@/domain/repositories/IVocabularyRepository'
import type { Vocabulary, RelatedContent } from '@/domain/entities/Vocabulary'
import type { Level } from '@/shared/constants/levels'
import type { Result } from '@/shared/types/Result'
import { VocabularyApi } from '../api/vocabularyApi'
import { ok } from '@/shared/types/Result'

// 폴백 데이터
const SAMPLE_WORDS: Vocabulary[] = [
  { word: 'hello', meaning: '안녕하세요', level: 'A1', example: 'Hello, how are you?', exampleKo: '안녕하세요, 어떻게 지내세요?' },
  { word: 'goodbye', meaning: '안녕히 가세요', level: 'A1', example: 'Goodbye, see you later!', exampleKo: '안녕히 가세요, 나중에 봐요!' },
  { word: 'thank you', meaning: '감사합니다', level: 'A1', example: 'Thank you for your help.', exampleKo: '도와주셔서 감사합니다.' },
  { word: 'please', meaning: '부탁드립니다', level: 'A1', example: 'Please help me.', exampleKo: '도와주세요.' },
  { word: 'sorry', meaning: '죄송합니다', level: 'A1', example: "I'm sorry for being late.", exampleKo: '늦어서 죄송합니다.' },
  { word: 'friend', meaning: '친구', level: 'A1', example: 'She is my best friend.', exampleKo: '그녀는 내 가장 친한 친구야.' },
  { word: 'family', meaning: '가족', level: 'A1', example: 'I love my family.', exampleKo: '나는 가족을 사랑해.' },
  { word: 'water', meaning: '물', level: 'A1', example: 'Can I have some water?', exampleKo: '물 좀 주시겠어요?' },
  { word: 'food', meaning: '음식', level: 'A1', example: 'The food is delicious.', exampleKo: '음식이 맛있어요.' },
  { word: 'happy', meaning: '행복한', level: 'A1', example: "I'm so happy today!", exampleKo: '오늘 정말 행복해!' },
]

export class VocabularyRepository implements IVocabularyRepository {
  private api: VocabularyApi

  constructor(api?: VocabularyApi) {
    this.api = api || new VocabularyApi()
  }

  async fetchByLevel(level: Level, limit?: number): Promise<Result<Vocabulary[]>> {
    const result = await this.api.fetchByLevel(level, limit)

    if (!result.success) {
      // API 실패 시 샘플 데이터 반환
      return ok(SAMPLE_WORDS.filter(w => w.level === level))
    }

    return result
  }

  async expand(word: string): Promise<Result<RelatedContent>> {
    const result = await this.api.expand(word)

    if (!result.success) {
      // 폴백 데이터
      return ok({
        idioms: [
          { phrase: `learn ${word}`, meaning: `${word}를 배우다` },
          { phrase: `use ${word}`, meaning: `${word}를 사용하다` },
        ],
        sentences: [
          { en: `I want to learn ${word}.`, ko: `나는 ${word}를 배우고 싶어요.` },
          { en: `Can you explain ${word}?`, ko: `${word}를 설명해 줄 수 있나요?` },
        ],
        relatedWords: ['vocabulary', 'practice', 'study'],
      })
    }

    return result
  }

  async evaluate(params: {
    word: string
    userAnswer: string
    streak: number
    currentLevel: Level
  }): Promise<Result<{ shouldLevelUp: boolean }>> {
    const result = await this.api.evaluate(params)

    if (!result.success) {
      // 로컬 로직으로 폴백
      const shouldLevelUp = params.streak >= 10
      return ok({ shouldLevelUp })
    }

    return result
  }
}
