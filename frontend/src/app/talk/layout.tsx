import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 영어 회화 연습',
  description: 'AI 튜터와 실시간 영어 대화. 자유 회화, 표현 연습, 롤플레이 시나리오로 말하기 실력을 키우세요.',
  alternates: {
    canonical: 'https://enpeak.web.app/talk',
  },
  openGraph: {
    title: 'AI 영어 회화 연습 | EnPeak',
    description: 'AI 튜터와 실시간 영어 대화. 자유 회화, 표현 연습, 롤플레이 시나리오 제공.',
    url: 'https://enpeak.web.app/talk',
  },
}

export default function TalkLayout({ children }: { children: React.ReactNode }) {
  return children
}
