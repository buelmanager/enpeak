import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { AuthProvider } from '@/contexts/AuthContext'
import { TTSProvider } from '@/contexts/TTSContext'
import { ConversationSettingsProvider } from '@/contexts/ConversationSettingsContext'
import { TalkProvider } from '@/contexts/TalkContext'
import { VersionCheck } from '@/components/VersionCheck'
import PWAInstallGuide from '@/components/PWAInstallGuide'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s | EnPeak',
    default: 'EnPeak - AI 영어 회화 연습',
  },
  description: 'AI와 무료로 영어 말하기 연습. 롤플레이 시나리오, 실시간 피드백, 단어 학습. A1-C2 레벨 지원.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'EnPeak - AI 영어 회화 연습',
    description: 'AI 튜터와 영어로 대화하며 실력을 키우세요. 무료 롤플레이, 실시간 피드백, 단어 카드 학습.',
    url: 'https://enpeak.web.app',
    siteName: 'EnPeak',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'EnPeak - AI 영어 회화 연습',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'EnPeak - AI 영어 회화 연습',
    description: 'AI 튜터와 영어로 대화하며 실력을 키우세요.',
  },
  alternates: {
    canonical: 'https://enpeak.web.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EnPeak',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'naver-site-verification': 'NAVER_VERIFICATION_CODE',
  },
  verification: {
    google: 'GOOGLE_VERIFICATION_CODE',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#faf9f7',
}

// Build cache buster: v1.0.10
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EnPeak" />
        <meta name="application-name" content="EnPeak" />
        <meta name="msapplication-TileColor" content="#0D9488" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'EnPeak',
              url: 'https://enpeak.web.app',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Any',
              inLanguage: ['en', 'ko'],
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'KRW',
              },
              description: 'AI 튜터와 영어 회화 연습. 롤플레이, 실시간 피드백, 단어 학습 제공.',
              featureList: [
                'AI 영어 회화 연습',
                '롤플레이 시나리오',
                '실시간 문법 피드백',
                '단어 카드 학습',
                '음성 인식/합성',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'EnPeak',
              url: 'https://enpeak.web.app',
              logo: 'https://enpeak.web.app/icons/icon-512.png',
            }),
          }}
        />
      </head>
      <body className="antialiased bg-[#faf9f7]">
        <VersionCheck />
        <AuthProvider>
          <TTSProvider>
            <ConversationSettingsProvider>
              <TalkProvider>
                <AppShell>
                  {children}
                  <PWAInstallGuide />
                </AppShell>
              </TalkProvider>
            </ConversationSettingsProvider>
          </TTSProvider>
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
