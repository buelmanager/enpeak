type EventName =
  | 'cta_click'
  | 'nav_click'
  | 'feature_click'
  | 'community_click'
  | 'challenge_click'
  | 'leaderboard_click'

interface AnalyticsEvent {
  name: EventName
  label: string
  href?: string
}

export function trackEvent({ name, label, href }: AnalyticsEvent) {
  if (typeof window === 'undefined') return

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, {
      event_category: 'engagement',
      event_label: label,
      link_url: href,
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug(`[analytics] ${name}: ${label}`, href || '')
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
