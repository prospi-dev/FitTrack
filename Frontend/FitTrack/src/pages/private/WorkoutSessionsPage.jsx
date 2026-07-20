import { useState, useEffect } from 'react'
import { getSessions, deleteSession, createSession } from '../../api/workoutSessions'
import { getRoutines } from '../../api/routines'

export default function WorkoutSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [showLogger, setShowLogger] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [sessionsRes, routinesRes] = await Promise.all([
        getSessions(),
        getRoutines(),
      ])
      setSessions(sessionsRes.data)
      setRoutines(routinesRes.data)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (id) => {
    if (!confirm('Delete this session?')) return
    try {
      await deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch {
      alert('Failed to delete session.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Workout Sessions</h1>
        <button
          onClick={() => setShowLogger(true)}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-sm">No sessions yet. Create your first one!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedId === session.id}
                  onToggle={() => setExpandedId(prev => prev === session.id ? null : session.id)}
                  onDelete={() => handleDeleteSession(session.id)}
                />
              ))}
            </div>
          )}

        </>
      )}
      {showLogger && (
        <WorkoutLogger
          routines={routines}
          onClose={() => setShowLogger(false)}
          onLogged={(newSession) => {
            setSessions(prev => [newSession, ...prev])
            setShowLogger(false)
          }}
        />
      )}
    </div>
  )
}

function SessionCard({ session, onToggle, onDelete, isExpanded }) {
  const sessionDate = new Date(session.date)

  // Group exercises while preserving the order of first appearance
  const grouped = []
  const seen = new Map()
  
  session.exercises.forEach(entry => {
    if (!seen.has(entry.exerciseId)) {
      const group = {
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        sets: []
      }
      seen.set(entry.exerciseId, group)
      grouped.push(group)
    }
    seen.get(entry.exerciseId).sets.push(entry)
  })

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Card header - always visible */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <button
          onClick={onToggle}
          className="flex-1 text-left min-w-0"
        >
          <p className="font-medium text-white truncate">{sessionDate.toLocaleDateString([], { year: "2-digit", month: "2-digit", day: "2-digit" })}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{session.routineName} routine</p>
          <p className="text-xs text-gray-600 mt-0.5">
            <span className={isExpanded ? 'text-blue-400' : 'text-gray-500'}>
              {isExpanded ? 'collapse ▲' : 'expand ▼'}
            </span>
          </p>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-white bg-gray-800 hover:bg-red-600 px-3 py-1.5 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Session Exercises List */}
      {isExpanded && (
        <div className="border-t border-gray-800 px-4 py-3 flex flex-col gap-2">
          {grouped.length === 0 ? (
            <p className="text-gray-500 text-sm">No exercises logged.</p>
          ) : (
            grouped.map((group, index) => (
              <div key={group.exerciseId} className="bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-white truncate">
                  <span className="text-gray-500 mr-1">{index + 1}.</span>
                  {group.exerciseName}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {group.sets.map((entry, setIndex) => (
                    <div key={entry.id} className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1">
                      <span className="text-sm text-gray-400">Set {setIndex + 1}:</span>
                      <span className="text-sm text-white">
                        {entry.repsCompleted} reps
                        {entry.weightKg ? ` · ${entry.weightKg}kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Workout Logger
// Step 1 - pick routine (or free workout)
// Step 2 - log sets for each exercise

function WorkoutLogger({ routines, onClose, onLogged }) {
  const [step, setStep] = useState(1)
  const [selectedRoutine, setSelectedRoutine] = useState(null)
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const todayLocal = new Date().toLocaleDateString('en-CA')
  const [sessionDate, setSessionDate] = useState(todayLocal)

  const handleSelectRoutine = (routine) => {
    setSelectedRoutine(routine)
    if (routine) {
      const prePopulated = routine.exercises.flatMap(ex =>
        Array.from({ length: ex.sets }, (_, i) => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          setNumber: i + 1,
          repsCompleted: ex.reps,
          weightKg: ex.weightKg ?? '',
        }))
      )
      setSets(prePopulated)
    } else {
      setSets([])
    }
    setStep(2)
  }

  const updateSet = (index, field, value) => {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const removeSet = (index) => {
    setSets(prev => prev.filter((_, i) => i !== index))
  }

  const addSet = (exerciseId, exerciseName) => {
    const existingCount = sets.filter(s => s.exerciseId === exerciseId).length
    setSets(prev => [...prev, {
      exerciseId,
      exerciseName,
      setNumber: existingCount + 1,
      repsCompleted: '',
      weightKg: '',
    }])
  }

  const handleSubmit = async () => {
    if (sets.length === 0) { setError('Add at least one set.'); return }
    setError('')
    setLoading(true)
    try {
      const payload = {
        routineId: selectedRoutine?.id ?? null,
        date: new Date(sessionDate).toISOString(),
        exercises: sets.map(s => ({
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          repsCompleted: parseInt(s.repsCompleted) || 0,
          weightKg: s.weightKg !== '' ? parseFloat(s.weightKg) : null,
        }))
      }
      const res = await createSession(payload)
      const newSession = {
        id: res.data.id,
        date: payload.date,
        routineId: selectedRoutine?.id ?? null,
        routineName: selectedRoutine?.name ?? 'Free workout',
        exercises: sets.map((s, i) => ({
          id: i,
          exerciseId: s.exerciseId,
          exerciseName: s.exerciseName,
          setNumber: s.setNumber,
          repsCompleted: parseInt(s.repsCompleted) || 0,
          weightKg: s.weightKg !== '' ? parseFloat(s.weightKg) : null,
        }))
      }
      onLogged(newSession)
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'string' ? data : data?.title ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition text-sm">←</button>
            )}
            <h2 className="text-lg font-bold">
              {step === 1 ? 'Choose Routine' : selectedRoutine?.name ?? 'Free Workout'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">✕</button>
        </div>

        {/* Step 1 — pick routine */}
        {step === 1 && (
          <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
            {routines.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-2">No routines yet — create one in the Routines tab.</p>
            )}

            {routines.map(routine => (
              <button
                key={routine.id}
                onClick={() => handleSelectRoutine(routine)}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-left transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{routine.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-gray-500 text-sm ml-2 shrink-0">→</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — log sets */}
        {step === 2 && (
          <>
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">

              {/* Date picker */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Session date</label>
                <input
                  type="date"
                  value={sessionDate}
                  max={todayLocal}
                  onChange={e => setSessionDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>
              )}

              {sets.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No sets yet. Add one below.</p>
              )}

              {sets.map((set, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">
                      {set.exerciseName}
                      <span className="text-gray-500 ml-2 font-normal text-xs">Set {set.setNumber}</span>
                    </p>
                    <button onClick={() => removeSet(index)} className="text-xs text-gray-500 hover:text-red-400 transition">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Reps</label>
                      <input
                        type="number" min="0"
                        value={set.repsCompleted}
                        onChange={e => updateSet(index, 'repsCompleted', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Weight (kg)</label>
                      <input
                        type="number" min="0" step="0.5"
                        value={set.weightKg}
                        onChange={e => updateSet(index, 'weightKg', e.target.value)}
                        placeholder="bodyweight"
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <AddSetDropdown
                routine={selectedRoutine}
                sets={sets}
                onAdd={addSet}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 shrink-0 flex gap-3">
              <button onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || sets.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Save session'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Add Set Dropdown 
function AddSetDropdown({ routine, sets, onAdd }) {
  const [open, setOpen] = useState(false)
  const [freeName, setFreeName] = useState('')

  const handleRoutineAdd = (ex) => {
    onAdd(ex.exerciseId, ex.exerciseName)
    setOpen(false)
  }

  const handleFreeAdd = () => {
    if (!freeName.trim()) return
    onAdd(0, freeName.trim())
    setFreeName('')
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-sm text-blue-400 hover:text-white border border-dashed border-blue-500/40 hover:border-blue-500 hover:bg-blue-500/10 rounded-lg py-2 transition"
      >
        + Add set
      </button>

      {open && (
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl p-3 flex flex-col gap-1">
          {routine ? (
            routine.exercises.map(ex => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleRoutineAdd(ex)}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 text-left transition"
              >
                <span className="text-sm text-white">{ex.exerciseName}</span>
                <span className="text-xs text-gray-500">
                  Set {sets.filter(s => s.exerciseId === ex.exerciseId).length + 1}
                </span>
              </button>
            ))
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Exercise name..."
                value={freeName}
                onChange={e => setFreeName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFreeAdd()}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                autoFocus
              />
              <button
                type="button"
                onClick={handleFreeAdd}
                disabled={!freeName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}