import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScenarioSelector, BUILT_IN_SCENARIOS } from '../components/ScenarioSelector'

describe('ScenarioSelector', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders 6 built-in scenarios', () => {
    render(<ScenarioSelector onSelect={mockOnSelect} />)

    expect(screen.getByTestId('scenario-cafe_order')).toBeInTheDocument()
    expect(screen.getByTestId('scenario-hotel_checkin')).toBeInTheDocument()
    expect(screen.getByTestId('scenario-restaurant_order')).toBeInTheDocument()
    expect(screen.getByTestId('scenario-airport_checkin')).toBeInTheDocument()
    expect(screen.getByTestId('scenario-shopping')).toBeInTheDocument()
    expect(screen.getByTestId('scenario-job_interview')).toBeInTheDocument()
  })

  it('displays correct titles for each scenario', () => {
    render(<ScenarioSelector onSelect={mockOnSelect} />)

    expect(screen.getByText('카페 주문')).toBeInTheDocument()
    expect(screen.getByText('호텔 체크인')).toBeInTheDocument()
    expect(screen.getByText('레스토랑 주문')).toBeInTheDocument()
    expect(screen.getByText('공항 체크인')).toBeInTheDocument()
    expect(screen.getByText('쇼핑')).toBeInTheDocument()
    expect(screen.getByText('영어 면접')).toBeInTheDocument()
  })

  it('displays difficulty badges', () => {
    render(<ScenarioSelector onSelect={mockOnSelect} />)

    const beginnerBadges = screen.getAllByText('Beginner')
    const intermediateBadges = screen.getAllByText('Intermediate')
    const advancedBadges = screen.getAllByText('Advanced')

    expect(beginnerBadges.length).toBe(3)
    expect(intermediateBadges.length).toBe(2)
    expect(advancedBadges.length).toBe(1)
  })

  it('calls onSelect with correct scenario when clicked', () => {
    render(<ScenarioSelector onSelect={mockOnSelect} />)

    fireEvent.click(screen.getByTestId('scenario-cafe_order'))

    expect(mockOnSelect).toHaveBeenCalledTimes(1)
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'cafe_order',
        title: '카페 주문',
        difficulty: 'Beginner',
      })
    )
  })

  it('calls onSelect with different scenario when another is clicked', () => {
    render(<ScenarioSelector onSelect={mockOnSelect} />)

    fireEvent.click(screen.getByTestId('scenario-job_interview'))

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'job_interview',
        title: '영어 면접',
        difficulty: 'Advanced',
      })
    )
  })

  it('displays section header and description', () => {
    render(<ScenarioSelector onSelect={mockOnSelect} />)

    expect(screen.getByText('시나리오 선택')).toBeInTheDocument()
    expect(screen.getByText('연습하고 싶은 상황을 선택하세요')).toBeInTheDocument()
  })

  it('exports BUILT_IN_SCENARIOS with correct count', () => {
    expect(BUILT_IN_SCENARIOS.length).toBe(6)
  })
})
