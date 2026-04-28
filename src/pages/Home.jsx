import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/auth.store'
import useRoomStore from '../store/room.store'
import api from '../lib/api'
import Button from '../components/common/Button'

export default function Home() {
  const user        = useAuthStore((s) => s.user)
  const navigate    = useNavigate()
  const setRoomPayload = useRoomStore((s) => s.setRoomPayload)

  const [targetId,   setTargetId]   = useState('')
  const [targetName, setTargetName] = useState('')
  const [calling,    setCalling]    = useState(false)
  const [callError,  setCallError]  = useState('')
  const [copied,     setCopied]     = useState(false)

  const copyId = () => {
    navigator.clipboard.writeText(user?.user_id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const startCall = async (e) => {
    e.preventDefault()
    if (!targetId.trim()) return
    setCalling(true)
    setCallError('')
    try {
      const { data } = await api.post('/api/call/invite', {
        invited_user_id:   targetId.trim(),
        invited_user_name: targetName.trim() || 'User'
      })
      // Merge room meta so Room.jsx can read it from the store
      setRoomPayload({
        ...data,
        room:    { room_code: data.room_code, type: 'direct' },
        my_role: 'host'
      })
      navigate(`/room/${data.room_code}`, { state: data })
    } catch (err) {
      setCallError(err?.response?.data?.error || 'Failed to start call')
    } finally {
      setCalling(false)
    }
  }

  return (
    <div className="page-stack">

      {/* Your Trexa ID */}
      <div className="card">
        <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
          Your Trexa ID — share this so others can call you directly
        </p>
        <div className="row" style={{ alignItems: 'center' }}>
          <code
            style={{
              flex: 1, background: '#f1f3f5', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, wordBreak: 'break-all'
            }}
          >
            {user?.user_id || '—'}
          </code>
          <Button variant="secondary" onClick={copyId}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Action cards */}
      <div className="card-grid">

        {/* 1-1 call */}
        <div className="card">
          <span className="badge">Direct</span>
          <h3>1-1 Call</h3>
          <form className="form-grid" onSubmit={startCall}>
            <input
              className="input"
              placeholder="Paste their Trexa user ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
            <input
              className="input"
              placeholder="Their name (optional)"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
            />
            {callError && (
              <span className="badge" style={{ background: '#fdeceb', color: '#b42318' }}>
                {callError}
              </span>
            )}
            <Button type="submit">{calling ? 'Calling…' : 'Call now'}</Button>
          </form>
        </div>

        {/* Group meeting */}
        <div className="card">
          <span className="badge">Group</span>
          <h3>Group meeting</h3>
          <p className="muted">Create a room code, share it with your team and start instantly.</p>
          <Link to="/new"><Button>Create group call</Button></Link>
        </div>

        {/* Webinar */}
        <div className="card">
          <span className="badge">Webinar</span>
          <h3>Host a webinar</h3>
          <p className="muted">Up to 5 speakers on stage. Everyone else watches as audience.</p>
          <Link to="/new"><Button variant="secondary">Create webinar</Button></Link>
        </div>

        {/* Join */}
        <div className="card">
          <span className="badge">Join</span>
          <h3>Join by code</h3>
          <p className="muted">Enter a code like TRX-XXXXXXX to jump into any room.</p>
          <Link to="/join"><Button variant="secondary">Join meeting</Button></Link>
        </div>

      </div>
    </div>
  )
}
