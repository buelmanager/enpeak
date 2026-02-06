'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '홈', icon: 'home' },
  { href: '/stats', label: '통계', icon: 'stats' },
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

  const isTalkActive = pathname.startsWith('/talk')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0"
      role="navigation"
      aria-label="Main navigation"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Floating Talk Button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-9 z-10">
        <Link
          href="/talk"
          aria-label="Talk"
          aria-current={isTalkActive ? 'page' : undefined}
          className="w-[72px] h-[72px] rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-transform active:scale-95"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 15V3M12 15L8 11M12 15L16 11"
              stroke="white"
              strokeWidth="0"
            />
            <rect x="9" y="3" width="6" height="12" rx="3" stroke="white" strokeWidth="2" fill="none" />
            <path d="M5 11v1a7 7 0 0014 0v-1" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#faf9f7] border-t border-[#f0f0f0]">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item, idx) => {
            const active = isActive(item.href)
            return (
              <div key={item.href} className="contents">
                <Link
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
                {/* Spacer for floating button in the middle */}
                {idx === 0 && <div className="min-w-[60px]" />}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
