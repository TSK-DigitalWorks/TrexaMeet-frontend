import { useEffect } from 'react'
import { useRoomContext } from '@livekit/components-react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/auth.store'
import useRoomStore from '../store/room.store'
import api from '../lib/api'

export default function useRolePromotion(roomCode) {
  const user        = useAuthStore((s) => s.user)
  const livekitUrl  = useRoomStore((s) => s.livekitUrl)
  const setMyRole   = useRoomStore((s) => s.setMyRole)
  const lkRoom      = useRoomContext()

  useEffect(() => {
    if (!supabase || !user?.user_id || !roomCode) return

    const channel = supabase
      .channel(`role-${user.user_id}-${roomCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'room_participants' },
        async (payload) => {
          // Client-side filter — only act on changes to this user's row
          if (payload.new?.user_id !== user.user_id) return

          const newRole = payload.new?.role
          if (!newRole) return

          setMyRole(newRole)
          console.log(`[TrexaMeet] role changed to ${newRole} — reconnecting LiveKit…`)

          try {
            // Get a fresh token matching the new role
            const { data } = await api.post(`/api/rooms/${roomCode}/join`)
            const url = data.livekit_url || livekitUrl
            if (url && data.livekit_token) {
              await lkRoom.connect(url, data.livekit_token, { autoSubscribe: true })
            }
          } catch (err) {
            console.error('[TrexaMeet] role reconnect failed:', err)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user?.user_id, roomCode, lkRoom, livekitUrl, setMyRole])
}
