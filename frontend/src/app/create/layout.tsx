import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '시나리오 만들기',
  description: '나만의 영어 회화 시나리오를 만들어 연습하세요.',
  alternates: {
    canonical: 'https://enpeak.web.app/create',
  },
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children
}
