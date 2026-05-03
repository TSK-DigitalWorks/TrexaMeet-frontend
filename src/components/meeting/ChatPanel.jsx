import { useDataChannel, useLocalParticipant } from '@livekit/components-react'
import { useState, useRef, useEffect } from 'react'
import { SendIcon } from './icons'

const encoder = new TextEncoder()

export default function ChatPanel({ messages = [], onSend }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const { localParticipant } = useLocalParticipant()

  // useDataChannel here is SEND-only — receive is handled in MeetingRoom
  const { send } = useDataChannel('trexa-chat', () => {})

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMsg = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const payload = { text: trimmed, sender: localParticipant?.name || localParticipant?.identity, ts: Date.now() }
    send(encoder.encode(JSON.stringify(payload)), { reliable: true })
    onSend?.(trimmed) // add to parent state as own message
    setText('')
  }

  return (
    <div className="chat-panel">
      <div className="chat-feed">
        {messages.length === 0 ? (
          <div className="rail-empty">
            <p>No messages yet</p>
            <span>Messages shared in this meeting will appear here.</span>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.own ? 'chat-msg--own' : ''}`}>
              <div className="chat-msg-meta">
                <span className="chat-msg-sender">{msg.own ? 'You' : msg.sender}</span>
                <span className="chat-msg-time">
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="chat-msg-bubble">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMsg} className="chat-compose">
        <input
          className="chat-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Send a message…"
          autoComplete="off"
        />
        <button type="submit" className="chat-send" disabled={!text.trim()} aria-label="Send message">
          <SendIcon size={15} />
        </button>
      </form>
    </div>
  )
}
