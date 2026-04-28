import { useParticipants } from '@livekit/components-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../common/Button'

export default function DirectCallWaiting({ onCancel }) {
  const participants  = useParticipants()
  const [countdown, setCountdown] = useState(30)
  const timer = useRef(null)
  const isConnected = participants.length >= 2 // caller + callee

  useEffect(() => {
    if (isConnected) {
      clearInterval(timer.current)
      return
    }
    timer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer.current)
          onCancel?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer.current)
  }, [isConnected, onCancel])

  if (isConnected) return null

  return (
    <div
      className="empty-state"
      style={{ background: 'rgba(255,255,255,0.04)', color: '#9bb4b8', padding: '52px 24px' }}
    >
      <div style={{ fontSize: 52, marginBottom: 14 }}>📞</div>
      <p style={{ fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 6 }}>Calling…</p>
      <p>Waiting for the other person to pick up ({countdown}s)</p>
      <Button variant="danger" onClick={onCancel} style={{ marginTop: 18 }}>
        Cancel call
      </Button>
    </div>
  )
}
