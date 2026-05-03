import { useMemo, useState } from 'react'
import { useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import VideoTile from './VideoTile'

export default function VideoGrid() {
  const [spotlightId, setSpotlightId] = useState(null)

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  const { screenTracks, cameraTracks } = useMemo(() => {
    const screen = [], camera = []
    for (const t of tracks) {
      if (t.source === Track.Source.ScreenShare) screen.push(t)
      else camera.push(t)
    }
    return { screenTracks: screen, cameraTracks: camera }
  }, [tracks])

  if (tracks.length === 0) {
    return (
      <div className="grid-empty">
        <div className="grid-empty-icon">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        </div>
        <h3>Waiting for others</h3>
        <p>Participant tiles will appear here as people join the call.</p>
      </div>
    )
  }

  // Screen-share: spotlight the screen, cameras in strip
  if (screenTracks.length > 0) {
    return (
      <div className="grid-spotlight">
        <div className="grid-spotlight-main">
          {screenTracks.map(t => (
            <VideoTile key={t.participant.identity + '-screen'} trackRef={t} variant="spotlight" />
          ))}
        </div>
        <div className="grid-spotlight-strip">
          {cameraTracks.map(t => (
            <VideoTile key={t.participant.identity + '-cam'} trackRef={t} variant="strip" />
          ))}
        </div>
      </div>
    )
  }

  // Manual spotlight mode (expand button clicked)
  if (spotlightId) {
    const main = cameraTracks.find(t => t.participant.identity === spotlightId)
    const rest = cameraTracks.filter(t => t.participant.identity !== spotlightId)
    // if the spotlighted person left, fall back to grid
    if (!main) {
      setSpotlightId(null)
    } else {
      return (
        <div className="grid-spotlight">
          <div className="grid-spotlight-main">
            <VideoTile
              trackRef={main}
              variant="spotlight"
              onCollapse={() => setSpotlightId(null)}
            />
          </div>
          <div className="grid-spotlight-strip">
            {rest.map(t => (
              <VideoTile
                key={t.participant.identity + '-cam'}
                trackRef={t}
                variant="strip"
                onExpand={() => setSpotlightId(t.participant.identity)}
              />
            ))}
          </div>
        </div>
      )
    }
  }

  // Regular grid
  const count = cameraTracks.length
  const cls =
    count === 1 ? 'video-grid--solo' :
    count === 2 ? 'video-grid--duo' :
    count <= 4 ? 'video-grid--quad' :
    count <= 6 ? 'video-grid--hexa' :
    'video-grid--many'

  return (
    <div className={`video-grid ${cls}`}>
      {cameraTracks.map(t => (
        <VideoTile
          key={t.participant.identity + '-cam'}
          trackRef={t}
          variant={count === 1 ? 'solo' : 'tile'}
          onExpand={count > 1 ? () => setSpotlightId(t.participant.identity) : undefined}
        />
      ))}
    </div>
  )
}
