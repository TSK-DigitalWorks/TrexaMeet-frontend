import { useRef, useEffect, useState } from 'react'
import { useDataChannel, useLocalParticipant } from '@livekit/components-react'
import { SendIcon } from './icons'

const encoder = new TextEncoder()

export default function ChatPanel({ messages = [], onSend }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const { localParticipant } = useLocalParticipant()

  const { send } = useDataChannel('trexa-chat')

  const sendMsg = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const payload = {
      text: trimmed,
      sender: localParticipant?.name || localParticipant?.identity || 'You',
      ts: Date.now(),
    }
    send(encoder.encode(JSON.stringify(payload)), { reliable: true })
    onSend?.(trimmed)
    setText('')
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-panel">
      <div className="chat-feed">
        {messages.length === 0 ? (
          <div className="rail-empty">
            <p>No messages yet</p>
            <span>Messages shared in the meeting will appear here.</span>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-msg${msg.own ? ' chat-msg--own' : ''}`}>
              <div className="chat-msg-meta">
                <span className="chat-msg-sender">{msg.sender}</span>
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
          placeholder="Send a message"
        />
        <button type="submit" className="chat-send" disabled={!text.trim()}>
          <SendIcon />
        </button>
      </form>
    </div>
  )
}
