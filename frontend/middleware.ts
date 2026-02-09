import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirect mappings for backward compatibility
  const redirects: Record<string, string> = {
    '/vocabulary': '/cards',
    '/chat': '/talk',
    '/community': '/talk?mode=roleplay',
    '/roleplay': '/talk?mode=roleplay',
    '/conversations': '/talk?mode=roleplay',
  }

  if (pathname in redirects) {
    return NextResponse.redirect(new URL(redirects[pathname], request.url), {
      status: 308, // Permanent redirect (preserves method)
    })
  }

  // Detect native app via User-Agent and set header for SSR
  const userAgent = request.headers.get('user-agent') || ''
  const isNativeApp = userAgent.includes('EnPeakApp/')
  const response = NextResponse.next()

  if (isNativeApp) {
    response.headers.set('x-enpeak-platform', 'app')
  }

  return response
}

export const config = {
  matcher: [
    '/vocabulary', '/chat', '/community', '/roleplay', '/conversations',
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
}
