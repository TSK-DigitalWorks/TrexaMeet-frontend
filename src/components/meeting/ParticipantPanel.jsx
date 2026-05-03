import { useParticipants } from '@livekit/components-react'
import { MicOffIcon, CameraOffIcon } from './icons'

export default function ParticipantPanel() {
  const participants = useParticipants()

  return (
    <div className="pax-panel">
      <div className="pax-list">
        {participants.map((p) => {
          const initials = (p.name || p.identity || 'U')
            .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

          return (
            <div className="pax-row" key={p.identity}>
              <div className="pax-row__left">
                <div className="pax-avatar">
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

              <div className="pax-row__right">
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
