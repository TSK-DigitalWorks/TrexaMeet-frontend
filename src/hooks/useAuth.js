import { useEffect } from 'react'
import useAuthStore from '../store/auth.store'
import { bootstrapCentralAuthSession, getSession } from '../lib/auth'

export default function useAuth() {
  const user        = useAuthStore((s) => s.user)
  const hydrated    = useAuthStore((s) => s.hydrated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setSession  = useAuthStore((s) => s.setSession)
  const setHydrated = useAuthStore((s) => s.setHydrated)

  useEffect(() => {
    // Step 1: Token arriving from CentralAuth redirect via URL params
    const fromUrl = bootstrapCentralAuthSession()
    if (fromUrl?.accessToken && fromUrl?.user) {
      setSession(fromUrl)
      return
    }
    // Step 2: Rehydrate from sessionStorage (page refresh / direct URL navigation)
    const stored = getSession()
    if (stored?.accessToken && stored?.user) {
      setSession(stored)
      return
    }
    // Step 3: Truly no session — AuthGuard redirects to /login
    setHydrated(true)
  }, []) // eslint-disable-line

  return { user, hydrated, accessToken }
}
