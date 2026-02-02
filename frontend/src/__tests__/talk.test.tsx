import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock next/navigation
const mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/talk',
}))

// Mock TTS context
vi.mock('@/contexts/TTSContext', () => ({
  useTTS: () => ({
    speakWithCallback: vi.fn(),
    isSpeaking: false,
    stop: vi.fn(),
  }),
}))

// Mock ConversationSettingsContext
vi.mock('@/contexts/ConversationSettingsContext', () => ({
  useConversationSettings: () => ({
    settings: {
      autoTTS: false,
      autoRecord: false,
      inputMode: 'both',
    },
  }),
}))

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Import components after mocks
import { TalkProvider } from '@/contexts/TalkContext'

// Mock ChatWindow to avoid complex dependencies
vi.mock('@/components/ChatWindow', () => ({
  default: ({ mode, practiceExpression }: { mode?: string; practiceExpression?: { expression: string; meaning: string } }) => (
    <div 
      data-testid="chat-window" 
      data-mode={mode || 'free'}
      data-practice-expression={practiceExpression?.expression || ''}
    >
      ChatWindow (mode: {mode || 'free'})
      {practiceExpression && <span data-testid="practice-mode">Practice: {practiceExpression.expression}</span>}
    </div>
  ),
}))

// Import the page component
import TalkPage from '@/app/talk/page'

// Wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <TalkProvider>{children}</TalkProvider>
}

describe('Talk Page', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    vi.clearAllMocks()
    // Reset searchParams
    mockSearchParams.delete('mode')
    mockSearchParams.delete('expression')
    mockSearchParams.delete('meaning')
    mockSearchParams.delete('scenario')
  })

  afterEach(() => {
    sessionStorageMock.clear()
  })

  it('renders ModeSelector component', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('자유 대화')).toBeInTheDocument()
      expect(screen.getByText('오늘의 표현')).toBeInTheDocument()
      expect(screen.getByText('롤플레이')).toBeInTheDocument()
    })
  })

  it('renders ChatWindow component', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument()
    })
  })

  it('defaults to free mode', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const chatWindow = screen.getByTestId('chat-window')
      expect(chatWindow).toHaveAttribute('data-mode', 'free')
    })

    // Verify '자유 대화' button is active
    const freeButton = screen.getByText('자유 대화')
    expect(freeButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
  })

  it('changes mode when clicking mode selector', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('오늘의 표현')).toBeInTheDocument()
    })

    // Click '오늘의 표현' button
    fireEvent.click(screen.getByText('오늘의 표현'))

    await waitFor(() => {
      const expressionButton = screen.getByText('오늘의 표현')
      expect(expressionButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
    })
  })

  it('clears conversation when mode changes', async () => {
    // Set initial mode to expression
    sessionStorageMock.setItem('enpeak-talk-mode', 'expression')

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const expressionButton = screen.getByText('오늘의 표현')
      expect(expressionButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
    })

    // Change to roleplay mode
    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      // After clearConversation, mode should be set to the new mode
      const roleplayButton = screen.getByText('롤플레이')
      expect(roleplayButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
    })
  })

  it('renders header with back link', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Talk')).toBeInTheDocument()
    })

    // Check back link exists
    const backLink = document.querySelector('a[href="/"]')
    expect(backLink).toBeInTheDocument()
  })
})

describe('Free Chat Mode', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    vi.clearAllMocks()
    mockSearchParams.delete('mode')
  })

  afterEach(() => {
    sessionStorageMock.clear()
  })

  it('passes mode="free" to ChatWindow when 자유 대화 selected', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const chatWindow = screen.getByTestId('chat-window')
      expect(chatWindow).toHaveAttribute('data-mode', 'free')
    })
  })

  it('maintains free mode when ?mode=free URL param is provided', async () => {
    mockSearchParams.set('mode', 'free')

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const chatWindow = screen.getByTestId('chat-window')
      expect(chatWindow).toHaveAttribute('data-mode', 'free')
    })

    // Verify '자유 대화' button is active
    const freeButton = screen.getByText('자유 대화')
    expect(freeButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
  })
})

describe('Talk Page URL Parameters', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorageMock.clear()
    mockSearchParams.delete('mode')
    mockSearchParams.delete('expression')
    mockSearchParams.delete('meaning')
    mockSearchParams.delete('scenario')
  })

  it('sets expression mode from URL params', async () => {
    // Set URL params
    mockSearchParams.set('mode', 'expression')
    mockSearchParams.set('expression', 'break the ice')
    mockSearchParams.set('meaning', 'start conversation')

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const expressionButton = screen.getByText('오늘의 표현')
      expect(expressionButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
    })
  })

  it('sets roleplay mode from URL params', async () => {
    // Set URL params
    mockSearchParams.set('mode', 'roleplay')
    mockSearchParams.set('scenario', 'cafe_order')

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const roleplayButton = screen.getByText('롤플레이')
      expect(roleplayButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
    })
  })

  it('ignores invalid mode from URL params', async () => {
    // Set invalid mode
    mockSearchParams.set('mode', 'invalid')

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      // Should stay on default (free) mode
      const freeButton = screen.getByText('자유 대화')
      expect(freeButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
    })
  })
})
