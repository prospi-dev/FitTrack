import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Accessible modal primitive: role="dialog" + aria-modal, Escape to close,
// backdrop-click to close, a focus trap, and an enter animation (slide-up on
// mobile, scale-in on desktop). Wrap any dialog content in this instead of a
// bare fixed overlay so every modal in the app behaves consistently.
export default function Modal({ title, onClose, children, footer, size = 'max-w-lg' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'Tab') trapTab(e)
    }
    const trapTab = (e) => {
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the dialog on open.
    panelRef.current?.querySelector(FOCUSABLE)?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface-1 border border-line rounded-2xl w-full ${size} flex flex-col max-h-[90vh] shadow-pop animate-[popIn_180ms_ease-out]`}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-line shrink-0">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-ink-muted hover:text-ink transition"
            >
              ✕
            </button>
          </div>
        )}
        {children}
        {footer && <div className="p-4 border-t border-line shrink-0 flex gap-3">{footer}</div>}
      </div>
    </div>
  )
}
