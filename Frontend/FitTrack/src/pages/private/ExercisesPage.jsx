import { useState, useEffect } from 'react'
import { getExercises, createExercise, updateExercise, deleteExercise } from '../../api/exercises'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Lats',
  'LowerBack',
  'Shoulder',
  'FrontDelts',
  'SideDelts',
  'RearDelts',
  'Biceps',
  'Triceps',
  'Forearms',
  'Abs',
  'Obliques',
  'Glutes',
  'Quads',
  'Hamstrings',
  'Calves',
  'FullBody',
  'Cardio',
]

export default function ExercisesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  // Modal state — null = closed, 'create' or the exercise object = open
  const [modal, setModal] = useState(null)

  // ─── Fetch exercises on mount ────────────────────────────────────────────
  // getExercises() is a public endpoint — no token needed,
  // but axiosInstance sends it anyway if present (no harm done)
  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const res = await getExercises()
      setExercises(res.data)
    } catch {
      setError('Failed to load exercises.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Filter by search ────────────────────────────────────────────────────
  // We filter client-side since the full catalogue is small.
  // Matches against name OR muscle group.
  const filtered = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscleGroups.some(mg => mg.toLowerCase().includes(search.toLowerCase())))


  // Delete 
  const handleDelete = async (id) => {
    if (!confirm('Delete this exercise?')) return
    try {
      await deleteExercise(id)
      setExercises(prev => prev.filter(e => e.id !== id))
    } catch {
      alert('Failed to delete. It may be in use by a routine or session.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Exercises</h1>
        {isAdmin ? (
          <button
            onClick={() => setModal('create')}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Add
          </button>
        ) :
          <button
            onClick={() => navigate('/requests')}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Request Addition
          </button>
        }
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name or muscle group..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-blue-500 transition"
      />

      {/* States */}
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Exercise list */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">No exercises found.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1">
              {filtered.map(exercise => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isAdmin={isAdmin}
                  onEdit={() => setModal(exercise)}
                  onDelete={() => handleDelete(exercise.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <ExerciseModal
          exercise={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={(saved, isNew) => {
            if (isNew) {
              setExercises(prev => [...prev, saved])
            } else {
              setExercises(prev => prev.map(e => e.id === saved.id ? saved : e))
            }
            setModal(null)
          }}
        />
      )}
    </div>
  )
}

// Exercise Card 
// A single row showing exercise info.
// Admin users see edit + delete buttons.
function ExerciseCard({ exercise, isAdmin, onEdit, onDelete }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-white truncate">{exercise.name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {exercise.muscleGroups.map(mg => (
            <span key={mg} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              {mg}
            </span>
          ))}
        </div>
        {exercise.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">{exercise.description}</p>
        )}
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-white bg-gray-800 hover:bg-red-600 px-3 py-1.5 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// Exercise Modal 
// Used for both Create and Edit.
// If `exercise` prop is null → Create mode.
// If `exercise` prop has data → Edit mode, pre-fills the form.
function ExerciseModal({ exercise, onClose, onSaved }) {
  const isEdit = !!exercise

  const [form, setForm] = useState({
    name: exercise?.name ?? '',
    description: exercise?.description ?? '',
    muscleGroups: exercise?.muscleGroups ?? [], // array now
  })

  //toggle handler for checkboxes
  const toggleMuscleGroup = (mg) => {
    setForm(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(mg)
        ? prev.muscleGroups.filter(m => m !== mg)  // remove if already selected
        : [...prev.muscleGroups, mg]                // add if not selected
    }))
  }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        // Send only changed fields — matches our UpdateExerciseDto
        await updateExercise(exercise.id, form)
        // PUT returns 204 (no body), so we reconstruct the updated object
        onSaved({ ...exercise, ...form }, false)
      } else {
        const res = await createExercise(form)
        onSaved(res.data, true)
      }
    } catch (err) {
      setError(err.response?.data || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4"
    >
      {/* Modal panel — slides up from bottom on mobile (items-end),
          centered on desktop (md:items-center) */}
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6"
      >
        <h2 className="text-lg font-bold mb-4">
          {isEdit ? 'Edit Exercise' : 'New Exercise'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Muscle Groups
              {form.muscleGroups.length === 0 && (
                <span className="text-red-400 ml-2 text-xs">Pick at least one</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MUSCLE_GROUPS.map(mg => (
                <label
                  key={mg}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition
                    ${form.muscleGroups.includes(mg)
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={form.muscleGroups.includes(mg)}
                    onChange={() => toggleMuscleGroup(mg)}
                    className="hidden" // hide the native checkbox — the whole label is the toggle
                  />
                  {mg}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || form.muscleGroups.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
            >
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
