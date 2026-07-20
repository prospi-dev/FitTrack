import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import axiosInstance from './axiosInstance'

// axios doesn't expose a public API to invoke interceptors directly,
// but keeps registered handlers on interceptors.request/response.handlers —
// a well-established pattern for unit-testing interceptor logic in isolation.
const requestInterceptor = axiosInstance.interceptors.request.handlers[0]
const responseInterceptor = axiosInstance.interceptors.response.handlers[0]

describe('axiosInstance request interceptor', () => {
  beforeEach(() => localStorage.clear())

  it('attaches Authorization header when a token is stored', () => {
    localStorage.setItem('token', 'abc123')
    const config = requestInterceptor.fulfilled({ headers: {} })
    expect(config.headers['Authorization']).toBe('Bearer abc123')
  })

  it('leaves headers untouched when no token is stored', () => {
    const config = requestInterceptor.fulfilled({ headers: {} })
    expect(config.headers['Authorization']).toBeUndefined()
  })
})

describe('axiosInstance response interceptor', () => {
  const originalLocation = window.location

  beforeEach(() => {
    localStorage.setItem('token', 'abc123')
    localStorage.setItem('user', '{"name":"test"}')
    delete window.location
    window.location = { ...originalLocation, href: '' }
  })

  afterEach(() => {
    window.location = originalLocation
  })

  it('clears session and redirects to /login on a 401 response', async () => {
    const error = { response: { status: 401 } }
    await expect(responseInterceptor.rejected(error)).rejects.toBe(error)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(window.location.href).toBe('/login')
  })

  it('leaves session untouched on non-401 errors', async () => {
    const error = { response: { status: 500 } }
    await expect(responseInterceptor.rejected(error)).rejects.toBe(error)
    expect(localStorage.getItem('token')).toBe('abc123')
    expect(window.location.href).toBe('')
  })
})
