import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useRoomStore from '../store/room.store'
import Button from '../components/common/Button'

export default function NewMeeting() {
  const navigate = useNavigate()
  const setRoomPayload = useRoomStore((state) => state.setRoomPayload)
  const [type, setType] = useState('group')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/rooms/create', { type, title: title || null })
      setRoomPayload(data)
      const route = data.room.type === 'webinar' ? `/webinar/${data.room_code}` : `/room/${data.room_code}`
      navigate(route, { state: data })
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <form className="form-grid" onSubmit={handleCreate}>
        <div>
          <label className="label">Meeting type</label>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="group">Small group call</option>
            <option value="webinar">Webinar</option>
          </select>
        </div>

        <div>
          <label className="label">Title</label>
          <input
            className="input"
            placeholder={type === 'webinar' ? 'Weekly product webinar' : 'Optional meeting title'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {error ? <div className="badge" style={{ background: '#fdeceb', color: '#b42318' }}>{error}</div> : null}

        <div className="row">
          <Button type="submit">{loading ? 'Creating…' : 'Create meeting'}</Button>
        </div>
      </form>
    </div>
  )
}
