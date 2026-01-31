import { ChatApi } from '@/infrastructure/api/chatApi'
import { VocabularyApi } from '@/infrastructure/api/vocabularyApi'
import { ChatRepository } from '@/infrastructure/repositories/ChatRepository'
import { VocabularyRepository } from '@/infrastructure/repositories/VocabularyRepository'
import { LearningHistoryRepository } from '@/infrastructure/repositories/LearningHistoryRepository'

class Container {
  private static instance: Container
  private services = new Map<string, any>()

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
      Container.instance.initialize()
    }
    return Container.instance
  }

  private initialize() {
    // API 클라이언트
    this.services.set('chatApi', new ChatApi())
    this.services.set('vocabularyApi', new VocabularyApi())

    // 레포지토리
    this.services.set('chatRepository', new ChatRepository(this.resolve('chatApi')))
    this.services.set('vocabularyRepository', new VocabularyRepository(this.resolve('vocabularyApi')))
    this.services.set('learningHistoryRepository', new LearningHistoryRepository())
  }

  resolve<T>(key: string): T {
    return this.services.get(key) as T
  }

  register<T>(key: string, instance: T): void {
    this.services.set(key, instance)
  }
}

export const container = Container.getInstance()
