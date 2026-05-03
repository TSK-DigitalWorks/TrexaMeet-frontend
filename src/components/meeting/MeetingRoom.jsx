import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParticipants, useDataChannel, useLocalParticipant } from '@livekit/components-react'
import VideoGrid from './VideoGrid'
import ControlBar from './ControlBar'
import ChatPanel from './ChatPanel'
import ParticipantPanel from './ParticipantPanel'
import { PeopleIcon, ChatIcon, CloseIcon } from './icons'
import useRoomStore from '../../store/room.store'

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

// ── Invite Modal ─────────────────────────────────────────────────────────────
function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value) } catch {
      const el = document.createElement('textarea')
      el.value = value; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="invite-field">
      <span className="invite-field-label">{label}</span>
      <div className="invite-field-row">
        <span className="invite-field-value">{value}</span>
        <button type="button" className={`invite-copy-btn${copied ? ' copied' : ''}`} onClick={copy} aria-label={`Copy ${label}`}>
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}

function InviteModal({ open, onClose, roomCode, roomTitle }) {
  const url = `${window.location.origin}/prejoin/${roomCode}`
  // Close on backdrop click
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose() }
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="invite-modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Invite participants">
      <div className="invite-modal-card">
        {/* Header */}
        <div className="invite-modal-header">
          <div className="invite-modal-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            Invite Participants
          </div>
          <button type="button" className="invite-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="invite-modal-body">
          {/* Room name — display only */}
          <div className="invite-field">
            <span className="invite-field-label">Meeting name</span>
            <div className="invite-field-row invite-field-row--readonly">
              <span className="invite-field-value">{roomTitle || roomCode}</span>
            </div>
          </div>

          {/* Room code + copy */}
          <CopyField label="Room code" value={roomCode} />

          {/* URL + copy */}
          <CopyField label="Meeting link" value={url} />
        </div>

        <p className="invite-modal-hint">Share the room code or link so others can join this meeting.</p>
      </div>
    </div>
  )
}

// ── Message popup ────────────────────────────────────────────────────────────
function MessagePopup({ popup, onClose, onOpen }) {
  if (!popup) return null
  return (
    <div className="msg-popup" role="status" onClick={onOpen} title="Open chat">
      <div className="msg-popup-header">
        <ChatIcon size={14} />
        <span className="msg-popup-sender">{popup.sender}</span>
        <button type="button" className="msg-popup-close" onClick={e => { e.stopPropagation(); onClose() }} aria-label="Dismiss">
          <CloseIcon size={12} />
        </button>
      </div>
      <p className="msg-popup-text">{popup.text}</p>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function MeetingRoom({ roomCode, room, onLeave }) {
  const [panel, setPanel] = useState(null)
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState(0)
  const [popup, setPopup] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const popupTimer = useRef(null)
  const panelRef = useRef(panel)
  panelRef.current = panel

  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const myRole = useRoomStore(s => s.myRole)
  useMeetingClock()

  useDataChannel('trexa-chat', useCallback((msg) => {
    try {
      const parsed = JSON.parse(decoder.decode(msg.payload))
      setMessages(prev => [...prev, { ...parsed, own: false }])
      if (panelRef.current !== 'chat') {
        setUnread(u => u + 1)
        clearTimeout(popupTimer.current)
        setPopup({ sender: parsed.sender, text: parsed.text })
        popupTimer.current = setTimeout(() => setPopup(null), 10000)
      }
    } catch {}
  }, []))

  const sendMessage = useCallback((text) => {
    const payload = { text, sender: localParticipant?.name || localParticipant?.identity || 'You', ts: Date.now() }
    setMessages(prev => [...prev, { ...payload, own: true }])
  }, [localParticipant])

  const togglePanel = useCallback((name) => {
    setPanel(p => {
      const next = p === name ? null : name
      if (next === 'chat') { setUnread(0); setPopup(null); clearTimeout(popupTimer.current) }
      return next
    })
  }, [])

  const typeLabel = useMemo(() => ({ webinar: 'Webinar', direct: '1-to-1 Call' }[room?.type] ?? 'Meeting'), [room?.type])
  const code = room?.roomcode || roomCode

  return (
    <div className="meet-page">
      {/* ── Header ── */}
      <header className="meet-header">
        <div className="meet-header-left">
          <span className="meet-type-badge">{typeLabel}</span>
          <h1 className="meet-title">{room?.title || code}</h1>
          {/* Invite button — opens modal */}
          <button type="button" className="invite-btn" onClick={() => setInviteOpen(true)} aria-label="Invite participants">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Invite
          </button>
        </div>
        <div className="meet-header-right">
          <div className="meet-stat"><PeopleIcon size={14} /><span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span></div>
          <button type="button" className={`meet-rail-btn${panel === 'participants' ? ' active' : ''}`} onClick={() => togglePanel('participants')} aria-label="Toggle participants">
            <PeopleIcon size={15} /> People
          </button>
          <button type="button" className={`meet-rail-btn${panel === 'chat' ? ' active' : ''}`} onClick={() => togglePanel('chat')} aria-label="Toggle chat">
            <ChatIcon size={15} /> Chat
            {unread > 0 && <span className="chat-badge" aria-label={`${unread} unread`}>{unread > 9 ? '9+' : unread}</span>}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={`meet-body${panel ? ' meet-body--panel-open' : ''}`}>
        <section className="meet-stage"><VideoGrid /></section>
        {panel && (
          <aside className="meet-rail" aria-label={panel === 'chat' ? 'In-call chat' : 'Participants'}>
            <div className="meet-rail-head">
              <strong>{panel === 'chat' ? 'In-call chat' : `People (${participants.length})`}</strong>
              <button type="button" className="meet-rail-close" onClick={() => setPanel(null)} aria-label="Close panel"><CloseIcon size={16} /></button>
            </div>
            <div className="meet-rail-body">
              {panel === 'chat'
                ? <ChatPanel messages={messages} onSend={sendMessage} />
                : <ParticipantPanel roomCode={roomCode} myRole={room?.myrole ?? myRole} />
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

      <MessagePopup popup={popup} onClose={() => { setPopup(null); clearTimeout(popupTimer.current) }} onOpen={() => togglePanel('chat')} />

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roomCode={code}
        roomTitle={room?.title}
      />
    </div>
  )
}
