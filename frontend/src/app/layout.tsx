import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { AuthProvider } from '@/contexts/AuthContext'
import { TTSProvider } from '@/contexts/TTSContext'
import { VersionCheck } from '@/components/VersionCheck'

export const metadata: Metadata = {
  title: 'EnPeak - AI English Learning',
  description: 'AI와 함께하는 영어 회화 연습 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EnPeak',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EnPeak" />
        <meta name="application-name" content="EnPeak" />
        <meta name="msapplication-TileColor" content="#0d0d12" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased bg-[#faf9f7]">
        <VersionCheck />
        <AuthProvider>
          <TTSProvider>
            {children}
          </TTSProvider>
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
