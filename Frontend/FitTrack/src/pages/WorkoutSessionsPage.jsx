import { useState, useEffect } from 'react'
import { getSessions, deleteSession, getSession, createSession } from '../api/workoutSessions'

export default function WorkoutSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [expandedId, setExpandedId] = useState(null)

  // Modal state — null=closed, 'create'=new session, session object=edit session
  const [routineModal, setRoutineModal] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [sessionsRes] = await Promise.all([
        getSessions()
      ])
      setSessions(sessionsRes.data)
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
          onClick={() => setRoutineModal('create')}
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
                  onEdit={() => setSessionModal(session)}
                  onDelete={() => handleDeleteSession(session.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SessionCard({ session, onToggle, onEdit, onDelete, isExpanded , onEditEntry, onRemoveEntry, onAddExercise}) {
  const sessionDate = new Date(session.date)

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
      </div>

      {/* Session Exercises List */}
      {isExpanded && (
        <div className="border-t border-gray-800 px-4 py-3 flex flex-col gap-2">
          {session.exercises.length === 0 ? (
            <p className="text-gray-500 text-sm">No exercises yet.</p>
          ) : (
            // Group exercises by exerciseId
            Object.values(
              session.exercises.reduce((acc, entry) => {
                const key = entry.exerciseId
                if (!acc[key]) {
                  acc[key] = {
                    exerciseId: entry.exerciseId,
                    exerciseName: entry.exerciseName,
                    sets: []
                  }
                }
                acc[key].sets.push(entry)
                return acc
              }, {})
            ).map((group, index) => (
              <div key={group.exerciseId} className="bg-gray-800 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-md font-medium text-white truncate">
                    <span className="text-gray-500 mr-1">{index + 1}.</span>
                    {group.exerciseName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {group.sets.map((entry, setIndex) => (
                    <div key={entry.id} className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1">
                      <span className="text-sm text-gray-400">Set {setIndex + 1}:</span>
                      <span className="text-sm text-white">
                        {entry.repsCompleted} reps
                        {entry.weightKg ? ` · ${entry.weightKg}kg` : ''}
                      </span>
                      <button
                        onClick={() => onEditEntry(entry)}
                        className="ml-1 text-xs text-gray-400 hover:text-white transition"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onRemoveEntry(entry.id)}
                        className="text-xs text-red-400 hover:text-white transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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
    </div>
  )
}