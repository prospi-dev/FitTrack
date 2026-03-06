import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Back link */}
      <div className="px-4 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
          <span>←</span> Back to Home
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6 sm:px-6 sm:pb-10">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">About FitTrack</h1>
            <p className="text-gray-400 text-base sm:text-lg">Built for people who take their training seriously.</p>
          </div>

          {/* Cards */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-900/50 sm:bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl">💪</span>
                <h2 className="text-lg sm:text-xl font-semibold">What is FitTrack?</h2>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                FitTrack is a workout tracking app that helps you log sessions, build routines, and monitor your progress over time.
                Whether you're just starting out or you've been training for years, FitTrack gives you the tools to stay consistent and see real results.
              </p>
            </div>

            <div className="bg-gray-900/50 sm:bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl">🎯</span>
                <h2 className="text-lg sm:text-xl font-semibold">Our Mission</h2>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                We believe fitness should be simple, not overwhelming. Our goal is to give you a clean, focused tool that gets out of your way
                and lets you focus on what matters — training hard and tracking your progress.
              </p>
            </div>

            <div className="bg-gray-900/50 sm:bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl">✉️</span>
                <h2 className="text-lg sm:text-xl font-semibold">Contact</h2>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Have a question or feedback? We'd love to hear from you. Reach out at{' '}
                <a href="mailto:manuprosperi04@gmail.com" className="text-blue-400 hover:underline">
                  manuprosperi04@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}