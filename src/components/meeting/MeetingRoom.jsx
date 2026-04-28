import { useState } from 'react'
import { useParticipants, useRoomContext } from '@livekit/components-react'
import api from '../../lib/api'
import VideoGrid from './VideoGrid'
import ControlBar from './ControlBar'
import ChatPanel from './ChatPanel'
import ParticipantPanel from './ParticipantPanel'
import DirectCallWaiting from './DirectCallWaiting'

export default function MeetingRoom({ roomCode, room, myRole, onLeave }) {
  const [panel, setPanel] = useState(null) // 'chat' | 'participants' | null
  const participants  = useParticipants()
  const lkRoom        = useRoomContext()
  const isDirectCall  = room?.type === 'direct'
  const isWaiting     = isDirectCall && participants.length < 2

  const togglePanel = (name) => setPanel((prev) => (prev === name ? null : name))

  const handleCancelCall = async () => {
    try { await api.post('/api/call/cancel', { room_code: roomCode }) } catch {}
    await lkRoom.disconnect()
    onLeave()
  }

  return (
    <div className="room-layout">
      <section className="video-stage">
        {/* Header */}
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge">{room?.type || 'group'} call</span>
            <h2 style={{ margin: '6px 0 2px' }}>{room?.title || room?.room_code || roomCode}</h2>
            <span style={{ color: '#b7c8cc', fontSize: 13 }}>
              Code: {room?.room_code || roomCode} · You: {myRole}
            </span>
          </div>
        </div>

        {/* Video area */}
        {isWaiting ? (
          <DirectCallWaiting onCancel={handleCancelCall} />
        ) : (
          <VideoGrid />
        )}

        {/* Controls */}
        <ControlBar
          onLeave={onLeave}
          onToggleChat={() => togglePanel('chat')}
          onToggleParticipants={() => togglePanel('participants')}
        />
      </section>

      {/* Side panel */}
      {panel === 'chat'         && <ChatPanel />}
      {panel === 'participants' && <ParticipantPanel />}
      {!panel && (
        <div className="panel" style={{ display: 'grid', placeItems: 'center' }}>
          <p className="muted" style={{ textAlign: 'center' }}>
            Click Chat or People to open the side panel.
          </p>
        </div>
      )}
    </div>
  )
}
