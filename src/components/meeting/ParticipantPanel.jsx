import { useParticipants } from '@livekit/components-react'
import Avatar from '../common/Avatar'

export default function ParticipantPanel() {
  const participants = useParticipants()

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>People ({participants.length})</h3>
      <div className="info-list">
        {participants.map((p) => (
          <div className="info-item" key={p.identity}>
            <div className="row" style={{ alignItems: 'center', flexWrap: 'nowrap', gap: 10 }}>
              <Avatar name={p.name} />
              <div>
                <strong>{p.name || p.identity}</strong>
                {p.isLocal && <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.6 }}>(you)</span>}
                <div className="muted" style={{ fontSize: 12 }}>
                  {p.isSpeaking ? '🗣 Speaking' : 'Listening'}
                </div>
              </div>
            </div>
            <div className="row">
              {!p.isMicrophoneEnabled && (
                <span className="badge" style={{ background: '#fdeceb', color: '#b42318', fontSize: 11 }}>Muted</span>
              )}
              {!p.isCameraEnabled && (
                <span className="badge" style={{ fontSize: 11 }}>No cam</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
