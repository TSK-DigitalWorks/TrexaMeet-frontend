import { useEffect, useMemo, useState } from 'react'
import { useParticipants } from '@livekit/components-react'
import VideoGrid from './VideoGrid'
import ControlBar from './ControlBar'
import ChatPanel from './ChatPanel'
import ParticipantPanel from './ParticipantPanel'
import { PeopleIcon, ChatIcon, InfoIcon, CloseIcon } from './icons'

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

function InviteModal({ roomCode, onClose }) {
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const joinLink = `${window.location.origin}/prejoin/${roomCode}`

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  return (
    <div className="invite-backdrop" onClick={onClose}>
      <div className="invite-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="invite-header">
          <div className="invite-header-left">
            <div className="invite-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <div className="invite-title">Invite people</div>
              <div className="invite-subtitle">Share the code or link to let others join</div>
            </div>
          </div>
          <button className="invite-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={15} />
          </button>
        </div>

        {/* Room Code */}
        <div className="invite-section">
          <div className="invite-section-label">Room code</div>
          <div className="invite-copy-row">
            <div className="invite-mono">{roomCode}</div>
            <button
              className={`invite-btn${codeCopied ? ' invite-btn--success' : ''}`}
              onClick={copyCode}
            >
              {codeCopied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="invite-divider" />

        {/* Join Link */}
        <div className="invite-section">
          <div className="invite-section-label">Join link</div>
          <div className="invite-copy-row">
            <div className="invite-link-text">{joinLink}</div>
            <button
              className={`invite-btn${linkCopied ? ' invite-btn--success' : ''}`}
              onClick={copyLink}
            >
              {linkCopied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function MeetingRoom({ roomCode, room, onLeave }) {
  const [panel, setPanel] = useState(null)
  const [unread, setUnread] = useState(0)
  const [showInvite, setShowInvite] = useState(false)
  const participants = useParticipants()
  useMeetingClock()

  const typeLabel = useMemo(() => ({
    direct: '1-to-1 call',
    webinar: 'Webinar',
  }[room?.type] ?? 'Meeting'), [room?.type])

  const togglePanel = (name) => setPanel(p => p === name ? null : name)

  useEffect(() => {
    if (panel === 'chat') setUnread(0)
  }, [panel])

  return (
    <div className="meet-page">

      <header className="meet-header">

        {/* LEFT — brand only */}
        <div className="meet-header-left">
          <img src="/logo.png" alt="TrexaMeet" className="meet-brand-logo" />
          <span className="meet-brand-name">TrexaMeet</span>
        </div>

        {/* RIGHT — everything else */}
        <div className="meet-header-right">
          <span className="meet-type-badge">{typeLabel}</span>
          <h1 className="meet-title">{room?.title || room?.roomcode || roomCode}</h1>
          <span className="meet-code">
            <InfoIcon size={13} />
            {room?.roomcode || roomCode}
          </span>

          <span className="meet-header-divider" aria-hidden="true" />

          <div className="meet-stat">
            <PeopleIcon size={14} />
            <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          </div>

          <button
            type="button"
            className={`meet-rail-btn${panel === 'participants' ? ' active' : ''}`}
            onClick={() => togglePanel('participants')}
            aria-label="Toggle participants"
          >
            <PeopleIcon size={16} /> People
          </button>

          <button
            type="button"
            className={`meet-rail-btn${panel === 'chat' ? ' active' : ''}`}
            onClick={() => togglePanel('chat')}
            aria-label="Toggle chat"
          >
            <span className="meet-chat-inner">
              <ChatIcon size={16} />
              Chat
              {unread > 0 && (
                <span className="meet-chat-badge" aria-label={`${unread} unread`}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            className={`meet-rail-btn${showInvite ? ' active' : ''}`}
            onClick={() => setShowInvite(v => !v)}
            aria-label="Invite people"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Invite
          </button>
        </div>
      </header>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          roomCode={room?.roomcode || roomCode}
          onClose={() => setShowInvite(false)}
        />
      )}

      <div className={`meet-body${panel ? ' meet-body--panel-open' : ''}`}>
        <section className="meet-stage">
          <VideoGrid />
        </section>
        {panel && (
          <aside className="meet-rail" aria-label={panel === 'chat' ? 'In-call chat' : 'Participants'}>
            <div className="meet-rail-head">
              <strong>{panel === 'chat' ? 'In-call chat' : `People · ${participants.length}`}</strong>
              <button type="button" className="meet-rail-close"
                onClick={() => setPanel(null)} aria-label="Close panel">
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="meet-rail-body">
              {panel === 'chat'
                ? <ChatPanel onNewMessage={() => { if (panel !== 'chat') setUnread(n => n + 1) }} />
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
      />
    </div>
  )
}
