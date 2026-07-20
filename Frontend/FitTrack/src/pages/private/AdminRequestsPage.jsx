import { useState } from 'react'
import { getAllRequests, reviewRequest } from '../../api/exerciseRequests'
import StatusBadge from '../../components/StatusBadge'
import Card from '../../components/Card'
import { useFetch } from '../../hooks/useFetch'

export default function AdminRequestsPage() {
  const { data: requests, loading, setData: setRequests } = useFetch(
    () => getAllRequests().then(res => res.data), [], []
  )
  const [filter, setFilter] = useState('Pending')
  const [actionLoading, setActionLoading] = useState(null)

  const handleReview = async (id, status) => {
    setActionLoading(id + status)
    try {
      await reviewRequest(id, status)
      setRequests(prev => prev.map(r =>
        r.id === id ? { ...r, status, reviewedAt: new Date().toISOString() } : r
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = requests.filter(r => filter === 'All' ? true : r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'Pending').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Exercise Requests</h1>
        <p className="text-gray-400">
          Review user submissions.{' '}
          {pendingCount > 0 && (
            <span className="text-yellow-400 font-medium">{pendingCount} pending</span>
          )}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-4 py-1.5 rounded-lg transition cursor-pointer ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-medium">No {filter.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white">{r.name}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-gray-500 text-sm">{r.muscleGroup}</p>
                  {r.description && <p className="text-gray-400 text-sm mt-1">{r.description}</p>}
                  <p className="text-gray-600 text-xs mt-2">
                    Submitted by <span className="text-gray-400">{r.submittedBy}</span>
                    {' · '}
                    {new Date(r.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {r.reviewedBy && ` · Reviewed by ${r.reviewedBy}`}
                  </p>
                </div>

                {r.status === 'Pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(r.id, 'Approved')}
                      disabled={actionLoading === r.id + 'Approved'}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      {actionLoading === r.id + 'Approved' ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReview(r.id, 'Rejected')}
                      disabled={actionLoading === r.id + 'Rejected'}
                      className="bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-300 text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      {actionLoading === r.id + 'Rejected' ? '...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}