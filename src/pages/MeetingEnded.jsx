import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button'

export default function MeetingEnded() {
  const { roomCode } = useParams()
  const navigate = useNavigate()

  return (
    <div className="ended-page">
      <div className="ended-card">

        {/* Icon */}
        <div className="ended-icon-wrap">
          <svg
            className="ended-icon-svg"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round"
          >
            {/* Door with arrow leaving — clean "left the room" metaphor */}
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h2 className="ended-heading">You've left the meeting</h2>
        <p className="ended-sub">
          Room <span className="ended-code">{roomCode}</span> is still open —
          you can rejoin anytime or go back to your dashboard.
        </p>

        <div className="ended-actions">
          <Button
            onClick={() => navigate(`/prejoin/${roomCode}`)}
            style={{ flex: 1 }}
          >
            {/* Rejoin icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0 }}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Rejoin Meeting
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/', { replace: true })}
            style={{ flex: 1 }}
          >
            {/* Home icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go to Dashboard
          </Button>
        </div>

      </div>
    </div>
  )
}
