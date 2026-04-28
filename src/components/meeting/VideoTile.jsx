import { VideoTrack } from '@livekit/components-react'
import { Track } from 'livekit-client'

export default function VideoTile({ trackRef }) {
  const participant = trackRef?.participant
  const isScreenShare = trackRef?.source === Track.Source.ScreenShare
  const hasVideo = trackRef?.publication?.isSubscribed && trackRef?.publication?.track

  return (
    <div className="video-tile" style={{ position: 'relative', overflow: 'hidden' }}>
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18, position: 'absolute', inset: 0 }}
        />
      ) : (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 150 }}>
          <div
            className="avatar"
            style={{ width: 64, height: 64, fontSize: 26, background: '#1f3b41', color: '#9dd0d5' }}
          >
            {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>
          {participant?.name || participant?.identity || 'User'}
          {participant?.isLocal ? ' (You)' : ''}
        </span>
        <div className="row">
          {!participant?.isMicrophoneEnabled && (
            <span className="badge" style={{ background: 'rgba(0,0,0,0.55)', color: '#f87171', fontSize: 11 }}>Muted</span>
          )}
          {isScreenShare && (
            <span className="badge" style={{ background: 'rgba(0,0,0,0.55)', color: '#6ee7b7', fontSize: 11 }}>Screen</span>
          )}
        </div>
      </div>
    </div>
  )
}
