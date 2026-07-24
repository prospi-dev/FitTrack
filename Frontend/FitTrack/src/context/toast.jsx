import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from './toast-context'

// Lightweight toast system. Components call useToast().error(msg) etc.; toasts
// stack top-center and auto-dismiss. The context + hook live in toast-context.js.
const STYLES = {
  error: 'border-danger/60 bg-danger/10 text-danger',
  success: 'border-success/60 bg-success/10 text-success',
  info: 'border-line-strong bg-surface-2 text-ink-muted',
  celebrate: 'border-accent/60 bg-accent-soft text-accent-ink',
}
const ICONS = { error: '✕', success: '✓', info: 'i', celebrate: '🏆' }

let counter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message, duration) => {
      const id = ++counter
      setToasts((list) => [...list, { id, type, message }])
      if (duration) setTimeout(() => remove(id), duration)
      return id
    },
    [remove]
  )

  const api = useMemo(
    () => ({
      error: (m) => push('error', m, 5000),
      success: (m) => push('success', m, 4000),
      info: (m) => push('info', m, 4000),
      celebrate: (m) => push('celebrate', m, 6000),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed top-4 inset-x-0 z-60 flex flex-col items-center gap-2 px-4 pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full max-w-sm flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-pop backdrop-blur-sm animate-[toastIn_180ms_ease-out] ${STYLES[t.type]}`}
          >
            <span className="shrink-0 leading-5">{ICONS[t.type]}</span>
            <span className="flex-1 text-ink">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-ink-faint hover:text-ink transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
