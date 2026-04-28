import { useEffect } from 'react'
import useAuthStore from '../store/auth.store'
import { bootstrapCentralAuthSession, getSession } from '../lib/auth'

export default function useAuth() {
  const setSession = useAuthStore((state) => state.setSession)
  const setHydrated = useAuthStore((state) => state.setHydrated)

  useEffect(() => {
    const session = bootstrapCentralAuthSession() || getSession()
    if (session?.access_token && session?.user) {
      setSession(session)
    } else {
      setHydrated(true)
    }
  }, [setHydrated, setSession])
}
