import Navbar from './NavBar';

// Wraps all protected pages — adds the navbar on top
// and a consistent page container below it.
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}