'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '홈', icon: 'home' },
  { href: '/stats', label: '통계', icon: 'stats' },
  { href: '/my', label: 'My', icon: 'my' },
]

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? '#1a1a1a' : '#8a8a8a'

  switch (icon) {
    case 'home':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'cards':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="4"
            y="8"
            width="16"
            height="12"
            rx="2"
            stroke={color}
            strokeWidth="1.75"
          />
          <path
            d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2"
            stroke={color}
            strokeWidth="1.75"
          />
        </svg>
      )
    case 'stats':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 19V13M12 19V9M15 19V5M5 21H19"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'my':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.75" />
          <path
            d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return null
  }
}

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]"
      role="navigation"
      aria-label="Main navigation"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 min-w-[60px] py-1"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <NavIcon icon={item.icon} active={active} />
              <span
                className={`text-[10px] tracking-wide ${
                  active ? 'text-[#1a1a1a] font-medium' : 'text-[#8a8a8a]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
