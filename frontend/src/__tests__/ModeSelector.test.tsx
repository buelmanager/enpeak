import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeSelector } from '../components/ModeSelector';

describe('ModeSelector', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  it('renders 3 pill buttons with correct labels', () => {
    render(<ModeSelector currentMode="free" onModeChange={mockOnModeChange} />);

    expect(screen.getByText('자유 대화')).toBeInTheDocument();
    expect(screen.getByText('오늘의 표현')).toBeInTheDocument();
    expect(screen.getByText('롤플레이')).toBeInTheDocument();
  });

  it('highlights the current mode correctly', () => {
    const { rerender } = render(
      <ModeSelector currentMode="free" onModeChange={mockOnModeChange} />
    );

    // 'free' mode should be active
    const freeButton = screen.getByText('자유 대화');
    expect(freeButton).toHaveClass('bg-[#1a1a1a]', 'text-white');

    // rerender with 'expression' mode
    rerender(<ModeSelector currentMode="expression" onModeChange={mockOnModeChange} />);
    const expressionButton = screen.getByText('오늘의 표현');
    expect(expressionButton).toHaveClass('bg-[#1a1a1a]', 'text-white');

    // rerender with 'roleplay' mode
    rerender(<ModeSelector currentMode="roleplay" onModeChange={mockOnModeChange} />);
    const roleplayButton = screen.getByText('롤플레이');
    expect(roleplayButton).toHaveClass('bg-[#1a1a1a]', 'text-white');
  });

  it('calls onModeChange with correct mode when clicked', () => {
    render(<ModeSelector currentMode="free" onModeChange={mockOnModeChange} />);

    // Click '오늘의 표현' button
    fireEvent.click(screen.getByText('오늘의 표현'));
    expect(mockOnModeChange).toHaveBeenCalledWith('expression');

    // Click '롤플레이' button
    fireEvent.click(screen.getByText('롤플레이'));
    expect(mockOnModeChange).toHaveBeenCalledWith('roleplay');

    // Click '자유 대화' button
    fireEvent.click(screen.getByText('자유 대화'));
    expect(mockOnModeChange).toHaveBeenCalledWith('free');

    expect(mockOnModeChange).toHaveBeenCalledTimes(3);
  });

  it('applies inactive styling to non-selected modes', () => {
    render(<ModeSelector currentMode="free" onModeChange={mockOnModeChange} />);

    // Inactive buttons should have outline style
    const expressionButton = screen.getByText('오늘의 표현');
    const roleplayButton = screen.getByText('롤플레이');

    expect(expressionButton).toHaveClass('bg-white', 'border');
    expect(roleplayButton).toHaveClass('bg-white', 'border');
  });
});
