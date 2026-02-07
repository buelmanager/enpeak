'use client'

import { useState, useEffect } from 'react'

import { APP_URL } from '@/lib/constants'

const NAV_LINKS = [
  { label: '기능 소개', href: '#features' },
  { label: '커뮤니티', href: '#community' },
  { label: '챌린지', href: '#challenge' },
  { label: '블로그', href: '/blog' },
]

export default function HomepageNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      setMobileOpen(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-xl font-bold text-hp-text">
            EnPeak
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-hp-muted hover:text-hp-text transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a
              href={`${APP_URL}/talk`}
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-hp-indigo to-hp-violet hover:opacity-90 transition-opacity"
            >
              학습 시작하기
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-hp-text"
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100" role="dialog" aria-modal="true">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block text-base font-medium text-hp-text py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`${APP_URL}/talk`}
              className="block w-full text-center px-5 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-hp-indigo to-hp-violet"
              onClick={() => setMobileOpen(false)}
            >
              학습 시작하기
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
