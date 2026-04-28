import { useEffect } from 'react'
import useAuthStore from '../store/auth.store'
import useRoomStore from '../store/room.store'
import { supabase } from '../lib/supabase'

export default function useIncomingCall() {
  const user = useAuthStore((state) => state.user)
  const setIncomingInvite = useRoomStore((state) => state.setIncomingInvite)

  useEffect(() => {
    if (!supabase || !user?.user_id) return

    const channel = supabase
      .channel(`room-invites-${user.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_invites',
          filter: `invited_user_id=eq.${user.user_id}`
        },
        (payload) => {
          setIncomingInvite(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [setIncomingInvite, user?.user_id])
}
