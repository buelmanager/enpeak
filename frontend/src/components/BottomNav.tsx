'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/talk', label: 'Talk', icon: 'talk' },
  { href: '/cards', label: 'Cards', icon: 'cards' },
  { href: '/my', label: 'My', icon: 'my' },
]

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? '#1a1a1a' : '#8a8a8a'

  switch (icon) {
    case 'talk':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3C6.477 3 2 6.582 2 11c0 2.118.962 4.043 2.54 5.48L3 21l4.9-2.45C9.18 19.17 10.547 19.5 12 19.5c5.523 0 10-3.582 10-8.5S17.523 3 12 3z"
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

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]"
      role="navigation"
      aria-label="Main navigation"
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
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[#faf9f7]" />
    </nav>
  )
}
