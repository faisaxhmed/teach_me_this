import { createContext, useContext } from 'react'

// Holds the access token issued by /access/verify. Deliberately React state only
// (see AccessGate.jsx) rather than localStorage, so it doesn't persist indefinitely
// across browser sessions.
export const AccessContext = createContext(null)

export function useAccessToken() {
  return useContext(AccessContext)
}
