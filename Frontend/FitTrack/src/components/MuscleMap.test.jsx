import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MuscleMap from './MuscleMap'

const set = (muscleGroup) => ({ muscleGroup, setNumber: 1, repsCompleted: 8, weightKg: 60 })

describe('MuscleMap', () => {
  it('aggregates sets per muscle group from the sessions payload', () => {
    const sessions = [
      { date: '2026-07-01', exercises: [set('Chest, Triceps, FrontDelts'), set('Chest, Triceps, FrontDelts')] },
      { date: '2026-07-03', exercises: [set('Quads, Glutes, Hamstrings')] },
    ]
    render(<MuscleMap sessions={sessions} />)
    // 4 distinct groups here (Chest, Triceps, FrontDelts, Quads, Glutes, Hamstrings) = 6
    expect(screen.getByText('6 groups hit')).toBeInTheDocument()
    // Chest was hit twice → its region tooltip reflects the set count.
    expect(screen.getByText('Chest — 2 sets')).toBeInTheDocument()
    expect(screen.getByText('Quads — 1 sets')).toBeInTheDocument()
  })

  it('renders with no sessions', () => {
    render(<MuscleMap sessions={[]} />)
    expect(screen.getByText('0 groups hit')).toBeInTheDocument()
  })
})
