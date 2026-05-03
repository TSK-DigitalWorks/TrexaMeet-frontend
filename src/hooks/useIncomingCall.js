import { useEffect } from 'react'
import useAuthStore from '../store/auth.store'
import useRoomStore from '../store/room.store'
import { supabase } from '../lib/supabase'

export default function useIncomingCall() {
  const user             = useAuthStore((s) => s.user)
  const setIncomingInvite = useRoomStore((s) => s.setIncomingInvite)

  useEffect(() => {
    // user_id is now always normalized by auth.store — safe to use either field
    const userId = user?.user_id || user?.userid
    if (!supabase || !userId) return

    const channel = supabase
      .channel(`room-invites-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_invites',
          filter: `invited_user_id=eq.${userId}`,
        },
        (payload) => {
          setIncomingInvite(payload.new)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [setIncomingInvite, user?.user_id])
}
