import { NavLink } from 'react-router-dom'
import useAuthStore from '../../store/auth.store'
import Avatar from '../common/Avatar'

export default function Sidebar() {
  const user = useAuthStore((state) => state.user)

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">TM</div>
        <div>
          <strong>TrexaMeet</strong>
          <p>Calls, groups, webinars</p>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
        <NavLink to="/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>New meeting</NavLink>
        <NavLink to="/join" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Join</NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>History</NavLink>
      </nav>

      <div className="panel" style={{ marginTop: 'auto' }}>
        <div className="row" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
          <Avatar name={user?.name} />
          <div>
            <strong>{user?.name || 'Trexa User'}</strong>
            <div className="muted" style={{ fontSize: 14 }}>{user?.email || 'Signed in from CentralAuth'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
