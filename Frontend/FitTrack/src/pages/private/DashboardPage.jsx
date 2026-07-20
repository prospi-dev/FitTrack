import { useAuth } from '../../context/useAuth'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getRoutines } from '../../api/routines'
import { getSessions } from '../../api/workoutSessions'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sessionsRes, routinesRes] = await Promise.all([
          getSessions(),
          getRoutines(),
        ])

        const sessions = sessionsRes.data
        const routines = routinesRes.data

        const now = new Date()
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)

        const sessionsThisWeek = sessions.filter(
          s => new Date(s.date) >= weekAgo
        ).length

        const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))
        const lastSession = sortedSessions.length > 0
          ? new Date(sortedSessions[0].date).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })
          : null

        setStats({
          totalSessions: sessions.length,
          totalRoutines: routines.length,
          sessionsThisWeek,
          lastSession,
        })
      } catch (err) {
        console.error('Failed to load stats', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const isNewUser = !loading && stats?.totalSessions === 0 && stats?.totalRoutines === 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, <span className="text-blue-400">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-400">Here's your training overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Sessions"
          value={loading ? '—' : stats?.totalSessions ?? 0}
          icon="⚡"
        />
        <StatCard
          label="This Week"
          value={loading ? '—' : stats?.sessionsThisWeek ?? 0}
          icon="📅"
        />
        <StatCard
          label="Routines"
          value={loading ? '—' : stats?.totalRoutines ?? 0}
          icon="📋"
        />
        <StatCard
          label="Last Session"
          value={loading ? '—' : stats?.lastSession ?? 'None yet'}
          icon="🗓️"
          small
        />
      </div>

      {/* New user empty state */}
      {isNewUser ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-4xl mb-3">🚀</p>
          <h2 className="text-lg font-semibold text-white mb-2">Ready to start training?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Create your first routine, browse exercises, and start logging your workouts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/routines"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2 rounded-xl transition"
            >
              Create a routine
            </Link>
            <Link
              to="/exercises"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-5 py-2 rounded-xl transition"
            >
              Browse exercises
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Quick access */}
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/exercises" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 transition group">
              <div className="text-2xl mb-2">🏋️</div>
              <h3 className="text-base font-semibold mb-1 group-hover:text-blue-400 transition">Exercises</h3>
              <p className="text-gray-400 text-sm">Browse the exercise catalogue</p>
            </Link>

            <Link to="/routines" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 transition group">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="text-base font-semibold mb-1 group-hover:text-blue-400 transition">Routines</h3>
              <p className="text-gray-400 text-sm">Manage your training routines</p>
            </Link>

            <Link to="/sessions" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 transition group">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="text-base font-semibold mb-1 group-hover:text-blue-400 transition">Sessions</h3>
              <p className="text-gray-400 text-sm">Log and review your workouts</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, small = false }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xl mb-2">{icon}</div>
      <div className={`font-bold text-white mb-1 ${small ? 'text-sm' : 'text-2xl'}`}>
        {value}
      </div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  )
}