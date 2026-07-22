import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutinesPage from './RoutinesPage'
import { getRoutines, updateRoutineExercise } from '../../api/routines'
import { getExercises } from '../../api/exercises'

vi.mock('../../api/routines')
vi.mock('../../api/exercises')

// Two entries whose stored orders are already gapped — adding uses length + 1 and
// removing leaves a hole, so this is what real data looks like after some editing.
const routine = () => ({
  id: 1,
  name: 'Push day',
  description: '',
  exercises: [
    { id: 10, exerciseId: 100, exerciseName: 'Bench press', order: 1, sets: 3, reps: 8, weightKg: 60 },
    { id: 11, exerciseId: 101, exerciseName: 'Overhead press', order: 4, sets: 3, reps: 10, weightKg: 30 },
  ],
})

const expandRoutine = async (user) => {
  render(<RoutinesPage />)
  await screen.findByText('Push day')
  await user.click(screen.getByText('Push day'))
}

const listedExerciseNames = () =>
  screen.getAllByLabelText(/^Remove /).map(btn => btn.getAttribute('aria-label').replace('Remove ', ''))

describe('RoutinesPage reordering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getRoutines.mockResolvedValue({ data: [routine()] })
    getExercises.mockResolvedValue({ data: [] })
    updateRoutineExercise.mockResolvedValue({ data: {} })
  })

  it('moves an exercise down and renumbers both entries', async () => {
    const user = userEvent.setup()
    await expandRoutine(user)

    expect(listedExerciseNames()).toEqual(['Bench press', 'Overhead press'])

    await user.click(screen.getByLabelText('Move Bench press down'))

    await waitFor(() => {
      expect(listedExerciseNames()).toEqual(['Overhead press', 'Bench press'])
    })

    // Both entries changed position, so both are persisted with contiguous orders —
    // the gapped order 4 is healed rather than swapped.
    expect(updateRoutineExercise).toHaveBeenCalledTimes(2)
    expect(updateRoutineExercise).toHaveBeenCalledWith(1, 11, { order: 1 })
    expect(updateRoutineExercise).toHaveBeenCalledWith(1, 10, { order: 2 })
  })

  it('disables the arrows at the ends of the list', async () => {
    const user = userEvent.setup()
    await expandRoutine(user)

    expect(screen.getByLabelText('Move Bench press up')).toBeDisabled()
    expect(screen.getByLabelText('Move Overhead press down')).toBeDisabled()
    expect(screen.getByLabelText('Move Bench press down')).toBeEnabled()
  })

  it('restores the previous order when the API rejects', async () => {
    updateRoutineExercise.mockRejectedValue(new Error('boom'))
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    const user = userEvent.setup()
    await expandRoutine(user)

    await user.click(screen.getByLabelText('Move Bench press down'))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to reorder exercises.')
    })
    expect(listedExerciseNames()).toEqual(['Bench press', 'Overhead press'])
  })
})
