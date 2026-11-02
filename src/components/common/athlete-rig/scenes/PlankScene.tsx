import { activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function PlankScene({ className = '' }: SceneProps) {
  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="185" x2="330" y2="185" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />
      <rect x="70" y="183" width="220" height="5" rx="2" fill="var(--surface-2)" />

      <line x1="120" y1="183" x2="145" y2="183" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />
      <line x1="145" y1="183" x2="145" y2="145" stroke={jointColor} strokeWidth="7" strokeLinecap="round" />

      <circle cx="265" cy="180" r="5" fill={jointColor} />

      <line x1="265" y1="180" x2="145" y2="145" stroke={bodyColor} strokeWidth="12" strokeLinecap="round" />

      <line
        x1="210"
        y1="165"
        x2="160"
        y2="150"
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.9))',
        }}
      />

      <circle cx="125" cy="142" r="10" fill={jointColor} />

      <g transform="translate(240, 35)">
        <rect x="0" y="0" width="105" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="52" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          СТАБІЛІЗАЦІЯ
        </text>
        <text x="52" y="27" fill="var(--accent)" fontSize="11" fontWeight="900" textAnchor="middle">
          Кор в одній лінії
        </text>
      </g>
    </svg>
  )
}
