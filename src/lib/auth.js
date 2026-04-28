import { jwtDecode } from 'jwt-decode'

let memorySession = null

const cleanUrlTokenParams = () => {
  const url = new URL(window.location.href)
  const keys = ['access_token', 'refresh_token', 'user_id', 'name', 'email']
  let changed = false
  keys.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  })
  if (changed) {
    window.history.replaceState({}, '', url.toString())
  }
}

export const bootstrapCentralAuthSession = () => {
  const url = new URL(window.location.href)
  const access_token = url.searchParams.get('access_token')
  const user_id = url.searchParams.get('user_id')
  const name = url.searchParams.get('name')
  const email = url.searchParams.get('email')

  if (access_token) {
    let user = null
    try {
      const decoded = jwtDecode(access_token)
      user = {
        user_id: decoded.user_id || user_id,
        name: decoded.name || name || 'User',
        email: decoded.email || email || ''
      }
    } catch {
      user = { user_id, name: name || 'User', email: email || '' }
    }

    memorySession = { access_token, user }
    cleanUrlTokenParams()
    return memorySession
  }

  return memorySession
}

export const getSession = () => memorySession

export const setSession = (session) => {
  memorySession = session
  return memorySession
}

export const clearSession = () => {
  memorySession = null
}

export const redirectToCentralAuth = () => {
  const returnUrl = encodeURIComponent(window.location.href)
  const centralAuthUrl = import.meta.env.VITE_CENTRALAUTH_URL
  if (!centralAuthUrl) return
  window.location.href = `${centralAuthUrl}?return_url=${returnUrl}`
}
