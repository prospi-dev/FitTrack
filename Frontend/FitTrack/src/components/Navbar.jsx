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

  // Desktop top nav links
  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-white font-semibold border-b-2 border-blue-500 pb-0.5'
      : 'text-gray-400 hover:text-white transition'

  // Mobile bottom tab links
  const tabClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 text-xs transition ${
      isActive ? 'text-blue-400' : 'text-gray-500'
    }`

  return (
    <>
      {/* ── DESKTOP TOP NAV (hidden on mobile) ── */}
      <nav className="hidden md:flex bg-gray-900 border-b border-gray-800 px-6 py-4 items-center justify-between">
        {/* Logo */}
        <img
          src={logo}
          alt="FitTrack Logo"
          className="w-15 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        />

        {/* Nav links */}
        <div className="flex items-center gap-6 text-base">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/exercises" className={linkClass}>Exercises</NavLink>
          <NavLink to="/routines" className={linkClass}>Routines</NavLink>
          <NavLink to="/sessions" className={linkClass}>Sessions</NavLink>
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-base">
            Hey, <span className="text-white font-medium">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── MOBILE TOP BAR (logo + logout, visible on mobile only) ── */}
      <div className="flex md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 items-center justify-between">
        <img
          src={logo}
          alt="FitTrack Logo"
          className="w-15 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        />
        <button
          onClick={handleLogout}
          className="text-sm bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-900 border-t border-gray-800 px-2 py-2 flex justify-around">
        <NavLink to="/dashboard" className={tabClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </NavLink>

        <NavLink to="/exercises" className={tabClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m-7.5-7.5v15" />
          </svg>
          <span>Exercises</span>
        </NavLink>

        <NavLink to="/routines" className={tabClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Routines</span>
        </NavLink>

        <NavLink to="/sessions" className={tabClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Sessions</span>
        </NavLink>
      </nav>
    </>
  )
}