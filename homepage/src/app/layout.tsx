import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'EnPeak - AI English Learning Community',
  description: 'AI와 함께하는 영어 회화 연습. Practice real English with AI-powered conversations.',
  openGraph: {
    title: 'EnPeak - AI English Learning Community',
    description: 'AI와 함께하는 영어 회화 연습. 5,000+ 학습 리소스로 실전 영어를 연습하세요.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFBF5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-hp-cream">
        {children}
      </body>
    </html>
  )
}
