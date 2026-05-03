import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useRoomStore from '../store/room.store'
import Button from '../components/common/Button'

export default function NewMeeting() {
  const navigate       = useNavigate()
  const setRoomPayload = useRoomStore((s) => s.setRoomPayload)

  const [type,    setType]    = useState('group')
  const [title,   setTitle]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/api/rooms/create', { type, title: title || null })
      setRoomPayload(data)
      const roomcode = data.roomcode
      const roomType = data.room?.type
      if (!roomcode) {
        setError('Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      navigate(
        roomType === 'webinar' ? `/webinar/${roomcode}` : `/prejoin/${roomcode}`,
        { state: data }
      )
    } catch (err) {
      setError(err?.response?.data?.error || 'We could not create the meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="new-meeting-wrap">
      <div className="card new-meeting-card">
        <div className="new-meeting-header">
          <div className="new-meeting-icon">
            {type === 'webinar' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            )}
          </div>
          <div>
            <h2 className="new-meeting-title">Create a New Meeting</h2>
            <p className="muted">Choose your meeting type and set a title to get started.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleCreate}>
          <div>
            <label className="label">Meeting Type</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="group">Meeting</option>
              <option value="webinar">Webinar</option>
            </select>
          </div>

          <div>
            <label className="label">
              Title <span className="label-optional">(optional)</span>
            </label>
            <input
              className="input"
              placeholder="Enter meeting title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <div className="row">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : type === 'webinar' ? 'Create Webinar' : 'Create Meeting'}
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
