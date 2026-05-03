import { jwtDecode } from 'jwt-decode'

const SESSION_KEY  = 'trexa_session'
const REFRESH_KEY  = 'trexa_refresh'

// ── Storage helpers — sessionStorage keeps token alive across same-tab reloads
// sessionStorage works fine in real browsers; only blocked in sandboxed iframes
const read  = (k) => { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null } catch { return null } }
const write = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)) } catch {} }
const erase = (k) => { try { sessionStorage.removeItem(k) } catch {} }

// ── In-memory cache (avoids JSON.parse on every call) ──────────────────────
let memorySession = null

// ── URL cleaner ─────────────────────────────────────────────────────────────
const cleanUrlParams = () => {
  const url = new URL(window.location.href)
  const keys = ['accesstoken', 'refreshtoken', 'userid', 'name', 'email']
  let changed = false
  keys.forEach((k) => { if (url.searchParams.has(k)) { url.searchParams.delete(k); changed = true } })
  if (changed) window.history.replaceState({}, '', url.toString())
}

// ── Bootstrap from CentralAuth redirect URL params ──────────────────────────
export const bootstrapCentralAuthSession = () => {
  const url      = new URL(window.location.href)
  const rawToken = url.searchParams.get('accesstoken')
  if (!rawToken) return null

  const rawRefresh = url.searchParams.get('refreshtoken') || ''
  const userid     = url.searchParams.get('userid')
  const name       = url.searchParams.get('name')
  const email    = url.searchParams.get('email')

  let user = null
  try {
    const d = jwtDecode(rawToken)
    user = {
      user_id: d.userid || d.user_id || userid,
      userid:  d.userid || d.user_id || userid,
      name:    d.name  || name  || 'User',
      email:   d.email || email,
    }
  } catch {
    user = { user_id: userid, userid, name: name || 'User', email }
  }

  const session = { accessToken: rawToken, user }
  memorySession = session
  write(SESSION_KEY, session)
  if (rawRefresh) write(REFRESH_KEY, rawRefresh)
  cleanUrlParams()
  return session
}

// ── Get current session — memory first, then sessionStorage ─────────────────
export const getSession = () => {
  if (memorySession) return memorySession
  const stored = read(SESSION_KEY)
  if (stored?.accessToken && stored?.user) {
    memorySession = stored   // repopulate cache
    return memorySession
  }
  return null
}

// ── Save session (called after login form / token refresh) ──────────────────
export const setSession = (session) => {
  const token = session?.accessToken || session?.accesstoken
  const user  = session?.user
  if (!token || !user) return null
  memorySession = { accessToken: token, user }
  write(SESSION_KEY, memorySession)
  return memorySession
}

// ── Save refresh token separately ───────────────────────────────────────────
export const setRefreshToken = (token) => { if (token) write(REFRESH_KEY, token) }
export const getRefreshToken = () => read(REFRESH_KEY)

// ── Clear everything ────────────────────────────────────────────────────────
export const clearSession = () => {
  memorySession = null
  erase(SESSION_KEY)
  erase(REFRESH_KEY)
}
