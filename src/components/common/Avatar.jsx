export default function Avatar({ name = 'U' }) {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || 'U'
  return <div className="avatar">{letter}</div>
}
