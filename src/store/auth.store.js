import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  hydrated: false,
  setSession: ({ user, access_token }) => set({ user, accessToken: access_token, hydrated: true }),
  clearSession: () => set({ user: null, accessToken: null, hydrated: true }),
  setHydrated: (value) => set({ hydrated: value })
}))

export default useAuthStore
