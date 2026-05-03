import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useRoomStore from '../store/room.store'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'

export default function IncomingCall() {
  const navigate            = useNavigate()
  const incomingInvite      = useRoomStore((s) => s.incomingInvite)
  const clearIncomingInvite = useRoomStore((s) => s.clearIncomingInvite)
  const setRoomPayload      = useRoomStore((s) => s.setRoomPayload)

  const handleRespond = async (action) => {
    if (!incomingInvite?.id) return
    try {
      const { data } = await api.post('/api/call/respond', {
        inviteid: incomingInvite.id,
        action,
      })
      if (action === 'accept') {
        setRoomPayload({
          ...data,
          room:   { roomcode: data.roomcode, type: 'direct' },
          myrole: 'speaker',
        })
        navigate(`/room/${data.roomcode}`, { state: data })
      }
    } catch {}
    finally {
      clearIncomingInvite()
    }
  }

  // Supabase row uses room_code (underscore) — support both just in case
  const displayCode = incomingInvite?.room_code || incomingInvite?.roomcode

  return (
    <Modal open={Boolean(incomingInvite)}>
      <div className="incoming-call-body">
        <div className="incoming-call-avatar">
          {incomingInvite?.invited_by_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="badge" style={{ marginBottom: 8 }}>Incoming Call</div>
        <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>
          {incomingInvite?.invited_by_name || 'Someone'} is calling
        </h2>
        <p className="muted">Room: {displayCode}</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Button onClick={() => handleRespond('accept')}>Accept</Button>
          <Button variant="danger" onClick={() => handleRespond('decline')}>Decline</Button>
        </div>
      </div>
    </Modal>
  )
}
