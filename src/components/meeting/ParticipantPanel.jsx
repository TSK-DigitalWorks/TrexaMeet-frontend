import { useState } from 'react'
import { useParticipants } from '@livekit/components-react'
import { MicOffIcon, CameraOffIcon, RemoveUserIcon, CloseIcon } from './icons'
import api from '../../lib/api'

// ── Inline themed confirm modal ───────────────────────────────────────────────
function RemoveConfirmModal({ participant, onConfirm, onCancel, loading }) {
  if (!participant) return null
  const name = participant.name || participant.identity || 'this participant'

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="remove-modal-title">
      <div className="modal-card remove-modal">
        {/* Icon */}
        <div className="remove-modal-icon" aria-hidden="true">
          <RemoveUserIcon size={22} />
        </div>

        <h3 id="remove-modal-title" className="remove-modal-title">Remove participant</h3>
        <p className="remove-modal-body">
          <strong>{name}</strong> will be removed from this meeting and won't be able to rejoin.
        </p>

        <div className="remove-modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ParticipantPanel({ roomCode, myRole }) {
  const participants = useParticipants()
  const [target, setTarget] = useState(null)   // participant to remove
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const isHost = myRole === 'host'

  const handleRemove = async () => {
    if (!target || !roomCode) return
    setLoading(true)
    setError('')
    try {
      await api.post(`/api/rooms/${roomCode}/remove`, { identity: target.identity })
      setTarget(null)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not remove participant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="pax-panel">
        {error && (
          <div className="alert alert-danger" style={{ margin: '8px 12px 0', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <div className="pax-list">
          {participants.map(p => {
            const initials = (p.name || p.identity || 'U')
              .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

            return (
              <div key={p.identity} className="pax-row">
                <div className="pax-row-left">
                  <div className={`pax-avatar${p.isSpeaking ? ' pax-avatar--speaking' : ''}`}>
                    {initials}
                    {p.isSpeaking && <div className="pax-dot pax-dot--speaking" />}
                  </div>
                  <div className="pax-info">
                    <strong>
                      {p.name || p.identity}
                      {p.isLocal && <span className="pax-you">YOU</span>}
                    </strong>
                    <span>{p.isSpeaking ? 'Speaking' : 'Listening'}</span>
                  </div>
                </div>

                <div className="pax-row-right">
                  {!p.isMicrophoneEnabled && (
                    <span className="pax-chip pax-chip--muted" aria-label="Muted">
                      <MicOffIcon size={14} />
                    </span>
                  )}
                  {!p.isCameraEnabled && (
                    <span className="pax-chip" aria-label="Camera off">
                      <CameraOffIcon size={14} />
                    </span>
                  )}
                  {/* Remove button — host only, never on self */}
                  {isHost && !p.isLocal && (
                    <button
                      type="button"
                      className="rail-icon-btn rail-icon-btn--remove"
                      onClick={() => { setError(''); setTarget(p) }}
                      aria-label={`Remove ${p.name || p.identity}`}
                      title="Remove from meeting"
                    >
                      <RemoveUserIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Themed confirmation modal */}
      <RemoveConfirmModal
        participant={target}
        onConfirm={handleRemove}
        onCancel={() => { setTarget(null); setError('') }}
        loading={loading}
      />
    </>
  )
}
