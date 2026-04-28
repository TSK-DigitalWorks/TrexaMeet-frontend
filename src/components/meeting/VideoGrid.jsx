import { useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import VideoTile from './VideoTile'

export default function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  )

  if (tracks.length === 0) {
    return (
      <div className="empty-state" style={{ background: 'rgba(255,255,255,0.04)', color: '#9bb4b8' }}>
        Waiting for others to join…
      </div>
    )
  }

  return (
    <div className="video-grid">
      {tracks.map((trackRef) => (
        <VideoTile
          key={`${trackRef.participant.identity}-${trackRef.source}`}
          trackRef={trackRef}
        />
      ))}
    </div>
  )
}
