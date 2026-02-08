import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 영어 학습 - 무료 회화 연습',
  description: 'AI와 영어로 대화하며 실력을 키우세요. 152개 롤플레이 시나리오, 실시간 피드백, 단어 카드, 음성 학습. 무료.',
  alternates: {
    canonical: 'https://enpeak.web.app/landing',
  },
  openGraph: {
    title: 'EnPeak - AI 영어 학습',
    description: 'AI 튜터와 영어 회화 연습. 152개 시나리오, 실시간 피드백, 무료.',
    url: 'https://enpeak.web.app/landing',
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children
}
