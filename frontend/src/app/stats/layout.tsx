import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '학습 통계',
  description: '영어 학습 진행 상황을 확인하세요.',
  robots: { index: false, follow: false },
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children
}
