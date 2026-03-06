import { Link } from 'react-router-dom'
import Footer from '../../components/Footer'
import { useState } from 'react'
import emailjs from '@emailjs/browser'

export default function AboutPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null) // 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

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
              <p className="text-gray-400 leading-relaxed mt-4">
                FitTrack is a personal project built to practise full-stack development
                with React and .NET. It is not a commercial product — data may be reset
                at any time.
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

            {/* Contact form */}
            <div className="bg-gray-900/50 sm:bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <span className="text-xl sm:text-2xl">✉️</span>
                <h2 className="text-lg sm:text-xl font-semibold">Contact</h2>
              </div>
              <p className="text-gray-400 text-sm sm:text-base mb-5">
                Have a question or feedback? Fill out the form below and I'll get back to you.
              </p>

              {status === 'success' ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-green-400 font-medium">Message sent!</p>
                  <p className="text-gray-400 text-sm mt-1">Thanks for reaching out. I'll get back to you soon.</p>
                  <button
                    onClick={() => setStatus(null)}
                    className="mt-4 text-sm text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <textarea
                    placeholder="Your message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                  />
                  {status === 'error' && (
                    <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}