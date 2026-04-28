import { create } from 'zustand'

const useRoomStore = create((set) => ({
  room: null,
  participants: [],
  myRole: null,
  livekitToken: null,
  livekitUrl: null,
  incomingInvite: null,
  preJoin: {
    micEnabled: true,
    camEnabled: true,
    selectedMicId: '',
    selectedCameraId: ''
  },

  setRoomPayload: (payload) => set({
    room:         payload.room         || null,
    participants: payload.participants || [],
    myRole:       payload.my_role      || null,
    livekitToken: payload.livekit_token || null,
    livekitUrl:   payload.livekit_url   || null
  }),

  setMyRole:           (myRole) => set({ myRole }),
  setParticipants:     (participants) => set({ participants }),
  setIncomingInvite:   (incomingInvite) => set({ incomingInvite }),
  clearIncomingInvite: () => set({ incomingInvite: null }),
  updatePreJoin:       (patch) => set((s) => ({ preJoin: { ...s.preJoin, ...patch } })),

  resetRoom: () => set({
    room: null, participants: [], myRole: null,
    livekitToken: null, livekitUrl: null
  })
}))

export default useRoomStore
