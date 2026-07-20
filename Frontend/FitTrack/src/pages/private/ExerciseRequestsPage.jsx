import { useEffect, useState } from 'react'
import { getMyRequests, createRequest, deleteRequest } from '../../api/exerciseRequests'

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Lats', 'LowerBack',
  'Shoulder', 'FrontDelts', 'SideDelts', 'RearDelts',
  'Biceps', 'Triceps', 'Forearms',
  'Abs', 'Obliques',
  'Glutes', 'Quads', 'Hamstrings', 'Calves',
  'FullBody', 'Cardio'
]

const statusBadge = (status) => {
  const styles = {
    Pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] ?? styles.Pending}`}>
      {status}
    </span>
  )
}

export default function ExerciseRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState(null)

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests()
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormMsg(null)
    setSubmitting(true)
    try {
      await createRequest({ name, description, muscleGroup })
      setName('')
      setDescription('')
      setMuscleGroup('')
      setShowForm(false)
      fetchRequests()
    } catch (err) {
      setFormMsg(err.response?.data || 'Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRequest(id)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Exercise Requests</h1>
          <p className="text-gray-400">Suggest new exercises to be added to the catalogue.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-xl transition cursor-pointer"
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Submit a Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Exercise name *"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
            />
            <select
              value={muscleGroup}
              onChange={e => setMuscleGroup(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select muscle group *</option>
              {MUSCLE_GROUPS.map(mg => (
                <option key={mg} value={mg}>{mg}</option>
              ))}
            </select>
            {formMsg && <p className="text-red-400 text-sm">{formMsg}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium mb-1">No requests yet</p>
          <p className="text-sm">Submit a request to suggest a new exercise.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-white">{r.name}</span>
                  {statusBadge(r.status)}
                </div>
                <p className="text-gray-500 text-sm">{r.muscleGroup}</p>
                {r.description && <p className="text-gray-400 text-sm mt-1">{r.description}</p>}
                <p className="text-gray-600 text-xs mt-2">
                  Submitted {new Date(r.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {r.reviewedAt && ` · Reviewed ${new Date(r.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
              </div>
              {r.status === 'Pending' && (
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-gray-600 hover:text-red-400 text-xs transition cursor-pointer mt-1"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}