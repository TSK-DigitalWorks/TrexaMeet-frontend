import {
  useTracks, useParticipants, useDataChannel,
  useLocalParticipant, useRoomContext
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useState } from 'react'
import api from '../../lib/api'
import useRolePromotion from '../../hooks/useRolePromotion'
import VideoTile from '../meeting/VideoTile'
import {
  MicOnIcon, MicOffIcon, CameraOnIcon, CameraOffIcon,
  ScreenShareIcon, ScreenShareOffIcon,
  LeaveIcon, HandRaiseIcon, PromoteIcon, RemoveUserIcon,
  PeopleIcon, InfoIcon, CloseIcon
} from '../meeting/icons'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export default function WebinarStage({ roomCode, room, myRole, onLeave }) {
  // ── Role promotion — auto-reconnects when host promotes this user ──────────
  useRolePromotion(roomCode)

  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const participants = useParticipants()
  const lkRoom = useRoomContext()
  const [raisedHands, setRaisedHands] = useState([])
  const [flash, setFlash] = useState('')
  const [panel, setPanel] = useState('audience') // null, 'audience', 'management'

  const { send: sendHand } = useDataChannel('trexa-raise-hand', (msg) => {
    try {
      const data = JSON.parse(decoder.decode(msg.payload))
      setRaisedHands((prev) =>
        prev.find((p) => p.identity === data.identity) ? prev : [...prev, data]
      )
    } catch {}
  })

  const stageTracks = useTracks(
    [
      { source: Track.Source.Camera,      withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  )

  const stageIdentities = new Set(stageTracks.map((t) => t.participant.identity))
  const audience = participants.filter((p) => !stageIdentities.has(p.identity))
  const audienceCount = audience.length

  const showFlash = (msg) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2600)
  }

  const handleRaiseHand = () => {
    const payload = encoder.encode(
      JSON.stringify({ identity: localParticipant.identity, name: localParticipant.name })
    )
    sendHand(payload, { reliable: true })
    showFlash('Hand raised — the host will see your request.')
  }

  const handlePromote = async (identity) => {
    try {
      await api.post(`/api/webinar/${roomCode}/promote`, { participant_user_id: identity })
      setRaisedHands((prev) => prev.filter((p) => p.identity !== identity))
      showFlash(`${identity} promoted.`)
    } catch (err) {
      showFlash(err?.response?.data?.error || 'Promotion failed')
    }
  }

  const handleDemote = async (identity) => {
    try {
      await api.post(`/api/webinar/${roomCode}/demote`, { participant_user_id: identity })
      showFlash(`${identity} moved back to audience.`)
    } catch (err) {
      showFlash(err?.response?.data?.error || 'Demotion failed')
    }
  }

  const handleLeave = async () => {
    await lkRoom.disconnect()
    onLeave()
  }

  const uniqueSpeakers = [
    ...new Map(stageTracks.map((t) => [t.participant.identity, t.participant])).values()
  ]

  const togglePanel = (name) => setPanel((p) => p === name ? null : name)

  return (
    <div className="meet-page">
      <header className="meet-header">
        <div className="meet-header__left">
          <span className="meet-type-badge">Webinar</span>
          <h1 className="meet-title">{room?.title || room?.room_code || roomCode}</h1>
          <span className="meet-code">
            <InfoIcon size={13} />
            {room?.room_code || roomCode}
          </span>
        </div>

        <div className="meet-header__right">
          <div className="meet-stat">
            <PeopleIcon size={14} />
            <span>{audienceCount} audience</span>
          </div>

          <button type="button"
            className={`meet-rail-btn ${panel === 'audience' ? 'active' : ''}`}
            onClick={() => togglePanel('audience')}
            aria-label="Toggle audience">
            <PeopleIcon size={16} /> Audience
          </button>

          {myRole === 'host' && (
            <button type="button"
              className={`meet-rail-btn ${panel === 'management' ? 'active' : ''}`}
              onClick={() => togglePanel('management')}
              aria-label="Toggle management">
              <PromoteIcon size={16} /> 
              Manage {raisedHands.length > 0 ? `(${raisedHands.length})` : ''}
            </button>
          )}
        </div>
      </header>

      <div className={`meet-body ${panel ? 'meet-body--panel-open' : ''}`}>
        <section className="meet-stage" style={{ position: 'relative' }}>
          {stageTracks.length === 0 ? (
            <div className="grid-empty">
              <div className="grid-empty__icon">
                <CameraOffIcon size={28} />
              </div>
              <h3>{myRole === 'host' ? 'Bring speakers to the stage' : 'Waiting for speakers'}</h3>
              <p>
                {myRole === 'host'
                  ? 'Promote audience members when they are ready to speak.'
                  : 'The stage will appear here when speakers publish audio or video.'}
              </p>
            </div>
          ) : (
            <div className={stageTracks.length === 1 ? 'video-grid video-grid--solo' : 'video-grid video-grid--quad'}>
              {stageTracks.map((trackRef) => (
                <VideoTile
                  key={`${trackRef.participant.identity}-${trackRef.source}`}
                  trackRef={trackRef}
                  variant={stageTracks.length === 1 ? 'solo' : 'tile'}
                />
              ))}
            </div>
          )}
          
          {flash && (
            <div className="meet-toast meet-toast--success">
              {flash}
            </div>
          )}
        </section>

        {panel && (
          <aside className="meet-rail" aria-label={panel === 'audience' ? 'Audience' : 'Management'}>
            <div className="meet-rail__head">
              <strong>{panel === 'audience' ? 'Audience' : 'Management'}</strong>
              <button type="button" className="meet-rail__close"
                onClick={() => setPanel(null)} aria-label="Close panel">
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="meet-rail__body">
              {panel === 'audience' ? (
                <div className="pax-panel">
                  {audience.length === 0 ? (
                    <div className="rail-empty">
                      <PeopleIcon size={24} />
                      <p>No audience yet</p>
                      <span>Viewers will appear here.</span>
                    </div>
                  ) : (
                    <div className="pax-list">
                      {audience.map((p) => {
                        const initials = (p.name || p.identity || 'U')
                          .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                        return (
                          <div className="pax-row" key={p.identity}>
                            <div className="pax-row__left">
                              <div className="pax-avatar">{initials}</div>
                              <div className="pax-info">
                                <strong>{p.name || p.identity}</strong>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="pax-panel">
                  {uniqueSpeakers.length > 0 && (
                    <div className="webinar-section">
                      <div className="webinar-section__label">On Stage</div>
                      <div className="pax-list">
                        {uniqueSpeakers.map((p) => {
                          const initials = (p.name || p.identity || 'U')
                            .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                          return (
                            <div className="pax-row" key={p.identity}>
                              <div className="pax-row__left">
                                <div className="pax-avatar">{initials}</div>
                                <div className="pax-info">
                                  <strong>{p.name || p.identity}</strong>
                                </div>
                              </div>
                              <div className="pax-row__right">
                                {!p.isLocal && (
                                  <button className="rail-icon-btn" onClick={() => handleDemote(p.identity)} title="Demote to audience">
                                    <RemoveUserIcon size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {raisedHands.length > 0 && (
                    <div className="webinar-section">
                      <div className="webinar-section__label">✋ Raised Hands</div>
                      <div className="pax-list">
                        {raisedHands.map((p) => {
                          const initials = (p.name || p.identity || 'U')
                            .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                          return (
                            <div className="pax-row" key={p.identity}>
                              <div className="pax-row__left">
                                <div className="pax-avatar">{initials}</div>
                                <div className="pax-info">
                                  <strong>{p.name || p.identity}</strong>
                                </div>
                              </div>
                              <div className="pax-row__right">
                                <button className="rail-icon-btn rail-icon-btn--primary" onClick={() => handlePromote(p.identity)} title="Promote to stage">
                                  <PromoteIcon size={14} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {uniqueSpeakers.length === 0 && raisedHands.length === 0 && (
                    <div className="rail-empty">
                      <p>No activity</p>
                      <span>Promote viewers or wait for hand raises.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      <footer className="meeting-dock" role="toolbar" aria-label="Webinar controls">
        <div className="meeting-dock__section meeting-dock__info">
          {/* We can put a clock here if needed, or leave blank */}
        </div>

        <div className="meeting-dock__section meeting-dock__center">
          {myRole !== 'audience' ? (
            <>
              <button type="button"
                className={`dock-btn ${!isMicrophoneEnabled ? 'dock-btn--off' : ''}`}
                onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                <span className="dock-btn__icon">
                  {isMicrophoneEnabled ? <MicOnIcon /> : <MicOffIcon />}
                </span>
                <span className="dock-btn__label">
                  {isMicrophoneEnabled ? 'Mute' : 'Unmute'}
                </span>
              </button>

              <button type="button"
                className={`dock-btn ${!isCameraEnabled ? 'dock-btn--off' : ''}`}
                onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
                aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}>
                <span className="dock-btn__icon">
                  {isCameraEnabled ? <CameraOnIcon /> : <CameraOffIcon />}
                </span>
                <span className="dock-btn__label">
                  {isCameraEnabled ? 'Stop video' : 'Start video'}
                </span>
              </button>

              <button type="button"
                className={`dock-btn ${localParticipant.isScreenShareEnabled ? 'dock-btn--active' : ''}`}
                onClick={() => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled)}
                aria-label={localParticipant.isScreenShareEnabled ? 'Stop screen share' : 'Share screen'}>
                <span className="dock-btn__icon">
                  {localParticipant.isScreenShareEnabled ? <ScreenShareOffIcon /> : <ScreenShareIcon />}
                </span>
                <span className="dock-btn__label">
                  {localParticipant.isScreenShareEnabled ? 'Stop' : 'Present'}
                </span>
              </button>
            </>
          ) : (
            <button type="button" className="dock-btn" onClick={handleRaiseHand}>
              <span className="dock-btn__icon"><HandRaiseIcon /></span>
              <span className="dock-btn__label">Raise hand</span>
            </button>
          )}
        </div>

        <div className="meeting-dock__section meeting-dock__end">
          <button type="button"
            className="dock-btn dock-btn--leave"
            onClick={handleLeave}
            aria-label="Leave webinar">
            <span className="dock-btn__icon"><LeaveIcon /></span>
            <span className="dock-btn__label">Leave</span>
          </button>
        </div>
      </footer>
    </div>
  )
}
