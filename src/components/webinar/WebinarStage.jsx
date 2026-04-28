import {
  useTracks, useParticipants, useDataChannel,
  useLocalParticipant, useRoomContext
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useState } from 'react'
import api from '../../lib/api'
import useRolePromotion from '../../hooks/useRolePromotion'
import VideoTile from '../meeting/VideoTile'
import Button from '../common/Button'
import Avatar from '../common/Avatar'

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

  // DataChannel: receive raise-hand signals (host sees them)
  const { send: sendHand } = useDataChannel('trexa-raise-hand', (msg) => {
    try {
      const data = JSON.parse(decoder.decode(msg.payload))
      setRaisedHands((prev) =>
        prev.find((p) => p.identity === data.identity) ? prev : [...prev, data]
      )
    } catch {}
  })

  // Only participants with camera/screen-share tracks are "on stage"
  const stageTracks = useTracks(
    [
      { source: Track.Source.Camera,      withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  )

  // Audience = participants without any stage track
  const stageIdentities = new Set(stageTracks.map((t) => t.participant.identity))
  const audienceCount = participants.filter((p) => !stageIdentities.has(p.identity)).length

  const showFlash = (msg) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2600)
  }

  const handleRaiseHand = () => {
    const payload = encoder.encode(
      JSON.stringify({ identity: localParticipant.identity, name: localParticipant.name })
    )
    sendHand(payload, { reliable: true })
    showFlash('✋ Hand raised — the host will see your request.')
  }

  const handlePromote = async (identity) => {
    try {
      await api.post(`/api/webinar/${roomCode}/promote`, { participant_user_id: identity })
      setRaisedHands((prev) => prev.filter((p) => p.identity !== identity))
      showFlash(`${identity} promoted. They will reconnect with mic/camera automatically.`)
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

  // Deduplicate speakers by identity
  const uniqueSpeakers = [
    ...new Map(stageTracks.map((t) => [t.participant.identity, t.participant])).values()
  ]

  return (
    <div className="room-layout">
      {/* ── Stage ─────────────────────────────────────────────────── */}
      <section className="video-stage">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge">Webinar</span>
            <h2 style={{ margin: '6px 0 2px' }}>{room?.title || room?.room_code || roomCode}</h2>
            <span style={{ color: '#b7c8cc', fontSize: 13 }}>
              Code: {room?.room_code || roomCode} · You: {myRole}
            </span>
          </div>
        </div>

        {stageTracks.length === 0 ? (
          <div className="empty-state" style={{ background: 'rgba(255,255,255,0.04)', color: '#9bb4b8' }}>
            {myRole === 'host'
              ? 'You are the host — promote audience members to bring them on stage.'
              : 'Waiting for speakers to go live…'}
          </div>
        ) : (
          <div className="video-grid">
            {stageTracks.map((trackRef) => (
              <VideoTile
                key={`${trackRef.participant.identity}-${trackRef.source}`}
                trackRef={trackRef}
              />
            ))}
          </div>
        )}

        {flash && <div className="badge" style={{ maxWidth: '100%', wordBreak: 'break-word' }}>{flash}</div>}

        {/* Controls */}
        <div className="control-bar">
          {myRole !== 'audience' ? (
            <>
              <Button variant="secondary" onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}>
                {isMicrophoneEnabled ? 'Mute' : 'Unmute'}
              </Button>
              <Button variant="secondary" onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}>
                {isCameraEnabled ? 'Stop cam' : 'Start cam'}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={handleRaiseHand}>✋ Raise hand</Button>
          )}
          <Button variant="danger" onClick={handleLeave}>Leave</Button>
        </div>
      </section>

      {/* ── Side panel ────────────────────────────────────────────── */}
      <div className="page-stack">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Audience</h3>
          <p className="muted">{audienceCount} viewer{audienceCount !== 1 ? 's' : ''} watching live.</p>
        </div>

        {myRole === 'host' && uniqueSpeakers.length > 0 && (
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>On stage</h3>
            <div className="info-list">
              {uniqueSpeakers.map((p) => (
                <div className="info-item" key={p.identity}>
                  <div className="row" style={{ alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                    <Avatar name={p.name} />
                    <strong>{p.name || p.identity}</strong>
                  </div>
                  {!p.isLocal && (
                    <Button variant="secondary" onClick={() => handleDemote(p.identity)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {myRole === 'host' && raisedHands.length > 0 && (
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>✋ Raised hands ({raisedHands.length})</h3>
            <div className="info-list">
              {raisedHands.map((p) => (
                <div className="info-item" key={p.identity}>
                  <div className="row" style={{ alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                    <Avatar name={p.name} />
                    <strong>{p.name || p.identity}</strong>
                  </div>
                  <Button onClick={() => handlePromote(p.identity)}>Let speak</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
