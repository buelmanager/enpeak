import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirect mappings for backward compatibility
  const redirects: Record<string, string> = {
    '/': '/talk',
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/vocabulary', '/chat', '/community', '/roleplay', '/conversations'],
}
