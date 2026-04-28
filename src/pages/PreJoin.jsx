import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useMediaDevices from '../hooks/useMediaDevices'
import useRoomStore from '../store/room.store'
import api from '../lib/api'
import Button from '../components/common/Button'

export default function PreJoin() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const { cameras, microphones, loading } = useMediaDevices()
  const preJoin = useRoomStore((state) => state.preJoin)
  const updatePreJoin = useRoomStore((state) => state.updatePreJoin)
  const setRoomPayload = useRoomStore((state) => state.setRoomPayload)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const previewText = useMemo(() => {
    if (loading) return 'Checking your camera and microphone…'
    return `Found ${cameras.length} camera(s) and ${microphones.length} microphone(s)`
  }, [cameras.length, loading, microphones.length])

  const handleJoin = async () => {
    setJoining(true)
    setError('')
    try {
      const { data } = await api.post(`/api/rooms/${roomCode}/join`)
      setRoomPayload(data)
      const route = data.room.type === 'webinar' ? `/webinar/${roomCode}` : `/room/${roomCode}`
      navigate(route, { state: data })
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to join room')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="card" style={{ maxWidth: 860 }}>
        <h3>Pre-join setup</h3>
        <p className="muted">Room: {roomCode}</p>
        <div className="card-grid" style={{ marginTop: 16 }}>
          <div className="panel">
            <div className="video-tile" style={{ minHeight: 240 }}>
              <div>
                <div className="badge">Preview</div>
                <p style={{ marginTop: 10, color: '#d7e3e6' }}>{previewText}</p>
              </div>
            </div>
          </div>
          <div className="panel form-grid">
            <div>
              <label className="label">Microphone</label>
              <select
                className="select"
                value={preJoin.selectedMicId}
                onChange={(e) => updatePreJoin({ selectedMicId: e.target.value })}
              >
                <option value="">Default microphone</option>
                {microphones.map((item) => <option key={item.deviceId} value={item.deviceId}>{item.label || 'Microphone'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Camera</label>
              <select
                className="select"
                value={preJoin.selectedCameraId}
                onChange={(e) => updatePreJoin({ selectedCameraId: e.target.value })}
              >
                <option value="">Default camera</option>
                {cameras.map((item) => <option key={item.deviceId} value={item.deviceId}>{item.label || 'Camera'}</option>)}
              </select>
            </div>
            <div className="row">
              <Button type="button" variant="secondary" onClick={() => updatePreJoin({ micEnabled: !preJoin.micEnabled })}>
                Mic: {preJoin.micEnabled ? 'On' : 'Off'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => updatePreJoin({ camEnabled: !preJoin.camEnabled })}>
                Camera: {preJoin.camEnabled ? 'On' : 'Off'}
              </Button>
            </div>
            {error ? <div className="badge" style={{ background: '#fdeceb', color: '#b42318' }}>{error}</div> : null}
            <Button type="button" onClick={handleJoin}>{joining ? 'Joining…' : 'Join now'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
