import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8 md:px-6">
        {children}
      </main>
    </div>
  )
}