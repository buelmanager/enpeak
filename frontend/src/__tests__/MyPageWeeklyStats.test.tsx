import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/my',
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    cachedUser: null,
    loading: false,
  }),
}));

vi.mock('@/lib/firebase', () => ({
  logOut: vi.fn(),
}));

vi.mock('@/contexts/TTSContext', () => ({
  useTTS: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    isSpeaking: false,
    settings: {},
    updateSettings: vi.fn(),
    voices: [],
  }),
}));

const mockGetWeeklyActivity = vi.fn();
const mockGetWeeklyStats = vi.fn();
const mockGetStats = vi.fn();

vi.mock('@/lib/learningHistory', () => ({
  getWeeklyActivity: () => mockGetWeeklyActivity(),
  getWeeklyStats: () => mockGetWeeklyStats(),
  getStats: () => mockGetStats(),
}));

import MyPage from '@/app/my/page';

describe('MyPage Weekly Stats Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWeeklyActivity.mockReturnValue([true, true, false, true, false, false, false]);
    mockGetWeeklyStats.mockReturnValue({
      totalSessions: 10,
      totalDays: 3,
      vocabularyWords: 25,
      conversations: 5,
      chatSessions: 2,
    });
    mockGetStats.mockReturnValue({
      totalSessions: 0,
      totalMinutes: 0,
      vocabularyWords: 0,
      conversationScenarios: 0,
      streak: 5,
    });
  });

  it('renders weekly stats section with correct title', () => {
    render(<MyPage />);
    expect(screen.getByText('이번 주 학습')).toBeInTheDocument();
  });

  it('renders all 7 day labels (Mon-Sun)', () => {
    render(<MyPage />);
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    dayLabels.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('renders stats summary with correct values', () => {
    render(<MyPage />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('학습일')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('단어')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('회화')).toBeInTheDocument();
  });

  it('renders streak when streak > 0', () => {
    render(<MyPage />);
    expect(screen.getByText('5일째')).toBeInTheDocument();
    expect(screen.getAllByText('연속')[0]).toBeInTheDocument();
    expect(screen.getAllByText('학습 중')[0]).toBeInTheDocument();
  });

  it('does not render streak when streak is 0', () => {
    mockGetStats.mockReturnValue({
      totalSessions: 0,
      totalMinutes: 0,
      vocabularyWords: 0,
      conversationScenarios: 0,
      streak: 0,
    });
    render(<MyPage />);
    expect(screen.queryByText('일째')).not.toBeInTheDocument();
  });

  it('renders checkmarks for active days', () => {
    const { container } = render(<MyPage />);
    const checkmarks = container.querySelectorAll('svg.w-4.h-4.text-white');
    expect(checkmarks.length).toBe(3);
  });
});
