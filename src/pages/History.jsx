import { useEffect, useState } from 'react'
import api from '../lib/api'

const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/history')
        setHistory(data.history || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="card">Loading history…</div>

  return (
    <div className="history-list">
      {history.length === 0 ? (
        <div className="empty-state">No calls yet. Your completed calls will appear here.</div>
      ) : history.map((item) => (
        <div className="card" key={item.id}>
          <div className="info-item">
            <div>
              <strong>{item.rooms?.title || item.rooms?.room_code || 'Untitled meeting'}</strong>
              <div className="muted">{item.room_type} · Host: {item.rooms?.host_name || 'Unknown'}</div>
            </div>
            <span className="badge">{formatDuration(item.duration_seconds)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
