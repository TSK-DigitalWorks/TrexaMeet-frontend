import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './pages/AuthGuard'
import AppLayout from './components/layout/AppLayout'
import IncomingCall from './pages/IncomingCall'
import Home from './pages/Home'
import NewMeeting from './pages/NewMeeting'
import JoinMeeting from './pages/JoinMeeting'
import PreJoin from './pages/PreJoin'
import Room from './pages/Room'
import WebinarRoom from './pages/WebinarRoom'
import History from './pages/History'
import useAuth from './hooks/useAuth'
import useIncomingCall from './hooks/useIncomingCall'

function ProtectedShell() {
  useAuth()
  useIncomingCall()

  return (
    <AuthGuard>
      <AppLayout>
        <IncomingCall />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewMeeting />} />
          <Route path="/join" element={<JoinMeeting />} />
          <Route path="/prejoin/:roomCode" element={<PreJoin />} />
          <Route path="/room/:roomCode" element={<Room />} />
          <Route path="/webinar/:roomCode" element={<WebinarRoom />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </AuthGuard>
  )
}

export default function App() {
  return <ProtectedShell />
}
