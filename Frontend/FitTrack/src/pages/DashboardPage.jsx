import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">
        Welcome back, <span className="text-blue-400">{user?.name}</span> 👋
      </h1>
      <p className="text-gray-400 mb-8">What are you training today?</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/exercises" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 transition">
          <h2 className="text-lg font-semibold mb-1">Exercises</h2>
          <p className="text-gray-400 text-sm">Browse the exercise catalogue</p>
        </Link>

        <Link to="/routines" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 transition">
          <h2 className="text-lg font-semibold mb-1">Routines</h2>
          <p className="text-gray-400 text-sm">Manage your training routines</p>
        </Link>

        <Link to="/sessions" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 transition">
          <h2 className="text-lg font-semibold mb-1">Sessions</h2>
          <p className="text-gray-400 text-sm">Log and review your workouts</p>
        </Link>
      </div>
    </div>
  )
}