import { tStyle, activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function SquatScene({ phase, className = '' }: SceneProps) {
  const ankleX = 180
  const ankleY = 190

  const kneeX = [184, 198, 210, 192][phase]
  const kneeY = [142, 150, 158, 146][phase]

  const hipX = [178, 154, 142, 164][phase]
  const hipY = [94, 122, 152, 110][phase]

  const shoulderX = [180, 172, 172, 176][phase]
  const shoulderY = [48, 76, 104, 62][phase]

  const headX = [182, 178, 180, 180][phase]
  const headY = [28, 56, 84, 42][phase]

  const barX = shoulderX - 4
  const barY = shoulderY

  const isDeep = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="195" x2="330" y2="195" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="180" y1="20" x2="180" y2="195" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 3" />

      <line x1="165" y1="193" x2="198" y2="193" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />

      <line
        x1={ankleX}
        y1={ankleY}
        x2={kneeX}
        y2={kneeY}
        stroke={bodyColor}
        strokeWidth="11"
        strokeLinecap="round"
        style={tStyle}
      />

      <line
        x1={kneeX}
        y1={kneeY}
        x2={hipX}
        y2={hipY}
        stroke={isDeep ? activeColor : bodyColor}
        strokeWidth={isDeep ? '13' : '11'}
        strokeLinecap="round"
        style={{
          ...tStyle,
          filter: isDeep ? 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' : 'none',
        }}
      />

      <line
        x1={hipX}
        y1={hipY}
        x2={shoulderX}
        y2={shoulderY}
        stroke={bodyColor}
        strokeWidth="14"
        strokeLinecap="round"
        style={tStyle}
      />

      <circle
        cx={hipX}
        cy={hipY}
        r="8"
        fill={isDeep ? activeColor : jointColor}
        style={tStyle}
      />

      <circle cx={headX} cy={headY} r="11" fill={jointColor} style={tStyle} />

      <polyline
        points={`${shoulderX},${shoulderY} ${shoulderX + 12},${shoulderY + 18} ${barX},${barY}`}
        fill="none"
        stroke={jointColor}
        strokeWidth="6"
        strokeLinecap="round"
        style={tStyle}
      />

      <g style={tStyle}>
        <circle cx={barX} cy={barY} r="22" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" />
        <circle cx={barX} cy={barY} r="12" fill="color-mix(in srgb, var(--accent) 65%, var(--bg))" />
        <circle cx={barX} cy={barY} r="4" fill="var(--fg-muted)" />
      </g>

      <g transform="translate(240, 35)">
        <rect x="0" y="0" width="102" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="51" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          ГЛИБИНА ПРИСІДУ
        </text>
        <text x="51" y="27" fill={isDeep ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isDeep ? 'Паралель досягнута' : 'Контроль спуску'}
        </text>
      </g>
    </svg>
  )
}
