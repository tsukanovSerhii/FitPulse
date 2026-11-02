import { tStyle, activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function IsolationScene({ phase, className = '' }: SceneProps) {
  const armAngle = [10, 45, 90, 30][phase]
  const isPeak = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="195" x2="330" y2="195" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />

      <line x1="168" y1="195" x2="174" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
      <line x1="192" y1="195" x2="186" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
      <line x1="180" y1="135" x2="180" y2="82" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" />

      <circle cx="180" cy="62" r="11" fill={jointColor} />

      <circle
        cx="180"
        cy="100"
        r="16"
        fill={activeColor}
        fillOpacity={isPeak ? 0.35 : 0.15}
        stroke={activeColor}
        strokeWidth="2"
        strokeDasharray="4 4"
        style={{
          ...tStyle,
          filter: isPeak ? 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' : 'none',
        }}
      />

      <g
        style={{
          transformOrigin: '165px 84px',
          transform: `rotate(-${armAngle}deg)`,
          ...tStyle,
        }}
      >
        <line x1="165" y1="84" x2="148" y2="128" stroke={jointColor} strokeWidth="7" strokeLinecap="round" />
        <circle cx="148" cy="128" r="6" fill={jointColor} />
      </g>

      <g
        style={{
          transformOrigin: '195px 84px',
          transform: `rotate(${armAngle}deg)`,
          ...tStyle,
        }}
      >
        <line x1="195" y1="84" x2="212" y2="128" stroke={jointColor} strokeWidth="7" strokeLinecap="round" />
        <circle cx="212" cy="128" r="6" fill={jointColor} />
      </g>

      <g transform="translate(240, 35)">
        <rect x="0" y="0" width="100" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="50" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          БІОМЕХАНІКА
        </text>
        <text x="50" y="27" fill={isPeak ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isPeak ? 'Піковий фокус' : 'Підконтрольний рух'}
        </text>
      </g>
    </svg>
  )
}
