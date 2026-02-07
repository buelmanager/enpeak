import type { Metadata, Viewport } from 'next'
import { Playfair_Display } from 'next/font/google'
import '../styles/globals.css'
import { SITE_URL } from '@/lib/constants'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
  variable: '--font-playfair',
})

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
    card: 'summary_large_image',
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
    <html lang="ko" className={playfair.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-hp-cream">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-hp-indigo focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  )
}
