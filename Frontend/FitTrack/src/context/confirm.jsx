import { useCallback, useRef, useState } from 'react'
import { ConfirmContext } from './confirm-context'
import Modal from '../components/Modal'
import Button from '../components/Button'

// Promise-based replacement for window.confirm(): `const ok = await confirm({...})`.
// Renders an accessible Modal instead of a native OS dialog. Context + hook live
// in confirm-context.js.
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve
        setDialog({ confirmText: 'Confirm', cancelText: 'Cancel', danger: false, ...opts })
      }),
    []
  )

  const settle = (value) => {
    resolver.current?.(value)
    resolver.current = null
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <Modal
          title={dialog.title}
          size="max-w-sm"
          onClose={() => settle(false)}
          footer={
            <>
              <Button variant="secondary" size="modal" onClick={() => settle(false)}>
                {dialog.cancelText}
              </Button>
              <Button
                variant={dialog.danger ? 'danger' : 'primary'}
                size="modal"
                onClick={() => settle(true)}
              >
                {dialog.confirmText}
              </Button>
            </>
          }
        >
          <div className="p-5">
            <p className="text-ink-muted text-sm">{dialog.message}</p>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}
