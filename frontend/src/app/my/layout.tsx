import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '마이페이지',
  description: '학습 통계, 음성 설정, 앱 업데이트를 관리하세요.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://enpeak.web.app/my',
  },
}

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return children
}
