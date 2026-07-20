import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function NotFoundPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-gray-800 mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-gray-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-xl text-sm transition cursor-pointer"
        >
          Go back
        </button>
        <Link
          to={token ? '/dashboard' : '/'}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm transition"
        >
          {token ? 'Dashboard' : 'Home'}
        </Link>
      </div>
    </div>
  )
}