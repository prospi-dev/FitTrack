import { describe, it, expect } from 'vitest'
import { computePRs, detectNewPRs } from './prs'

const session = (date, name, weight) => ({
  date,
  exercises: [{ exerciseName: name, weightKg: weight, repsCompleted: 5, setNumber: 1 }],
})

describe('computePRs', () => {
  it('counts each beat of the prior best but not the first-ever log', () => {
    const sessions = [
      session('2026-07-01', 'Bench', 60), // baseline, not a PR
      session('2026-07-05', 'Bench', 65), // PR
      session('2026-07-10', 'Bench', 65), // ties, not a PR
      session('2026-07-15', 'Bench', 70), // PR
    ]
    // Most recent first.
    expect(computePRs(sessions).map((p) => p.weightKg)).toEqual([70, 65])
  })

  it('returns nothing when weights never improve', () => {
    expect(computePRs([session('2026-07-01', 'Bench', 60), session('2026-07-02', 'Bench', 55)])).toEqual([])
  })
})

describe('detectNewPRs', () => {
  it('flags only the sets that beat prior bests', () => {
    const prior = [session('2026-07-01', 'Bench', 60), session('2026-07-01', 'Squat', 100)]
    const now = {
      date: '2026-07-08',
      exercises: [
        { exerciseName: 'Bench', weightKg: 62.5, repsCompleted: 5, setNumber: 1 },
        { exerciseName: 'Squat', weightKg: 95, repsCompleted: 5, setNumber: 1 },
      ],
    }
    expect(detectNewPRs(prior, now)).toEqual([{ exerciseName: 'Bench', weightKg: 62.5 }])
  })

  it('does not flag a first-time exercise as a PR', () => {
    const now = { date: 'x', exercises: [{ exerciseName: 'Deadlift', weightKg: 140, repsCompleted: 5, setNumber: 1 }] }
    expect(detectNewPRs([], now)).toEqual([])
  })
})
