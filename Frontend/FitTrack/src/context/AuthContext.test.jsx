import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

function makeJwt(payload) {
  const base64Payload = btoa(JSON.stringify(payload))
  return `header.${base64Payload}.signature`
}

const futureJwt = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })
const pastJwt = makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 })

function Consumer() {
  const { token, user, login, logout, isTokenExpired } = useAuth()
  return (
    <div>
      <p data-testid="token">{token ?? 'no-token'}</p>
      <p data-testid="user">{user ? user.name : 'no-user'}</p>
      <button onClick={() => login({ token: 'new-token', name: 'Ana', email: 'ana@test.com', role: 'User' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
      <p data-testid="expired-future">{String(isTokenExpired(futureJwt))}</p>
      <p data-testid="expired-past">{String(isTokenExpired(pastJwt))}</p>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts with no token/user when localStorage is empty', () => {
    render(<AuthProvider><Consumer /></AuthProvider>)
    expect(screen.getByTestId('token')).toHaveTextContent('no-token')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('login() stores token/user in state and localStorage', async () => {
    const user = userEvent.setup()
    render(<AuthProvider><Consumer /></AuthProvider>)

    await act(() => user.click(screen.getByText('login')))

    expect(screen.getByTestId('token')).toHaveTextContent('new-token')
    expect(screen.getByTestId('user')).toHaveTextContent('Ana')
    expect(localStorage.getItem('token')).toBe('new-token')
    expect(JSON.parse(localStorage.getItem('user')).name).toBe('Ana')
  })

  it('logout() clears state and localStorage', async () => {
    const user = userEvent.setup()
    render(<AuthProvider><Consumer /></AuthProvider>)

    await act(() => user.click(screen.getByText('login')))
    await act(() => user.click(screen.getByText('logout')))

    expect(screen.getByTestId('token')).toHaveTextContent('no-token')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('isTokenExpired() distinguishes future and past exp claims', () => {
    render(<AuthProvider><Consumer /></AuthProvider>)
    expect(screen.getByTestId('expired-future')).toHaveTextContent('false')
    expect(screen.getByTestId('expired-past')).toHaveTextContent('true')
  })

  it('clears an already-expired token on load', () => {
    localStorage.setItem('token', makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 }))
    localStorage.setItem('user', JSON.stringify({ name: 'Stale' }))

    render(<AuthProvider><Consumer /></AuthProvider>)

    expect(screen.getByTestId('token')).toHaveTextContent('no-token')
    expect(localStorage.getItem('token')).toBeNull()
  })
})
