import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { login as loginApi } from '../../api/auth'
import { useAuth } from '../../context/useAuth'

vi.mock('../../api/auth')
vi.mock('../../context/useAuth')

describe('LoginPage', () => {
  it('shows the backend error message when login fails', async () => {
    useAuth.mockReturnValue({ login: vi.fn() })
    loginApi.mockRejectedValue({ response: { data: 'Invalid credentials' } })
    const user = userEvent.setup()

    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // Regression test for the err.responde -> err.response typo:
    // the real backend message must reach the user, not the generic fallback.
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    expect(screen.queryByText('Login failed. Please try again.')).not.toBeInTheDocument()
  })

  it('shows the field message when the backend answers with ProblemDetails', async () => {
    useAuth.mockReturnValue({ login: vi.fn() })
    loginApi.mockRejectedValue({
      response: { data: { errors: { Email: ['Invalid email format.'] } } },
    })
    const user = userEvent.setup()

    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'somepass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // A validation 400 is an object, not a string — passing it straight to JSX would throw.
    await waitFor(() => {
      expect(screen.getByText('Invalid email format.')).toBeInTheDocument()
    })
    expect(screen.queryByText('Login failed. Please try again.')).not.toBeInTheDocument()
  })

  it('falls back to the title instead of leaking a dev stack trace', async () => {
    useAuth.mockReturnValue({ login: vi.fn() })
    loginApi.mockRejectedValue({
      response: {
        data: {
          title: 'An unexpected error occurred.',
          detail: 'System.Exception: boom\n   at FitTrack.Controllers.AuthController.Login()',
        },
      },
    })
    const user = userEvent.setup()

    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'somepass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
    })
    expect(screen.queryByText(/System\.Exception/)).not.toBeInTheDocument()
  })

  it('logs in and navigates to /dashboard on success', async () => {
    const login = vi.fn()
    useAuth.mockReturnValue({ login })
    loginApi.mockResolvedValue({ data: { token: 'abc', name: 'Ana', email: 'a@b.com', role: 'User' } })
    const user = userEvent.setup()

    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'correctpass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(login).toHaveBeenCalledWith({
      token: 'abc', name: 'Ana', email: 'a@b.com', role: 'User',
    }))
  })
})
