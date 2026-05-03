import { create } from 'zustand'
import { setSession as writeMemory, clearSession as eraseMemory } from '../lib/auth'

const normalize = (user) => {
  if (!user) return null
  const id = user.user_id || user.userid || user.id || null
  return { ...user, user_id: id, userid: id }
}

const useAuthStore = create((set) => ({
  user: null,
  hydrated: false,

  setSession: ({ accessToken, accesstoken, user }) => {
    const token = accessToken || accesstoken
    const norm = normalize(user)

    if (!token || !norm) {
      set({ user: null, hydrated: true })
      return
    }

    writeMemory({ accessToken: token, user: norm })
    set({ user: norm, hydrated: true })
  },

  clearSession: () => {
    eraseMemory()
    set({ user: null, hydrated: true })
  },

  setHydrated: (v) => set({ hydrated: v }),
}))

export default useAuthStore
