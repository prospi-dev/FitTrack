import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../context/useAuth'

vi.mock('../context/useAuth')

function renderAt(path, role) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/target" element={
          <ProtectedRoute role={role}><p>secret content</p></ProtectedRoute>
        } />
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/dashboard" element={<p>dashboard page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /login when there is no token', () => {
    useAuth.mockReturnValue({ token: null, user: null })
    renderAt('/target')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('renders children when authenticated and no role is required', () => {
    useAuth.mockReturnValue({ token: 'abc', user: { role: 'User' } })
    renderAt('/target')
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('redirects to /dashboard when the required role does not match', () => {
    useAuth.mockReturnValue({ token: 'abc', user: { role: 'User' } })
    renderAt('/target', 'Admin')
    expect(screen.getByText('dashboard page')).toBeInTheDocument()
  })

  it('renders children when the required role matches', () => {
    useAuth.mockReturnValue({ token: 'abc', user: { role: 'Admin' } })
    renderAt('/target', 'Admin')
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })
})
