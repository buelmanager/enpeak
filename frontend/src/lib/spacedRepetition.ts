// SM-2 간격반복 알고리즘 유틸리티
// SuperMemo 2 알고리즘을 영어 학습에 맞게 간소화

export interface SM2Input {
  quality: number         // 0~5 (0=완전 모름, 5=완벽)
  easeFactor: number      // 현재 ease factor (초기 2.5)
  interval: number        // 현재 복습 간격 (일)
  reviewCount: number     // 총 복습 횟수
  correctCount: number    // 정답 횟수
}

export interface SM2Result {
  easeFactor: number
  interval: number        // 새 복습 간격 (일)
  nextReviewAt: number    // 다음 복습 시간 (timestamp)
  mastery: number         // 0~5 숙련도
}

const DAY_MS = 24 * 60 * 60 * 1000

export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, reviewCount, correctCount } = input
  let { easeFactor, interval } = input

  const newReviewCount = reviewCount + 1
  const newCorrectCount = quality >= 3 ? correctCount + 1 : correctCount

  if (quality < 3) {
    // 틀림: 간격 리셋
    interval = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else if (quality === 3) {
    // 어려움: 간격 유지, ease 약간 감소
    easeFactor = Math.max(1.3, easeFactor - 0.14)
  } else if (quality === 4) {
    // 보통: 간격 * easeFactor
    if (interval === 0) {
      interval = 1
    } else if (interval === 1) {
      interval = 3
    } else {
      interval = Math.round(interval * easeFactor)
    }
    easeFactor = Math.max(1.3, easeFactor + 0.0)
  } else {
    // 쉬움 (quality 5): 간격 * easeFactor * 1.3
    if (interval === 0) {
      interval = 1
    } else if (interval === 1) {
      interval = 4
    } else {
      interval = Math.round(interval * easeFactor * 1.3)
    }
    easeFactor = Math.max(1.3, easeFactor + 0.1)
  }

  // 최대 180일 제한
  interval = Math.min(interval, 180)

  // 숙련도 계산: 정답률 기반 0~5
  const ratio = newReviewCount > 0 ? newCorrectCount / newReviewCount : 0
  const mastery = Math.min(5, Math.floor(ratio * 6))

  const nextReviewAt = Date.now() + interval * DAY_MS

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    nextReviewAt,
    mastery,
  }
}

// 기본값 생성 (새 단어/문장용)
export function getDefaultSM2Fields() {
  return {
    mastery: 0,
    reviewCount: 0,
    correctCount: 0,
    lastReviewedAt: null as number | null,
    nextReviewAt: Date.now(), // 즉시 복습 가능
    easeFactor: 2.5,
    interval: 0,
  }
}

// 복습 필요 여부 확인
export function needsReview(nextReviewAt: number): boolean {
  return nextReviewAt <= Date.now()
}
