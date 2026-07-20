import { Link } from 'react-router-dom'
import logo from '../../assets/logos/logo.png'
import Footer from '../../components/Footer'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <img src={logo} alt="FitTrack" className="w-15" />
                <div className="flex gap-3">
                    <Link to="/login" className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 transition">
                        Login
                    </Link>
                    <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-24">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full mb-6">
                    Track · Train · Progress
                </span>
                <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
                    Your fitness journey,<br />
                    <span className="text-blue-400">all in one place</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mb-10">
                    Log workouts, build routines, track progress and crush your goals with FitTrack — the app built for serious training.
                </p>
                <div className="flex gap-4 flex-wrap justify-center">
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition">
                        Start for free
                    </Link>
                    <Link to="/login" className="text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-xl transition">
                        Sign in
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="text-3xl mb-3">🏋️</div>
                        <h3 className="text-lg font-semibold mb-2">Exercise Library</h3>
                        <p className="text-gray-400 text-sm">Browse a curated catalogue of exercises with muscle group filters.</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="text-3xl mb-3">📋</div>
                        <h3 className="text-lg font-semibold mb-2">Custom Routines</h3>
                        <p className="text-gray-400 text-sm">Build and save your training routines with sets, reps and weights.</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="text-3xl mb-3">📈</div>
                        <h3 className="text-lg font-semibold mb-2">Workout Tracking</h3>
                        <p className="text-gray-400 text-sm">Log every session and watch your progress grow over time.</p>
                    </div>
                </div>
            </section>
            <Footer/>
        </div>
    )
}