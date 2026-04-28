export default function AudienceBar({ audienceCount = 0 }) {
  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Audience</h3>
      <p className="muted">{audienceCount} viewers are currently in this webinar.</p>
    </div>
  )
}
