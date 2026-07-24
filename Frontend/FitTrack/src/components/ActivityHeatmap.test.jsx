import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityHeatmap from './ActivityHeatmap'

// Session `n` weeks before now (empty exercises are fine — only the date matters).
const weeksAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  return { date: d.toISOString(), exercises: [] }
}

describe('ActivityHeatmap', () => {
  it('counts the current consecutive-week streak', () => {
    render(<ActivityHeatmap sessions={[weeksAgo(0), weeksAgo(1), weeksAgo(2)]} />)
    expect(screen.getByText('week streak')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // this week + the prior two
  })

  it('breaks the streak when a week is missed', () => {
    // this week + 3 weeks ago (a gap at week 1 and 2) → streak of 1
    render(<ActivityHeatmap sessions={[weeksAgo(0), weeksAgo(3)]} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('handles no sessions', () => {
    render(<ActivityHeatmap sessions={[]} />)
    expect(screen.getByText(/0 training days logged/)).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
