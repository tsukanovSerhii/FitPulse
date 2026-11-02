import { tStyle, activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function DeadliftScene({ phase, className = '' }: SceneProps) {
  const barY = [172, 138, 102, 145][phase]
  const hipX = [135, 145, 175, 142][phase]
  const hipY = [128, 114, 92, 118][phase]
  const shoulderX = [188, 186, 176, 185][phase]
  const shoulderY = [92, 70, 48, 76][phase]
  const headX = [204, 200, 178, 198][phase]
  const headY = [76, 52, 28, 58][phase]

  const isLockout = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="195" x2="330" y2="195" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />

      <line x1="165" y1="193" x2="198" y2="193" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />

      <line x1="178" y1="190" x2="175" y2="148" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" style={tStyle} />

      <line
        x1="175"
        y1="148"
        x2={hipX}
        y2={hipY}
        stroke={isLockout ? activeColor : bodyColor}
        strokeWidth="11"
        strokeLinecap="round"
        style={tStyle}
      />

      <line
        x1={hipX}
        y1={hipY}
        x2={shoulderX}
        y2={shoulderY}
        stroke={isLockout ? activeColor : bodyColor}
        strokeWidth="13"
        strokeLinecap="round"
        style={{
          ...tStyle,
          filter: isLockout ? 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' : 'none',
        }}
      />

      <circle cx={headX} cy={headY} r="11" fill={jointColor} style={tStyle} />

      <line
        x1={shoulderX}
        y1={shoulderY}
        x2="188"
        y2={barY}
        stroke={jointColor}
        strokeWidth="7"
        strokeLinecap="round"
        style={tStyle}
      />

      <g style={tStyle}>
        <circle cx="188" cy={barY} r="22" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="188" cy={barY} r="11" fill="color-mix(in srgb, var(--accent) 65%, var(--bg))" />
        <circle cx="188" cy={barY} r="4" fill="var(--fg-muted)" />
      </g>

      <g transform="translate(235, 35)">
        <rect x="0" y="0" width="110" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="55" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          БІОМЕХАНІКА СПИНИ
        </text>
        <text x="55" y="27" fill={isLockout ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isLockout ? 'Повний локаут тазу' : 'Нейтральний хребет'}
        </text>
      </g>
    </svg>
  )
}
