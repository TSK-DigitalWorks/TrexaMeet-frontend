import { useDataChannel, useLocalParticipant } from '@livekit/components-react'
import { useState, useRef, useEffect } from 'react'
import Button from '../common/Button'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export default function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const { localParticipant } = useLocalParticipant()

  const { send } = useDataChannel('trexa-chat', (msg) => {
    try {
      const parsed = JSON.parse(decoder.decode(msg.payload))
      setMessages((prev) => [...prev, { ...parsed, own: false }])
    } catch {}
  })

  const sendMsg = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const payload = {
      text: trimmed,
      sender: localParticipant.name || localParticipant.identity,
      ts: Date.now()
    }
    send(encoder.encode(JSON.stringify(payload)), { reliable: true })
    setMessages((prev) => [...prev, { ...payload, own: true }])
    setText('')
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      className="panel"
      style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', minHeight: 400 }}
    >
      <h3 style={{ margin: 0 }}>Chat</h3>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 ? (
          <p className="muted">No messages yet.</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.own ? 'right' : 'left' }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 2 }}>{msg.sender}</div>
              <span
                className="badge"
                style={{
                  display: 'inline-block',
                  maxWidth: '85%',
                  wordBreak: 'break-word',
                  background: msg.own ? '#e8f4f5' : '#f3f3f3',
                  color: msg.own ? '#0f5b61' : '#2c2c2c'
                }}
              >
                {msg.text}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMsg} className="row">
        <input
          className="input"
          style={{ flex: 1 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}
