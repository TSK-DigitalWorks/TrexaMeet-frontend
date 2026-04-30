import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setSession } from '../lib/auth'
import useAuthStore from '../store/auth.store'
import Button from '../components/common/Button'

const centralAuth = import.meta.env.VITE_CENTRALAUTH_URL

export default function Login() {
  const navigate    = useNavigate()
  const setStoreSession = useAuthStore((s) => s.setSession)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(`${centralAuth}/api/auth/login`, { email, password })
      // Corrected to access_token to match auth.store.js expectations
      const session = {
        access_token: data.access_token,
        user: {
          userid: data.user.id,
          name:   data.user.name,
          email:  data.user.email
        }
      }
      setSession(session)
      setStoreSession(session)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-loading">
      <div className="auth-form-card">
        <div className="brand-mark">TM</div>
        <h2>Sign in to TrexaMeet</h2>
        <p className="muted">Powered by Trexa CentralAuth</p>

        <form className="form-grid" onSubmit={handleLogin}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="badge" style={{ background: '#fdeceb', color: '#b42318' }}>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: 'var(--primary)' }}>Sign up</a>
        </p>
      </div>
    </div>
  )
}
