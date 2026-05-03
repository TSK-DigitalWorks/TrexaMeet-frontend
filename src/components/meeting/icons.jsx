// Every icon in TrexaMeet — inline SVG, no emojis, no external deps
const p = {
  fill: 'none', stroke: 'currentColor', strokeWidth: 2,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
}

export const MicOnIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8"  y1="23" x2="16" y2="23"/>
  </svg>
)

export const MicOffIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8"  y1="23" x2="16" y2="23"/>
  </svg>
)

export const CameraOnIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
)

export const CameraOffIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export const ScreenShareIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
    <path d="M9 9l3-3 3 3M12 6v8"/>
  </svg>
)

export const ScreenShareOffIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M2 7.23V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/>
    <path d="M22 3H8L2 3M8 21h8M12 17v4"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
)

export const ChatIcon     = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

export const PeopleIcon   = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export const LeaveIcon    = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export const SendIcon     = ({ size = 16 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

export const HandRaiseIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/>
    <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8v-1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v1"/>
  </svg>
)

export const PromoteIcon  = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <polyline points="17 11 12 6 7 11"/>
    <line x1="12" y1="6" x2="12" y2="18"/>
  </svg>
)

export const RemoveUserIcon = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/>
    <path d="M2 21v-1a4 4 0 0 1 4-4h4M21 15l-5 5M21 20l-5-5"/>
    <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z"/>
  </svg>
)

export const CloseIcon    = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>
)

export const PhoneOffIcon = ({ size = 22 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 3.07.57 2 2 0 0 1 2 2 19.79 19.79 0 0 1-3.07 8.67 2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07l-.88-.88"/>
    <path d="M14.81 9.17A19.5 19.5 0 0 0 11.39 6a2 2 0 0 0-2 .17L7.66 7.44a2 2 0 0 0-.45 2.11 12.84 12.84 0 0 0 .7 2.81"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export const RefreshIcon  = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

export const InfoIcon     = ({ size = 18 }) => (
  <svg {...p} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"   y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
