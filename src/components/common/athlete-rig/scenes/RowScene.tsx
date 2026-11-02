import { tStyle, activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function RowScene({ phase, className = '' }: SceneProps) {
  const barY = [152, 125, 98, 136][phase]
  const isPeak = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="195" x2="330" y2="195" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />

      <line x1="165" y1="193" x2="198" y2="193" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />
      <polyline points="175,190 170,146 142,118" fill="none" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

      <line x1="142" y1="118" x2="196" y2="82" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" />

      <line
        x1="152"
        y1="112"
        x2="185"
        y2="88"
        stroke={activeColor}
        strokeWidth={isPeak ? '9' : '5'}
        strokeLinecap="round"
        style={{
          ...tStyle,
          filter: isPeak ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
        }}
      />

      <circle cx="210" cy="74" r="11" fill={jointColor} />

      <polyline
        points={`190,86 ${isPeak ? '170,82' : '182,120'} 180,${barY}`}
        fill="none"
        stroke={jointColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={tStyle}
      />

      <g style={tStyle}>
        <circle cx="180" cy={barY} r="18" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="180" cy={barY} r="9" fill="color-mix(in srgb, var(--accent) 65%, var(--bg))" />
        <circle cx="180" cy={barY} r="3" fill="var(--fg-muted)" />
      </g>

      <g transform="translate(240, 35)">
        <rect x="0" y="0" width="105" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="52" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          НАХИЛ КОРПУСУ
        </text>
        <text x="52" y="27" fill={isPeak ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isPeak ? 'Зведення лопаток' : 'Кут нахилу 45°'}
        </text>
      </g>
    </svg>
  )
}
