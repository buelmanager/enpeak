import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: {
    default: 'EnPeak - AI 영어 회화 학습 플랫폼',
    template: '%s | EnPeak',
  },
  description:
    'AI와 함께하는 영어 회화 연습. 자유 대화, 롤플레이, 단어 카드, 오늘의 표현까지 한곳에서 학습하세요.',
  keywords: [
    '영어 회화',
    'AI 영어 학습',
    'AI 영어 튜터',
    '영어 말하기 연습',
    '영어 롤플레이',
    '영어 단어 학습',
    'AI English tutor',
  ],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'EnPeak',
    title: 'EnPeak - AI 영어 회화 학습 플랫폼',
    description:
      'AI와 함께하는 영어 회화 연습. 5,000+ 학습 리소스로 실전 영어를 연습하세요.',
    url: SITE_URL || undefined,
  },
  twitter: {
    card: 'summary',
    title: 'EnPeak - AI 영어 회화 학습 플랫폼',
    description:
      'AI와 함께하는 영어 회화 연습. 자유 대화, 롤플레이, 단어 카드까지 한곳에서.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'EnPeak',
    description:
      'AI와 함께하는 영어 회화 연습. 자유 대화, 롤플레이, 단어 카드, 오늘의 표현까지 한곳에서 학습하세요.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    inLanguage: ['ko', 'en'],
  }

  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-hp-cream">
        {children}
      </body>
    </html>
  )
}
