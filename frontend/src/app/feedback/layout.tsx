import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기능 요청',
  description: 'EnPeak에 대한 피드백과 기능 요청을 보내주세요.',
  robots: { index: false, follow: false },
}

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children
}
