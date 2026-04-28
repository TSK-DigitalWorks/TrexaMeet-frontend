import useAuthStore from '../store/auth.store'
import Button from '../components/common/Button'
import { redirectToCentralAuth } from '../lib/auth'

export default function AuthGuard({ children }) {
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)

  if (!hydrated) {
    return (
      <div className="main">
        <div className="card">Checking your Trexa session…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="main" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ maxWidth: 520 }}>
          <h2>TrexaMeet needs CentralAuth</h2>
          <p className="muted">Open this app from Trexa CentralAuth, or pass the access token in the URL after login.</p>
          <Button onClick={redirectToCentralAuth}>Go to CentralAuth</Button>
        </div>
      </div>
    )
  }

  return children
}
