import { VideoTrack } from '@livekit/components-react'
import { Track } from 'livekit-client'
import { MicOffIcon, ScreenShareIcon } from './icons'

function ExpandIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function CollapseIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" />
      <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  )
}

export default function VideoTile({ trackRef, variant = 'tile', onExpand, onCollapse }) {
  const participant = trackRef?.participant
  const isScreenShare = trackRef?.source === Track.Source.ScreenShare

  // FIX: derive video presence from participant state, not just track subscription
  // This prevents the blank avatar bug when camera is toggled off then on
  const cameraEnabled = participant?.isCameraEnabled
  const hasVideo = isScreenShare
    ? (trackRef?.publication?.isSubscribed && trackRef?.publication?.track)
    : cameraEnabled && trackRef?.publication?.isSubscribed && trackRef?.publication?.track

  const isSpeaking = participant?.isSpeaking
  const isMuted = !participant?.isMicrophoneEnabled
  const isLocal = participant?.isLocal

  const initials = (participant?.name || participant?.identity || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Screen-share: contain (no stretching) — Camera: cover (fills nicely)
  const objectFit = isScreenShare ? 'contain' : 'cover'

  return (
    <article
      className={[
        'vtile',
        `vtile--${variant}`,
        isSpeaking ? 'is-speaking' : '',
        !hasVideo ? 'is-novideo' : '',
      ].filter(Boolean).join(' ')}
      aria-label={`${participant?.name || participant?.identity || 'Participant'}${isLocal ? ' (you)' : ''}`}
    >
      {/* Video — always render when hasVideo, style enforces fit */}
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className="vtile-track"
          style={{ objectFit }}
        />
      ) : (
        // Avatar — always shown when no video (cam off, or toggled back off)
        <div className="vtile-avatar-bg">
          <div className="vtile-avatar">{initials}</div>
        </div>
      )}

      {/* Expand button (top-right) */}
      {onExpand && (
        <button
          type="button"
          className="vtile-expand-btn"
          onClick={onExpand}
          aria-label={`Expand ${participant?.name || 'participant'}`}
          title="Expand to full view"
        >
          <ExpandIcon size={13} />
        </button>
      )}
      {onCollapse && (
        <button
          type="button"
          className="vtile-expand-btn vtile-expand-btn--collapse"
          onClick={onCollapse}
          aria-label="Exit full view"
          title="Exit full view"
        >
          <CollapseIcon size={13} />
        </button>
      )}

      {/* Name bar */}
      <div className="vtile-bar">
        <div className="vtile-name-row">
          {isMuted && (
            <span className="vtile-mute-icon" aria-label="Microphone off">
              <MicOffIcon size={13} />
            </span>
          )}
          <span className="vtile-name">
            {participant?.name || participant?.identity || 'User'}
            {isLocal ? ' (You)' : ''}
          </span>
        </div>
        {isScreenShare && (
          <span className="vtile-badge">
            <ScreenShareIcon size={12} /> Presenting
          </span>
        )}
      </div>
    </article>
  )
}
