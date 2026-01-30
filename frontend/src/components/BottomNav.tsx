'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '홈', icon: 'home' },
  { href: '/conversations', label: '회화', icon: 'conversations' },
  { href: '/community', label: '커뮤니티', icon: 'community' },
  { href: '/my', label: 'My', icon: 'my' },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed left-0 right-0 bg-[#faf9f7] border-t border-[#f0f0f0]" style={{ bottom: '30px' }}>
      <div className="flex items-center justify-around py-3">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 min-w-[50px]"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isActive(item.href) ? 'bg-[#1a1a1a]' : 'bg-transparent'}`} />
            <span className={`text-[10px] tracking-wide ${isActive(item.href) ? 'text-[#1a1a1a]' : 'text-[#8a8a8a]'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
