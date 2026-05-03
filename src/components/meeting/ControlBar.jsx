import { useLocalParticipant, useRoomContext } from '@livekit/components-react'
import {
  MicOnIcon, MicOffIcon, CameraOnIcon, CameraOffIcon,
  ScreenShareIcon, ScreenShareOffIcon, ChatIcon, PeopleIcon, LeaveIcon
} from './icons'

export default function ControlBar({
  onLeave, onToggleChat, onToggleParticipants,
  chatOpen, peopleOpen, unread = 0
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const room = useRoomContext()
  const isScreenSharing = localParticipant?.isScreenShareEnabled

  const handleLeave = async () => {
    await room.disconnect()
    onLeave?.()
  }

  return (
    <footer className="meeting-dock" role="toolbar" aria-label="Meeting controls">
      {/* Left — clock */}
      <div className="meeting-dock-section meeting-dock-info">
        <div className="meeting-dock-time" id="meeting-clock" aria-live="polite" />
      </div>

      {/* Centre — media controls */}
      <div className="meeting-dock-section meeting-dock-center">
        <button
          type="button"
          className={`dock-btn${!isMicrophoneEnabled ? ' dock-btn--off' : ''}`}
          onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
          aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          <span className="dock-btn-icon">{isMicrophoneEnabled ? <MicOnIcon size={18} /> : <MicOffIcon size={18} />}</span>
          <span className="dock-btn-label">{isMicrophoneEnabled ? 'Mute' : 'Unmute'}</span>
        </button>

        <button
          type="button"
          className={`dock-btn${!isCameraEnabled ? ' dock-btn--off' : ''}`}
          onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
          aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          <span className="dock-btn-icon">{isCameraEnabled ? <CameraOnIcon size={18} /> : <CameraOffIcon size={18} />}</span>
          <span className="dock-btn-label">{isCameraEnabled ? 'Stop video' : 'Start video'}</span>
        </button>

        <button
          type="button"
          className={`dock-btn${isScreenSharing ? ' dock-btn--active' : ''}`}
          onClick={() => localParticipant.setScreenShareEnabled(!isScreenSharing)}
          aria-label={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          <span className="dock-btn-icon">{isScreenSharing ? <ScreenShareOffIcon size={18} /> : <ScreenShareIcon size={18} />}</span>
          <span className="dock-btn-label">{isScreenSharing ? 'Stop' : 'Present'}</span>
        </button>

        <div className="dock-divider" aria-hidden="true" />

        {/* Chat — badge shows unread count when closed */}
        <button
          type="button"
          className={`dock-btn${chatOpen ? ' dock-btn--active' : ''}`}
          onClick={onToggleChat}
          aria-label="Toggle chat"
          style={{ position: 'relative' }}
        >
          <span className="dock-btn-icon" style={{ position: 'relative' }}>
            <ChatIcon size={18} />
            {unread > 0 && !chatOpen && (
              <span className="dock-chat-badge" aria-label={`${unread} unread messages`}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </span>
          <span className="dock-btn-label">Chat</span>
        </button>

        <button
          type="button"
          className={`dock-btn${peopleOpen ? ' dock-btn--active' : ''}`}
          onClick={onToggleParticipants}
          aria-label="Toggle participants"
        >
          <span className="dock-btn-icon"><PeopleIcon size={18} /></span>
          <span className="dock-btn-label">People</span>
        </button>
      </div>

      {/* Right — leave */}
      <div className="meeting-dock-section meeting-dock-end">
        <button type="button" className="dock-btn dock-btn--leave" onClick={handleLeave} aria-label="Leave meeting">
          <span className="dock-btn-icon"><LeaveIcon size={18} /></span>
          <span className="dock-btn-label">Leave</span>
        </button>
      </div>
    </footer>
  )
}
