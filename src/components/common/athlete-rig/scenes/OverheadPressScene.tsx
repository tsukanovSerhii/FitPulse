import { tStyle, activeColor, bodyColor, jointColor, equipmentColor } from '../palette'
import type { SceneProps } from '../types'

export function OverheadPressScene({ phase, className = '' }: SceneProps) {
  const barY = [82, 58, 26, 68][phase]
  const isLockout = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="195" x2="330" y2="195" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />

      <line x1="168" y1="195" x2="174" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
      <line x1="192" y1="195" x2="186" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
      <line x1="180" y1="135" x2="180" y2="82" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" />

      <circle
        cx="165"
        cy="84"
        r="8"
        fill={activeColor}
        style={{
          ...tStyle,
          filter: isLockout ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
        }}
      />
      <circle
        cx="195"
        cy="84"
        r="8"
        fill={activeColor}
        style={{
          ...tStyle,
          filter: isLockout ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
        }}
      />

      <circle cx="180" cy="62" r="11" fill={jointColor} />

      <polyline
        points={`165,84 152,${(84 + barY) / 2 + 5} 158,${barY}`}
        fill="none"
        stroke={jointColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={tStyle}
      />
      <polyline
        points={`195,84 208,${(84 + barY) / 2 + 5} 202,${barY}`}
        fill="none"
        stroke={jointColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={tStyle}
      />

      <g style={tStyle}>
        <line x1="110" y1={barY} x2="250" y2={barY} stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
        <rect x="120" y={barY - 20} width="7" height="40" rx="2" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1" />
        <rect x="233" y={barY - 20} width="7" height="40" rx="2" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1" />
      </g>

      <g transform="translate(245, 35)">
        <rect x="0" y="0" width="98" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="49" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          ТРАЄКТОРІЯ
        </text>
        <text x="49" y="27" fill={isLockout ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isLockout ? 'Вертикальний локаут' : 'Траєкторія над центром'}
        </text>
      </g>
    </svg>
  )
}
