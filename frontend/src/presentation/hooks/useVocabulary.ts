'use client'

import { useState, useCallback, useMemo } from 'react'
import type { Vocabulary, RelatedContent } from '@/domain/entities/Vocabulary'
import type { Level } from '@/shared/constants/levels'
import { LEVELS } from '@/shared/constants/levels'
import { VocabularyRepository } from '@/infrastructure/repositories/VocabularyRepository'
import { LearningHistoryRepository } from '@/infrastructure/repositories/LearningHistoryRepository'
import { FetchWordsUseCase } from '@/application/useCases/vocabulary/FetchWordsUseCase'
import { ExpandWordUseCase } from '@/application/useCases/vocabulary/ExpandWordUseCase'

interface VocabularyState {
  words: Vocabulary[]
  currentWord: Vocabulary | null
  currentIndex: number
  currentLevel: Level
  userAnswer: string
  showAnswer: boolean
  streak: number
  correctCount: number
  totalCount: number
  levelProgress: number
}

export function useVocabulary() {
  const [state, setState] = useState<VocabularyState>({
    words: [],
    currentWord: null,
    currentIndex: 0,
    currentLevel: 'A1',
    userAnswer: '',
    showAnswer: false,
    streak: 0,
    correctCount: 0,
    totalCount: 0,
    levelProgress: 0,
  })
  const [loading, setLoading] = useState(false)
  const [relatedContent, setRelatedContent] = useState<RelatedContent | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const vocabularyRepo = useMemo(() => new VocabularyRepository(), [])
  const learningHistoryRepo = useMemo(() => new LearningHistoryRepository(), [])
  const fetchWordsUseCase = useMemo(() => new FetchWordsUseCase(vocabularyRepo), [vocabularyRepo])
  const expandWordUseCase = useMemo(() => new ExpandWordUseCase(vocabularyRepo), [vocabularyRepo])

  const fetchWords = useCallback(async (level: Level) => {
    setLoading(true)
    const result = await fetchWordsUseCase.execute(level, 10)

    if (result.success && result.data.length > 0) {
      setState(prev => ({
        ...prev,
        words: result.data,
        currentWord: result.data[0],
        currentIndex: 0,
        currentLevel: level,
      }))
    }

    setLoading(false)
  }, [fetchWordsUseCase])

  const checkAnswer = useCallback((mode: 'meaning' | 'spelling' | 'listening') => {
    if (!state.currentWord) return false

    let isCorrect = false
    const cleanWord = state.currentWord.word.replace(/:/g, '').trim()

    if (mode === 'meaning') {
      isCorrect = state.userAnswer.trim() === state.currentWord.meaning
    } else {
      isCorrect = state.userAnswer.toLowerCase().trim() === cleanWord.toLowerCase()
    }

    const newLevelProgress = isCorrect
      ? state.levelProgress + 10
      : Math.max(0, state.levelProgress - 5)

    setState(prev => ({
      ...prev,
      showAnswer: true,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      totalCount: prev.totalCount + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      levelProgress: newLevelProgress,
    }))

    // 학습 기록 저장
    learningHistoryRepo.add({
      type: 'vocabulary',
      title: state.currentWord.word,
      word: state.currentWord.word,
      details: {
        correctCount: isCorrect ? 1 : 0,
        totalCount: 1,
        level: state.currentLevel,
      },
    })

    // 레벨업 체크
    if (isCorrect && newLevelProgress >= 90) {
      const currentLevelIndex = LEVELS.indexOf(state.currentLevel)
      if (currentLevelIndex < LEVELS.length - 1) {
        setShowLevelUp(true)
        setTimeout(() => {
          const newLevel = LEVELS[currentLevelIndex + 1]
          setState(prev => ({ ...prev, levelProgress: 0, currentLevel: newLevel }))
          fetchWords(newLevel)
          setShowLevelUp(false)
        }, 2000)
      }
    }

    return isCorrect
  }, [state.currentWord, state.userAnswer, state.levelProgress, state.currentLevel, learningHistoryRepo, fetchWords])

  const nextWord = useCallback(() => {
    const nextIndex = (state.currentIndex + 1) % state.words.length
    setState(prev => ({
      ...prev,
      currentIndex: nextIndex,
      currentWord: prev.words[nextIndex],
      userAnswer: '',
      showAnswer: false,
    }))
    setRelatedContent(null)
  }, [state.currentIndex, state.words.length])

  const expandWord = useCallback(async () => {
    if (!state.currentWord) return

    setLoading(true)
    const result = await expandWordUseCase.execute(state.currentWord.word)

    if (result.success) {
      setRelatedContent(result.data)
    }

    setLoading(false)
  }, [state.currentWord, expandWordUseCase])

  const setUserAnswer = useCallback((answer: string) => {
    setState(prev => ({ ...prev, userAnswer: answer }))
  }, [])

  return {
    ...state,
    loading,
    relatedContent,
    showLevelUp,
    fetchWords,
    checkAnswer,
    nextWord,
    expandWord,
    setUserAnswer,
  }
}
