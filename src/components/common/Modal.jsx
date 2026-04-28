export default function Modal({ open, children }) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-card">{children}</div>
    </div>
  )
}
