import { useLocalParticipant, useRoomContext } from '@livekit/components-react'
import Button from '../common/Button'

export default function ControlBar({ onLeave, onToggleChat, onToggleParticipants }) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const room = useRoomContext()

  const handleLeave = async () => {
    await room.disconnect()
    onLeave?.()
  }

  return (
    <div className="control-bar">
      <Button
        variant="secondary"
        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
      >
        {isMicrophoneEnabled ? 'Mute mic' : 'Unmute mic'}
      </Button>

      <Button
        variant="secondary"
        onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
      >
        {isCameraEnabled ? 'Stop camera' : 'Start camera'}
      </Button>

      <Button
        variant="secondary"
        onClick={() => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled)}
      >
        {localParticipant.isScreenShareEnabled ? 'Stop share' : 'Share screen'}
      </Button>

      {onToggleChat && (
        <Button variant="secondary" onClick={onToggleChat}>Chat</Button>
      )}

      {onToggleParticipants && (
        <Button variant="secondary" onClick={onToggleParticipants}>People</Button>
      )}

      <Button variant="danger" onClick={handleLeave}>Leave</Button>
    </div>
  )
}
