import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useRoomStore from '../store/room.store'
import Button from '../components/common/Button'

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export default function NewMeeting() {
  const navigate = useNavigate()
  const setRoomPayload = useRoomStore(s => s.setRoomPayload)

  const [title, setTitle]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [createdRoom, setCreatedRoom] = useState(null)
  const [copied, setCopied]     = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/api/rooms/create', {
        type: 'group',
        title: title.trim() || null,
      })
      if (!data.roomcode) {
        setError('Something went wrong. Please try again.')
        return
      }
      setCreatedRoom({ roomcode: data.roomcode, title: title.trim() || null, payload: data })
    } catch (err) {
      setError(err?.response?.data?.error || 'We could not create the meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartMeeting = () => {
    setRoomPayload(createdRoom.payload)
    navigate(`/prejoin/${createdRoom.roomcode}`, { state: createdRoom.payload })
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── Room Ready ─────────────────────────── */
  if (createdRoom) {
    return (
      <div className="nm-wrap">
        <div className="card nm-card">

          <div className="nm-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h2 className="nm-heading">Meeting Ready</h2>
          {createdRoom.title && (
            <p className="nm-sub nm-meeting-title">"{createdRoom.title}"</p>
          )}
          <p className="nm-sub">Share the code or link below. Click <strong>Start Meeting</strong> when you're ready to join.</p>

          <div className="nm-code-block">
            <span className="nm-code-label">Room Code</span>
            <div className="nm-code-row">
              <span className="nm-code">{createdRoom.roomcode}</span>
              <button className="nm-copy-btn" onClick={() => copy(createdRoom.roomcode)}>
                <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <button
            className="nm-link-btn"
            onClick={() => copy(`${window.location.origin}/prejoin/${createdRoom.roomcode}`)}
          >
            <CopyIcon />
            Copy invite link
          </button>

          <div className="nm-actions">
            <Button onClick={handleStartMeeting} style={{ flex: 1 }}>
              Start Meeting
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')} style={{ flex: 1 }}>
              Later
            </Button>
          </div>

        </div>
      </div>
    )
  }

  /* ── Create Form ────────────────────────── */
  return (
    <div className="nm-wrap">
      <div className="card nm-card">

        <div className="nm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        <h2 className="nm-heading">Create a Meeting</h2>
        <p className="nm-sub">Give your meeting a title, then share the room code with participants.</p>

        <form className="nm-form" onSubmit={handleCreate}>
          <div>
            <label className="label">
              Title <span className="label-optional">optional</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Weekly sync, Project review…"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="nm-actions">
            <Button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Creating…' : 'Create Meeting'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}
