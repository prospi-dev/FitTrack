import { createContext, useContext } from 'react'

// Context + hook live here (separate from the provider component) so the
// provider file can stay a components-only module for React Fast Refresh —
// mirroring the AuthContext / useAuth split.
const noop = () => {}
export const ToastContext = createContext({ error: noop, success: noop, info: noop, celebrate: noop })

export function useToast() {
  return useContext(ToastContext)
}
