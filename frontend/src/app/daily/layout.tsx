import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '오늘의 영어 표현',
  description: '매일 새로운 영어 표현을 배우세요. 일상 회화에서 바로 쓸 수 있는 실용적인 표현 학습.',
  alternates: {
    canonical: 'https://enpeak.web.app/daily',
  },
  openGraph: {
    title: '오늘의 영어 표현 | EnPeak',
    description: '매일 새로운 영어 표현. 실생활에서 바로 활용 가능.',
    url: 'https://enpeak.web.app/daily',
  },
}

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children
}
