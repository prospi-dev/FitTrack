import { createContext, useContext } from 'react'

// Context + hook (kept out of the provider component file for Fast Refresh).
// Default resolves false so no destructive action fires without a provider.
export const ConfirmContext = createContext(async () => false)

export function useConfirm() {
  return useContext(ConfirmContext)
}
