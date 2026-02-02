import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock pathname
let mockPathname = '/talk'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

// Import after mock
import BottomNav from '@/components/BottomNav'

describe('BottomNav', () => {
  beforeEach(() => {
    mockPathname = '/talk'
  })

  describe('Tab Rendering', () => {
    it('renders all three tabs', () => {
      render(<BottomNav />)

      expect(screen.getByText('Talk')).toBeInTheDocument()
      expect(screen.getByText('Cards')).toBeInTheDocument()
      expect(screen.getByText('My')).toBeInTheDocument()
    })

    it('renders correct navigation links', () => {
      render(<BottomNav />)

      const talkLink = screen.getByRole('link', { name: 'Talk' })
      const cardsLink = screen.getByRole('link', { name: 'Cards' })
      const myLink = screen.getByRole('link', { name: 'My' })

      expect(talkLink).toHaveAttribute('href', '/talk')
      expect(cardsLink).toHaveAttribute('href', '/cards')
      expect(myLink).toHaveAttribute('href', '/my')
    })

    it('renders SVG icons for each tab', () => {
      render(<BottomNav />)

      const svgs = document.querySelectorAll('svg')
      expect(svgs).toHaveLength(3)
    })
  })

  describe('Active State Styling', () => {
    it('shows Talk as active when on /talk path', () => {
      mockPathname = '/talk'
      render(<BottomNav />)

      const talkLink = screen.getByRole('link', { name: 'Talk' })
      const talkText = screen.getByText('Talk')

      expect(talkLink).toHaveAttribute('aria-current', 'page')
      expect(talkText).toHaveClass('text-[#1a1a1a]')
    })

    it('shows Cards as active when on /cards path', () => {
      mockPathname = '/cards'
      render(<BottomNav />)

      const cardsLink = screen.getByRole('link', { name: 'Cards' })
      const cardsText = screen.getByText('Cards')

      expect(cardsLink).toHaveAttribute('aria-current', 'page')
      expect(cardsText).toHaveClass('text-[#1a1a1a]')
    })

    it('shows My as active when on /my path', () => {
      mockPathname = '/my'
      render(<BottomNav />)

      const myLink = screen.getByRole('link', { name: 'My' })
      const myText = screen.getByText('My')

      expect(myLink).toHaveAttribute('aria-current', 'page')
      expect(myText).toHaveClass('text-[#1a1a1a]')
    })

    it('shows active state for nested paths', () => {
      mockPathname = '/cards/vocabulary'
      render(<BottomNav />)

      const cardsLink = screen.getByRole('link', { name: 'Cards' })
      expect(cardsLink).toHaveAttribute('aria-current', 'page')
    })

    it('shows inactive styling for non-active tabs', () => {
      mockPathname = '/talk'
      render(<BottomNav />)

      const cardsText = screen.getByText('Cards')
      const myText = screen.getByText('My')

      expect(cardsText).toHaveClass('text-[#8a8a8a]')
      expect(myText).toHaveClass('text-[#8a8a8a]')
    })
  })

  describe('Accessibility', () => {
    it('has proper navigation role and label', () => {
      render(<BottomNav />)

      const nav = screen.getByRole('navigation', { name: 'Main navigation' })
      expect(nav).toBeInTheDocument()
    })

    it('has aria-labels on all links', () => {
      render(<BottomNav />)

      expect(screen.getByRole('link', { name: 'Talk' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Cards' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'My' })).toBeInTheDocument()
    })

    it('sets aria-current="page" only on active tab', () => {
      mockPathname = '/cards'
      render(<BottomNav />)

      const talkLink = screen.getByRole('link', { name: 'Talk' })
      const cardsLink = screen.getByRole('link', { name: 'Cards' })
      const myLink = screen.getByRole('link', { name: 'My' })

      expect(talkLink).not.toHaveAttribute('aria-current')
      expect(cardsLink).toHaveAttribute('aria-current', 'page')
      expect(myLink).not.toHaveAttribute('aria-current')
    })

    it('hides decorative SVGs from screen readers', () => {
      render(<BottomNav />)

      const svgs = document.querySelectorAll('svg')
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Safe Area Padding', () => {
    it('includes iOS safe area padding element', () => {
      const { container } = render(<BottomNav />)

      const safeAreaDiv = container.querySelector('.h-\\[env\\(safe-area-inset-bottom\\)\\]')
      expect(safeAreaDiv).toBeInTheDocument()
    })
  })
})
