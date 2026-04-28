export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const map = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger'
  }

  return (
    <button className={`${map[variant] || map.primary} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
