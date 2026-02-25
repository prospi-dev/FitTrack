import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logos/logo.png'
export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-white font-semibold border-b-2 border-blue-500 pb-0.5'
            : 'text-gray-400 hover:text-white transition'

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <img src={logo} alt="FitTrack Logo" className="w-10 md:w-35 lg:w-15" onClick={() => navigate('/dashboard')} />
            {/* Nav links */}
            <div className="flex items-center gap-6 text-sm">
                <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/exercises" className={linkClass}>Exercises</NavLink>
                <NavLink to="/routines" className={linkClass}>Routines</NavLink>
                <NavLink to="/sessions" className={linkClass}>Sessions</NavLink>
            </div>

            {/* User + logout */}
            <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                    Hey, <span className="text-white font-medium">{user?.name}</span>
                </span>
                <button
                    onClick={handleLogout}
                    className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}