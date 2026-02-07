import type { Metadata, Viewport } from 'next'
import '../../styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Convo - AI English Practice',
  description: 'AI와 자유롭게 영어로 대화하세요. 112개 실전 시나리오로 진짜 쓸 수 있는 영어를 연습합니다.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Convo - AI English Practice',
    description: 'AI와 자유롭게 영어로 대화하세요. 112개 실전 시나리오로 진짜 쓸 수 있는 영어를 연습합니다.',
    images: ['/icon.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FAFAF8',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
