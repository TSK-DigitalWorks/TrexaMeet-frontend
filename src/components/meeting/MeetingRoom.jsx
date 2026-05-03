import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParticipants, useDataChannel, useLocalParticipant } from '@livekit/components-react'
import VideoGrid from './VideoGrid'
import ControlBar from './ControlBar'
import ChatPanel from './ChatPanel'
import ParticipantPanel from './ParticipantPanel'
import { PeopleIcon, ChatIcon, InfoIcon, CloseIcon } from './icons'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function useMeetingClock() {
  useEffect(() => {
    const el = document.getElementById('meeting-clock')
    if (!el) return
    const start = Date.now()
    const tick = () => {
      const d = Math.floor((Date.now() - start) / 1000)
      const h = Math.floor(d / 3600)
      const m = Math.floor((d % 3600) / 60).toString().padStart(2, '0')
      const s = (d % 60).toString().padStart(2, '0')
      el.textContent = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
}

// Slide-in message popup (Google Meet style) — bottom-right corner
function MessagePopup({ popup, onClose, onOpen }) {
  if (!popup) return null
  return (
    <div className="msg-popup" role="status" onClick={onOpen} title="Open chat">
      <div className="msg-popup-header">
        <ChatIcon size={14} />
        <span className="msg-popup-sender">{popup.sender}</span>
        <button
          type="button"
          className="msg-popup-close"
          onClick={e => { e.stopPropagation(); onClose() }}
          aria-label="Dismiss"
        >
          <CloseIcon size={12} />
        </button>
      </div>
      <p className="msg-popup-text">{popup.text}</p>
    </div>
  )
}

// Copy-to-clipboard invite button
function InviteButton({ roomCode }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/prejoin/${roomCode}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      className={`invite-btn ${copied ? 'invite-btn--copied' : ''}`}
      onClick={handleCopy}
      aria-label="Copy invite link"
      title={copied ? 'Link copied!' : 'Copy invite link'}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Invite
        </>
      )}
    </button>
  )
}

export default function MeetingRoom({ roomCode, room, onLeave }) {
  const [panel, setPanel] = useState(null)
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState(0)
  const [popup, setPopup] = useState(null)
  const popupTimer = useRef(null)
  const panelRef = useRef(panel)
  panelRef.current = panel

  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  useMeetingClock()

  // Receive chat — lives here so messages persist when panel closes
  useDataChannel('trexa-chat', useCallback((msg) => {
    try {
      const parsed = JSON.parse(decoder.decode(msg.payload))
      const newMsg = { ...parsed, own: false }
      setMessages(prev => [...prev, newMsg])
      // Show popup only when chat panel is NOT open
      if (panelRef.current !== 'chat') {
        setUnread(u => u + 1)
        clearTimeout(popupTimer.current)
        setPopup({ sender: parsed.sender, text: parsed.text })
        popupTimer.current = setTimeout(() => setPopup(null), 4000)
      }
    } catch {}
  }, []))

  const sendMessage = useCallback((text) => {
    const payload = {
      text,
      sender: localParticipant?.name || localParticipant?.identity || 'You',
      ts: Date.now(),
    }
    setMessages(prev => [...prev, { ...payload, own: true }])
  }, [localParticipant])

  const togglePanel = useCallback((name) => {
    setPanel(p => {
      const next = p === name ? null : name
      if (next === 'chat') {
        setUnread(0)
        setPopup(null)
        clearTimeout(popupTimer.current)
      }
      return next
    })
  }, [])

  const typeLabel = useMemo(() => ({
    webinar: 'Webinar',
    direct: '1-to-1 Call',
  }[room?.type] ?? 'Meeting'), [room?.type])

  return (
    <div className="meet-page">
      {/* ── Header ── */}
      <header className="meet-header">
        <div className="meet-header-left">
          <span className="meet-type-badge">{typeLabel}</span>
          <h1 className="meet-title">{room?.title || room?.roomcode || roomCode}</h1>
          <InviteButton roomCode={room?.roomcode || roomCode} />
        </div>

        <div className="meet-header-right">
          <div className="meet-stat">
            <PeopleIcon size={14} />
            <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            type="button"
            className={`meet-rail-btn ${panel === 'participants' ? 'active' : ''}`}
            onClick={() => togglePanel('participants')}
            aria-label="Toggle participants"
          >
            <PeopleIcon size={15} /> People
          </button>
          <button
            type="button"
            className={`meet-rail-btn ${panel === 'chat' ? 'active' : ''}`}
            onClick={() => togglePanel('chat')}
            aria-label="Toggle chat"
          >
            <ChatIcon size={15} /> Chat
            {unread > 0 && (
              <span className="chat-badge" aria-label={`${unread} unread messages`}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={`meet-body ${panel ? 'meet-body--panel-open' : ''}`}>
        <section className="meet-stage">
          <VideoGrid />
        </section>

        {panel && (
          <aside className="meet-rail" aria-label={panel === 'chat' ? 'In-call chat' : 'Participants'}>
            <div className="meet-rail-head">
              <strong>
                {panel === 'chat' ? 'In-call chat' : `People (${participants.length})`}
              </strong>
              <button
                type="button"
                className="meet-rail-close"
                onClick={() => setPanel(null)}
                aria-label="Close panel"
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="meet-rail-body">
              {panel === 'chat'
                ? <ChatPanel messages={messages} onSend={sendMessage} />
                : <ParticipantPanel />
              }
            </div>
          </aside>
        )}
      </div>

      <ControlBar
        onLeave={onLeave}
        onToggleChat={() => togglePanel('chat')}
        onToggleParticipants={() => togglePanel('participants')}
        chatOpen={panel === 'chat'}
        peopleOpen={panel === 'participants'}
        unread={unread}
      />

      {/* Google-Meet-style message popup — bottom-right */}
      <MessagePopup
        popup={popup}
        onClose={() => { setPopup(null); clearTimeout(popupTimer.current) }}
        onOpen={() => togglePanel('chat')}
      />
    </div>
  )
}
