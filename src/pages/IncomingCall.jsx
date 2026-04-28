import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useRoomStore from '../store/room.store'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'

export default function IncomingCall() {
  const navigate = useNavigate()
  const incomingInvite = useRoomStore((state) => state.incomingInvite)
  const clearIncomingInvite = useRoomStore((state) => state.clearIncomingInvite)
  const setRoomPayload = useRoomStore((state) => state.setRoomPayload)

  const handleRespond = async (action) => {
    if (!incomingInvite?.id) return

    try {
      const { data } = await api.post('/api/call/respond', {
        invite_id: incomingInvite.id,
        action
      })

      if (action === 'accept') {
        setRoomPayload({
          room: { room_code: data.room_code, type: 'direct' },
          participants: [],
          my_role: 'speaker'
        })
        navigate(`/room/${data.room_code}`, { state: data })
      }
    } catch {
    } finally {
      clearIncomingInvite()
    }
  }

  return (
    <Modal open={Boolean(incomingInvite)}>
      <div className="page-stack">
        <div>
          <span className="badge">Incoming call</span>
          <h2>{incomingInvite?.invited_by_name || 'Someone'} is calling</h2>
          <p className="muted">Room code: {incomingInvite?.room_code}</p>
        </div>
        <div className="row">
          <Button onClick={() => handleRespond('accept')}>Accept</Button>
          <Button variant="danger" onClick={() => handleRespond('decline')}>Decline</Button>
        </div>
      </div>
    </Modal>
  )
}
