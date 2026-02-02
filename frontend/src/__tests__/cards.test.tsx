import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/cards',
}))

vi.mock('@/contexts/TTSContext', () => ({
  useTTS: () => ({
    speak: vi.fn(),
    isSpeaking: false,
    stop: vi.fn(),
  }),
}))

vi.mock('@/lib/learningHistory', () => ({
  addLearningRecord: vi.fn(),
}))

vi.mock('@/components/BottomNav', () => ({
  default: () => <nav data-testid="bottom-nav">BottomNav</nav>,
}))

import CardsPage from '@/app/cards/page'

describe('Cards Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders header with Cards title', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByText('Cards')).toBeInTheDocument()
    })
  })

  it('renders back link pointing to /talk', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      const backLink = document.querySelector('a[href="/talk"]')
      expect(backLink).toBeInTheDocument()
    })
  })

  it('renders BottomNav', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    render(<CardsPage />)
    expect(screen.getByText('단어를 불러오는 중...')).toBeInTheDocument()
  })
})

describe('Card Flip Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows word hidden initially in hide-meaning mode', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument()
    })

    expect(screen.getByTestId('hidden-content')).toBeInTheDocument()
    expect(screen.getByText('탭하여 뜻 보기')).toBeInTheDocument()
  })

  it('reveals meaning when flashcard is clicked', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('flashcard'))

    await waitFor(() => {
      expect(screen.getByTestId('revealed-content')).toBeInTheDocument()
    })
  })

  it('shows action buttons after reveal', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('flashcard'))

    await waitFor(() => {
      expect(screen.getByTestId('action-buttons')).toBeInTheDocument()
      expect(screen.getByTestId('know-button')).toBeInTheDocument()
      expect(screen.getByTestId('dont-know-button')).toBeInTheDocument()
    })
  })

  it('moves to next word when know button is clicked', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument()
    })

    const firstWord = screen.getByTestId('card-word').textContent

    fireEvent.click(screen.getByTestId('flashcard'))
    await waitFor(() => {
      expect(screen.getByTestId('know-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('know-button'))

    await waitFor(() => {
      const secondWord = screen.getByTestId('card-word').textContent
      expect(secondWord).not.toBe(firstWord)
    })
  })

  it('moves to next word when dont-know button is clicked', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument()
    })

    const firstWord = screen.getByTestId('card-word').textContent

    fireEvent.click(screen.getByTestId('flashcard'))
    await waitFor(() => {
      expect(screen.getByTestId('dont-know-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('dont-know-button'))

    await waitFor(() => {
      const secondWord = screen.getByTestId('card-word').textContent
      expect(secondWord).not.toBe(firstWord)
    })
  })

  it('switches between hide-meaning and hide-word modes', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument()
    })

    expect(screen.getByText('탭하여 뜻 보기')).toBeInTheDocument()

    fireEvent.click(screen.getByText('단어 가리기'))

    await waitFor(() => {
      expect(screen.getByText('탭하여 단어 보기')).toBeInTheDocument()
    })
  })
})

describe('Level Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all level buttons', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('level-selector')).toBeInTheDocument()
    })

    expect(screen.getByTestId('level-A1')).toBeInTheDocument()
    expect(screen.getByTestId('level-A2')).toBeInTheDocument()
    expect(screen.getByTestId('level-B1')).toBeInTheDocument()
    expect(screen.getByTestId('level-B2')).toBeInTheDocument()
    expect(screen.getByTestId('level-C1')).toBeInTheDocument()
    expect(screen.getByTestId('level-C2')).toBeInTheDocument()
  })

  it('defaults to A1 level', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('level-A1')).toBeInTheDocument()
    })

    const a1Button = screen.getByTestId('level-A1')
    expect(a1Button).toHaveClass('bg-green-500', 'text-white')
  })

  it('changes level when level button is clicked', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('level-B1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('level-B1'))

    await waitFor(() => {
      const b1Button = screen.getByTestId('level-B1')
      expect(b1Button).toHaveClass('bg-yellow-500', 'text-white')
    })
  })

  it('fetches words when level changes', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('level-B2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('level-B2'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/vocabulary/level/B2')
      )
    })
  })
})

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('has back link to /talk', async () => {
    render(<CardsPage />)

    await waitFor(() => {
      const backLink = document.querySelector('a[href="/talk"]')
      expect(backLink).toBeInTheDocument()
    })
  })

  it('renders practice link in expanded content', async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          idioms: [{ phrase: 'test idiom', meaning: 'test meaning' }],
          sentences: [],
        }),
      })

    render(<CardsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('flashcard'))

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))

    await waitFor(() => {
      expect(screen.getByTestId('expanded-content')).toBeInTheDocument()
      const practiceLink = screen.getByText('이 단어로 대화 연습하기')
      expect(practiceLink).toBeInTheDocument()
      expect(practiceLink.closest('a')).toHaveAttribute('href', expect.stringContaining('/talk?context=vocabulary'))
    })
  })
})
