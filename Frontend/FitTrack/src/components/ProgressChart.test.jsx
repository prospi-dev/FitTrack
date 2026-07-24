import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProgressChart from './ProgressChart'

// One session on a given date with a single bench-press set.
const session = (date, weight, reps = 8) => ({
  id: date,
  date,
  routineId: 1,
  routineName: 'Push day',
  exercises: [
    { id: 1, exerciseId: 100, exerciseName: 'Bench Press', setNumber: 1, repsCompleted: reps, weightKg: weight },
  ],
})

describe('ProgressChart', () => {
  it('plots a line once an exercise has 2+ sessions', () => {
    const sessions = [
      session('2026-07-01T10:00:00Z', 60),
      session('2026-07-08T10:00:00Z', 65),
      session('2026-07-15T10:00:00Z', 70),
    ]
    const { container } = render(<ProgressChart sessions={sessions} />)

    // Exercise is selectable and the line path is drawn.
    expect(screen.getByRole('option', { name: 'Bench Press' })).toBeInTheDocument()
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
    // aria-label summarises the trend (60 → 70 kg).
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('from 60 to 70 kg')
    )
  })

  it('switches the plotted metric between top set and volume', async () => {
    const user = userEvent.setup()
    const sessions = [
      session('2026-07-01T10:00:00Z', 60, 10),
      session('2026-07-08T10:00:00Z', 60, 10),
    ]
    render(<ProgressChart sessions={sessions} />)

    // Default: Top set → 60 kg.
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('from 60 to 60 kg')
    )

    await user.click(screen.getByRole('button', { name: 'Volume' }))

    // Volume = 60 kg × 10 reps = 600.
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('from 600 to 600 kg')
    )
  })

  it('asks for more data when the exercise has a single session', () => {
    render(<ProgressChart sessions={[session('2026-07-01T10:00:00Z', 60)]} />)
    expect(screen.getByText(/at least 2 sessions/i)).toBeInTheDocument()
  })

  it('shows a global empty state when nothing has been logged', () => {
    render(<ProgressChart sessions={[]} />)
    expect(screen.getByText(/no progress to chart yet/i)).toBeInTheDocument()
  })
})
