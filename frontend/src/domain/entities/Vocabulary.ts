import type { Level } from '@/shared/constants/levels'

export interface Vocabulary {
  word: string
  meaning: string
  level: Level
  pronunciation?: string
  example?: string
  exampleKo?: string
}

export interface RelatedContent {
  idioms: Array<{ phrase: string; meaning: string }>
  sentences: Array<{ en: string; ko: string }>
  relatedWords: string[]
}
