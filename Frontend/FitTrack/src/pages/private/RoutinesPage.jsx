import { useState } from 'react'
import {
  getRoutines, createRoutine, updateRoutine, deleteRoutine,
  addExerciseToRoutine, updateRoutineExercise, removeExerciseFromRoutine
} from '../../api/routines'
import { getExercises } from '../../api/exercises'
import { useFetch } from '../../hooks/useFetch'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function RoutinesPage() {
  const { data, loading, error, setData } = useFetch(
    () => Promise.all([getRoutines(), getExercises()])
      .then(([routinesRes, exercisesRes]) => ({ routines: routinesRes.data, exercises: exercisesRes.data })),
    [], { routines: [], exercises: [] }
  )
  const routines = data.routines
  const exercises = data.exercises // full catalogue for the picker
  const setRoutines = (updater) => setData(prev => ({
    ...prev,
    routines: typeof updater === 'function' ? updater(prev.routines) : updater,
  }))

  // Which routine card is expanded (showing its exercises)
  const [expandedId, setExpandedId] = useState(null)

  // Modal state — null=closed, 'create'=new routine, routine object=edit routine
  const [routineModal, setRoutineModal] = useState(null)

  // Exercise picker modal — null=closed, routineId=open for that routine
  const [pickerRoutineId, setPickerRoutineId] = useState(null)

  // Edit exercise entry modal — null=closed, entry object=open
  const [editEntry, setEditEntry] = useState(null)

  const handleDeleteRoutine = async (id) => {
    if (!confirm('Delete this routine?')) return
    try {
      await deleteRoutine(id)
      setRoutines(prev => prev.filter(r => r.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch {
      alert('Failed to delete routine.')
    }
  }

  const handleRemoveExercise = async (routineId, entryId) => {
    try {
      await removeExerciseFromRoutine(routineId, entryId)
      setRoutines(prev => prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.filter(e => e.id !== entryId) }
          : r
      ))
    } catch {
      alert('Failed to remove exercise.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Button onClick={() => setRoutineModal('create')}>
          + New
        </Button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && <p className="text-red-400 text-sm">Failed to load data.</p>}

      {!loading && !error && (
        <>
          {routines.length === 0 ? (
            <p className="text-gray-400 text-sm">No routines yet. Create your first one!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {routines.map(routine => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  isExpanded={expandedId === routine.id}
                  onToggle={() => setExpandedId(prev => prev === routine.id ? null : routine.id)}
                  onEdit={() => setRoutineModal(routine)}
                  onDelete={() => handleDeleteRoutine(routine.id)}
                  onAddExercise={() => setPickerRoutineId(routine.id)}
                  onEditEntry={(entry) => setEditEntry({ ...entry, routineId: routine.id })}
                  onRemoveEntry={(entryId) => handleRemoveExercise(routine.id, entryId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create / Edit routine modal */}
      {routineModal && (
        <RoutineModal
          routine={routineModal === 'create' ? null : routineModal}
          onClose={() => setRoutineModal(null)}
          onSaved={(saved, isNew) => {
            if (isNew) {
              setRoutines(prev => [...prev, saved])
            } else {
              setRoutines(prev => prev.map(r => r.id === saved.id ? { ...r, ...saved } : r))
            }
            setRoutineModal(null)
          }}
        />
      )}

      {/* Add exercise to routine picker modal */}
      {pickerRoutineId && (
        <ExercisePickerModal
          exercises={exercises}
          routineId={pickerRoutineId}
          currentExercises={routines.find(r => r.id === pickerRoutineId)?.exercises ?? []}
          onClose={() => setPickerRoutineId(null)}
          onAdded={(routineId, newEntry) => {
            setRoutines(prev => prev.map(r =>
              r.id === routineId
                ? { ...r, exercises: [...r.exercises, newEntry] }
                : r
            ))
          }}
        />
      )}

      {/* Edit exercise entry modal */}
      {editEntry && (
        <EditEntryModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onSaved={(updated) => {
            setRoutines(prev => prev.map(r =>
              r.id === updated.routineId
                ? { ...r, exercises: r.exercises.map(e => e.id === updated.id ? updated : e) }
                : r
            ))
            setEditEntry(null)
          }}
        />
      )}
    </div>
  )
}

// Routine Card 
function RoutineCard({ routine, isExpanded, onToggle, onEdit, onDelete, onAddExercise, onEditEntry, onRemoveEntry }) {
  return (
    <Card padding="" className="overflow-hidden">
      {/* Card header — always visible */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <button
          onClick={onToggle}
          className="flex-1 text-left min-w-0"
        >
          <p className="font-medium text-white truncate">{routine.name}</p>
          {routine.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{routine.description}</p>
          )}
          <p className="text-xs text-gray-600 mt-0.5">
            {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
            {' · '}
            <span className={isExpanded ? 'text-blue-400' : 'text-gray-500'}>
              {isExpanded ? 'collapse ▲' : 'expand ▼'}
            </span>
          </p>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={onEdit} variant="secondary" size="sm">
            Edit
          </Button>
          <Button onClick={onDelete} variant="danger" size="sm">
            Delete
          </Button>
        </div>
      </div>

      {/* Expanded exercise list */}
      {isExpanded && (
        <div className="border-t border-gray-800 px-4 py-3 flex flex-col gap-2">
          {routine.exercises.length === 0 ? (
            <p className="text-gray-500 text-sm">No exercises yet.</p>
          ) : (
            routine.exercises.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 bg-gray-800 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    <span className="text-gray-500 mr-1">{index + 1}.</span>
                    {entry.exerciseName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.sets} sets · {entry.reps} reps
                    {entry.weightKg ? ` · ${entry.weightKg}kg` : ' · bodyweight'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onRemoveEntry(entry.id)}
                    aria-label={`Remove ${entry.exerciseName}`}
                    className="text-xs text-red-400 hover:text-white bg-gray-700 hover:bg-red-600 px-2 py-1 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add exercise button at the bottom of the list */}
          <button
            onClick={onAddExercise}
            className="mt-1 w-full text-sm text-blue-400 hover:text-white border border-dashed border-blue-500/40 hover:border-blue-500 hover:bg-blue-500/10 rounded-lg py-2 transition"
          >
            + Add exercise
          </button>
        </div>
      )}
    </Card>
  )
}

// Routine Modal (Create / Edit)
function RoutineModal({ routine, onClose, onSaved }) {
  const isEdit = !!routine
  const [form, setForm] = useState({
    name: routine?.name ?? '',
    description: routine?.description ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = { ...form, description: form.description.trim() || null }
    try {
      if (isEdit) {
        await updateRoutine(routine.id, payload)
        onSaved({ ...routine, ...payload }, false)
      } else {
        const res = await createRoutine(payload)
        onSaved(res.data, true)
      }
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'string' ? data : data?.title ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Routine' : 'New Routine'}</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Description <span className="text-gray-500">(optional)</span></label>
            <textarea
              rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" onClick={onClose} variant="secondary" size="modal">Cancel</Button>
            <Button type="submit" disabled={loading} size="modal">
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Exercise Picker Modal 
// Shows the full exercise catalogue. User picks one and fills in sets/reps/weight.
function ExercisePickerModal({ exercises, routineId, currentExercises, onClose, onAdded }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // the exercise object picked
  const [form, setForm] = useState({ sets: '', reps: '', weightKg: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // IDs already in this routine — to show a visual indicator
  const existingIds = new Set(currentExercises.map(e => e.exerciseId))

  const filtered = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscleGroups.some(mg => mg.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        exerciseId: selected.id,
        order: currentExercises.length + 1, // append at end
        sets: parseInt(form.sets),
        reps: parseInt(form.reps),
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      }
      const response = await addExerciseToRoutine(routineId, payload)
      // Use the persisted entry (with its real DB-generated id) returned by
      // the backend to update local state without refetching.
      const newEntry = {
        id: response.data.id,
        exerciseId: response.data.exerciseId,
        exerciseName: response.data.exerciseName,
        muscleGroup: response.data.muscleGroup,
        order: response.data.order,
        sets: response.data.sets,
        reps: response.data.reps,
        weightKg: response.data.weightKg,
      }
      onAdded(routineId, newEntry)
      onClose()
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'string' ? data : data?.title ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold mb-3">Add Exercise</h2>
          {!selected && (
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
              autoFocus
            />)}
        </div>

        {/* Step 1 — pick an exercise */}
        {!selected ? (
          <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2">
            {filtered.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No exercises found.</p>
            )}
            {filtered.map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelected(ex)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition
                  ${existingIds.has(ex.id)
                    ? 'border-blue-500/30 bg-blue-500/5 opacity-60'
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  }`}
              >
                <div>
                  <p className="text-sm font-medium text-white">{ex.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ex.muscleGroups.map(mg => (
                      <span key={mg} className="text-xs text-blue-400">{mg}</span>
                    ))}
                  </div>
                </div>
                {existingIds.has(ex.id) && (
                  <span className="text-xs text-blue-400 shrink-0 ml-2">Added</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          // Step 2 — fill in sets/reps/weight
          <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{selected.name}</p>
                <p className="text-xs text-blue-400 mt-0.5">{selected.muscleGroups.join(', ')}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="ml-auto text-xs text-gray-400 hover:text-white transition">
                ← Back
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Sets</label>
                <input
                  type="number" min="1" required
                  value={form.sets}
                  onChange={e => setForm({ ...form, sets: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Reps</label>
                <input
                  type="number" min="1" required
                  value={form.reps}
                  onChange={e => setForm({ ...form, reps: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Weight (kg) <span className="text-gray-500">(optional — leave empty for bodyweight)</span></label>
              <input
                type="number" min="0" step="0.5"
                value={form.weightKg}
                onChange={e => setForm({ ...form, weightKg: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={onClose} variant="secondary" size="modal">Cancel</Button>
              <Button type="submit" disabled={loading} size="modal">
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// Edit Entry Modal 
// Edit sets/reps/weight of an existing RoutineExercise entry.
function EditEntryModal({ entry, onClose, onSaved }) {
  const [form, setForm] = useState({
    sets: entry.sets,
    reps: entry.reps,
    weightKg: entry.weightKg ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        sets: parseInt(form.sets),
        reps: parseInt(form.reps),
        weightKg: form.weightKg !== '' ? parseFloat(form.weightKg) : null,
      }
      await updateRoutineExercise(entry.routineId, entry.id, payload)
      onSaved({ ...entry, ...payload })
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'string' ? data : data?.title ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">Edit Exercise</h2>
        <p className="text-sm text-blue-400 mb-4">{entry.exerciseName}</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Sets</label>
              <input
                type="number" min="1" required
                value={form.sets}
                onChange={e => setForm({ ...form, sets: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Reps</label>
              <input
                type="number" min="1" required
                value={form.reps}
                onChange={e => setForm({ ...form, reps: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Weight (kg) <span className="text-gray-500">(optional)</span></label>
            <input
              type="number" min="0" step="0.5"
              value={form.weightKg}
              onChange={e => setForm({ ...form, weightKg: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" onClick={onClose} variant="secondary" size="modal">Cancel</Button>
            <Button type="submit" disabled={loading} size="modal">
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}