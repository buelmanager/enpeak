import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '영어 단어 카드 학습',
  description: 'A1~C2 레벨별 영어 단어 카드. 뜻 가리기, 단어 가리기 모드로 효과적인 어휘 학습.',
  alternates: {
    canonical: 'https://enpeak.web.app/cards',
  },
  openGraph: {
    title: '영어 단어 카드 학습 | EnPeak',
    description: 'A1~C2 레벨별 영어 단어 카드. 숙어, 예문 포함.',
    url: 'https://enpeak.web.app/cards',
  },
}

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return children
}
