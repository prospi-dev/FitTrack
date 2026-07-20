import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [longWaitMessage, setLongWaitMessage] = useState(false)

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        setLongWaitMessage(false)

        const timeoutId = setTimeout(() => {
            setLongWaitMessage(true)
        }, 5000)

        try {
            const res = await loginApi(form)
            login(res.data)         // store token + user in AuthContext + localStorage
            navigate('/dashboard')  // redirects to dashboard on success
        } catch (err) {
            setError(err.response?.data || 'Login failed. Please try again.')
        } finally {
            clearTimeout(timeoutId)
            setLoading(false)
            setLongWaitMessage(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-950'>
            <div className='bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md'>
                <h1 className='text-3xl font-bold text-white mb-2'>Welcome back</h1>
                <p className='text-gray-400 mb-6'>Log in to your FitTrack account.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm mt-4">
                        {error}
                    </div>
                )}

                {longWaitMessage && (
                    <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-lg mb-4 text-sm mt-4">
                        Sorry for the delay, the servers are warming up... this may take up to 1 minute.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
                <p className="text-gray-400 text-sm text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    )
}