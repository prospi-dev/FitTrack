import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorkoutSessionsPage from './WorkoutSessionsPage'
import { getSessions, updateSession } from '../../api/workoutSessions'
import { getRoutines } from '../../api/routines'

vi.mock('../../api/workoutSessions')
vi.mock('../../api/routines')

const session = () => ({
  id: 7,
  date: '2026-07-20T10:00:00.000Z',
  routineId: 1,
  routineName: 'Push day',
  exercises: [
    { id: 70, exerciseId: 100, exerciseName: 'Bench press', setNumber: 1, repsCompleted: 8, weightKg: 60 },
    { id: 71, exerciseId: 100, exerciseName: 'Bench press', setNumber: 2, repsCompleted: 6, weightKg: 60 },
  ],
})

const routine = () => ({
  id: 1,
  name: 'Push day',
  exercises: [{ id: 10, exerciseId: 100, exerciseName: 'Bench press', sets: 2, reps: 8, weightKg: 60 }],
})

describe('WorkoutSessionsPage editing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessions.mockResolvedValue({ data: [session()] })
    getRoutines.mockResolvedValue({ data: [routine()] })
    updateSession.mockResolvedValue({ data: {} })
  })

  it('opens the logger prefilled with the logged sets, skipping routine choice', async () => {
    const user = userEvent.setup()
    render(<WorkoutSessionsPage />)

    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    expect(screen.getByText('Edit — Push day')).toBeInTheDocument()
    expect(screen.queryByText('Choose Routine')).not.toBeInTheDocument()

    const reps = screen.getAllByLabelText('Reps')
    expect(reps.map(i => i.value)).toEqual(['8', '6'])
    expect(screen.getAllByLabelText('Weight (kg)').map(i => i.value)).toEqual(['60', '60'])
  })

  it('saves a corrected set through the update endpoint', async () => {
    const user = userEvent.setup()
    render(<WorkoutSessionsPage />)

    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    const secondSetReps = screen.getAllByLabelText('Reps')[1]
    await user.clear(secondSetReps)
    await user.type(secondSetReps, '7')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(updateSession).toHaveBeenCalledTimes(1))
    const [id, payload] = updateSession.mock.calls[0]
    expect(id).toBe(7)
    expect(payload.routineId).toBe(1)
    expect(payload.exercises).toEqual([
      { exerciseId: 100, setNumber: 1, repsCompleted: 8, weightKg: 60 },
      { exerciseId: 100, setNumber: 2, repsCompleted: 7, weightKg: 60 },
    ])

    // The card reflects the correction without a refetch.
    await waitFor(() => expect(screen.queryByText('Save changes')).not.toBeInTheDocument())
    await user.click(screen.getByText('Push day routine'))
    expect(screen.getByText('7 reps · 60kg')).toBeInTheDocument()
  })
})
