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
  default: ({ mode, practiceExpression, scenarioId }: { mode?: string; practiceExpression?: { expression: string; meaning: string }; scenarioId?: string }) => (
    <div 
      data-testid="chat-window" 
      data-mode={mode || 'free'}
      data-practice-expression={practiceExpression?.expression || ''}
      data-scenario-id={scenarioId || ''}
    >
      ChatWindow (mode: {mode || 'free'})
      {practiceExpression && <span data-testid="practice-mode">Practice: {practiceExpression.expression}</span>}
      {scenarioId && <span data-testid="roleplay-scenario">Scenario: {scenarioId}</span>}
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
    mockSearchParams.set('mode', 'invalid')

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const freeButton = screen.getByText('자유 대화')
      expect(freeButton).toHaveClass('bg-[#1a1a1a]', 'text-white')
    })
  })
})

describe('Expression Practice Mode', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    vi.clearAllMocks()
    mockSearchParams.delete('mode')
    mockSearchParams.delete('expression')
    mockSearchParams.delete('meaning')
    
    global.fetch = vi.fn()
  })

  afterEach(() => {
    sessionStorageMock.clear()
    vi.restoreAllMocks()
  })

  it('fetches expression when switching to expression mode', async () => {
    const mockExpression = {
      expression: 'break the ice',
      meaning: '어색한 분위기를 깨다',
    }
    
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExpression),
    })

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('오늘의 표현')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('오늘의 표현'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rag/daily-expression')
      )
    })
  })

  it('shows expression card when in expression mode', async () => {
    const mockExpression = {
      expression: 'break the ice',
      meaning: '어색한 분위기를 깨다',
    }
    
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExpression),
    })

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('오늘의 표현'))

    await waitFor(() => {
      expect(screen.getByTestId('expression-card')).toBeInTheDocument()
      expect(screen.getByTestId('expression-text')).toHaveTextContent('break the ice')
      expect(screen.getByTestId('expression-meaning')).toHaveTextContent('어색한 분위기를 깨다')
    })
  })

  it('shows refresh button that fetches new expression', async () => {
    const mockExpression1 = { expression: 'break the ice', meaning: '어색한 분위기를 깨다' }
    const mockExpression2 = { expression: 'piece of cake', meaning: '아주 쉬운 일' }
    
    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockExpression1) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockExpression2) })

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('오늘의 표현'))

    await waitFor(() => {
      expect(screen.getByTestId('refresh-expression-btn')).toBeInTheDocument()
    })

    const callCountBeforeRefresh = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length
    
    fireEvent.click(screen.getByTestId('refresh-expression-btn'))

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
      expect(calls.length).toBeGreaterThan(callCountBeforeRefresh)
      const lastCall = calls[calls.length - 1][0] as string
      expect(lastCall).toContain('random=')
    })
  })

  it('passes practiceExpression to ChatWindow when expression is loaded', async () => {
    const mockExpression = {
      expression: 'hit the nail on the head',
      meaning: '정곡을 찌르다',
    }
    
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExpression),
    })

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('오늘의 표현'))

    await waitFor(() => {
      const chatWindow = screen.getByTestId('chat-window')
      expect(chatWindow).toHaveAttribute('data-practice-expression', 'hit the nail on the head')
      expect(screen.getByTestId('practice-mode')).toHaveTextContent('Practice: hit the nail on the head')
    })
  })

  it('uses fallback expression when API fails', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('오늘의 표현'))

    await waitFor(() => {
      expect(screen.getByTestId('expression-card')).toBeInTheDocument()
      expect(screen.getByTestId('expression-text')).toBeInTheDocument()
    })
  })

  it('does not show expression card in free mode', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('expression-card')).not.toBeInTheDocument()
  })
})

describe('Roleplay Mode', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    vi.clearAllMocks()
    mockSearchParams.delete('mode')
    mockSearchParams.delete('scenario')
  })

  afterEach(() => {
    sessionStorageMock.clear()
  })

  it('shows ScenarioSelector when roleplay mode selected and no scenario', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-selector-container')).toBeInTheDocument()
      expect(screen.getByText('시나리오 선택')).toBeInTheDocument()
    })
  })

  it('renders all 6 built-in scenarios in selector', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-cafe_order')).toBeInTheDocument()
      expect(screen.getByTestId('scenario-hotel_checkin')).toBeInTheDocument()
      expect(screen.getByTestId('scenario-restaurant_order')).toBeInTheDocument()
      expect(screen.getByTestId('scenario-airport_checkin')).toBeInTheDocument()
      expect(screen.getByTestId('scenario-shopping')).toBeInTheDocument()
      expect(screen.getByTestId('scenario-job_interview')).toBeInTheDocument()
    })
  })

  it('shows ChatWindow with scenarioId when scenario is selected', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-cafe_order')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('scenario-cafe_order'))

    await waitFor(() => {
      const chatWindow = screen.getByTestId('chat-window')
      expect(chatWindow).toHaveAttribute('data-mode', 'roleplay')
      expect(chatWindow).toHaveAttribute('data-scenario-id', 'cafe_order')
    })
  })

  it('shows roleplay header with scenario title when scenario selected', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-cafe_order')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('scenario-cafe_order'))

    await waitFor(() => {
      expect(screen.getByTestId('roleplay-header')).toBeInTheDocument()
      expect(screen.getByTestId('roleplay-title')).toHaveTextContent('카페 주문')
    })
  })

  it('shows change scenario button when scenario selected', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-cafe_order')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('scenario-cafe_order'))

    await waitFor(() => {
      expect(screen.getByTestId('change-scenario-btn')).toBeInTheDocument()
      expect(screen.getByTestId('change-scenario-btn')).toHaveTextContent('다른 시나리오')
    })
  })

  it('resets to ScenarioSelector when change scenario button clicked', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-cafe_order')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('scenario-cafe_order'))

    await waitFor(() => {
      expect(screen.getByTestId('change-scenario-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('change-scenario-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-selector-container')).toBeInTheDocument()
      expect(screen.queryByTestId('roleplay-header')).not.toBeInTheDocument()
    })
  })

  it('hides ChatWindow when no scenario selected in roleplay mode', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-selector-container')).toBeInTheDocument()
      expect(screen.queryByTestId('chat-window')).not.toBeInTheDocument()
    })
  })

  it('shows stage indicator in roleplay header', async () => {
    render(
      <TestWrapper>
        <TalkPage />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('롤플레이'))

    await waitFor(() => {
      expect(screen.getByTestId('scenario-cafe_order')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('scenario-cafe_order'))

    await waitFor(() => {
      expect(screen.getByTestId('roleplay-stage')).toBeInTheDocument()
      expect(screen.getByTestId('roleplay-stage')).toHaveTextContent(/Stage \d+\/\d+/)
    })
  })

  it('loads scenario from URL params', async () => {
    mockSearchParams.set('mode', 'roleplay')
    mockSearchParams.set('scenario', 'hotel_checkin')

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
})
