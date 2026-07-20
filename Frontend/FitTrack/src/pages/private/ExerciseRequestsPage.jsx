import { useState } from 'react'
import { getMyRequests, createRequest, deleteRequest } from '../../api/exerciseRequests'
import { MUSCLE_GROUPS } from '../../constants/muscleGroups'
import StatusBadge from '../../components/StatusBadge'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useFetch } from '../../hooks/useFetch'

export default function ExerciseRequestsPage() {
  const { data: requests, loading, setData: setRequests, refetch: fetchRequests } = useFetch(
    () => getMyRequests().then(res => res.data), [], []
  )
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState(null)

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
        <Card padding="p-6" className="mb-6">
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
            <Button type="submit" disabled={submitting} size="form">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </Card>
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
            <Card key={r.id} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-white">{r.name}</span>
                  <StatusBadge status={r.status} />
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
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}