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
  title: 'Flu - AI English Learning',
  description: 'AI와 함께하는 영어 회화 연습 앱',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Flu - AI English Learning',
    description: 'AI와 함께하는 영어 회화 연습 앱',
    images: ['/icon.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Flu',
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
        <meta name="apple-mobile-web-app-title" content="Flu" />
        <meta name="application-name" content="Flu" />
        <meta name="msapplication-TileColor" content="#0D9488" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        <meta name="msapplication-tap-highlight" content="no" />
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
