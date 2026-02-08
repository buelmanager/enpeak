import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인',
  description: 'EnPeak에 로그인하여 영어 학습을 시작하세요.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
