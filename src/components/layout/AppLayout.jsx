import { useLocation } from 'react-router-dom'
import useAuthStore from '../../store/auth.store'
import Sidebar from './Sidebar'

const titleMap = {
  '/': 'Dashboard',
  '/new': 'Create a meeting',
  '/join': 'Join a meeting',
  '/history': 'Call history'
}

export default function AppLayout({ children }) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const title = titleMap[location.pathname] || 'TrexaMeet'

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            <p className="muted">Welcome back, {user?.name || 'user'}.</p>
          </div>
          <span className="badge">CentralAuth connected</span>
        </div>
        {children}
      </main>
    </div>
  )
}
