import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="hidden sm:block border-t border-gray-800 bg-gray-950 px-6 py-8 text-center">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-8 mb-4">
          <Link to="/about" className="text-gray-500 hover:text-gray-300 text-sm transition">About</Link>
          <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition">Privacy</Link>
          <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition">Terms</Link>
        </div>
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} FitTrack. All rights reserved.
        </p>
      </div>
    </footer>
  )
}