export default function StageView({ speakers = [] }) {
  return (
    <div className="video-grid">
      {speakers.length === 0 ? (
        <div className="empty-state">No speakers are on stage yet.</div>
      ) : speakers.map((speaker) => (
        <div key={speaker.user_id} className="video-tile">
          <span className="badge">Speaker</span>
          <strong>{speaker.user_name}</strong>
        </div>
      ))}
    </div>
  )
}
