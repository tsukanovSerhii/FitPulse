import { tStyle, activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function BicepCurlScene({ phase, className = '' }: SceneProps) {
  const handX = [198, 214, 192, 210][phase]
  const handY = [150, 118, 86, 130][phase]
  const isPeak = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="195" x2="330" y2="195" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />

      <line x1="168" y1="195" x2="174" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
      <line x1="180" y1="135" x2="180" y2="80" stroke={bodyColor} strokeWidth="13" strokeLinecap="round" />
      <circle cx="180" cy="58" r="11" fill={jointColor} />

      <line x1="182" y1="82" x2="184" y2="124" stroke={jointColor} strokeWidth="8" strokeLinecap="round" />

      <path
        d="M 183 90 C 192 100, 192 110, 184 120"
        fill="none"
        stroke={activeColor}
        strokeWidth={isPeak ? '9' : '5'}
        strokeLinecap="round"
        style={{
          ...tStyle,
          filter: isPeak ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
        }}
      />

      <line
        x1="184"
        y1="124"
        x2={handX}
        y2={handY}
        stroke={jointColor}
        strokeWidth="7"
        strokeLinecap="round"
        style={tStyle}
      />

      <g style={tStyle}>
        <circle cx={handX} cy={handY} r="7" fill={jointColor} />
        <rect x={handX - 5} y={handY - 14} width="10" height="7" rx="2" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1" />
        <rect x={handX - 5} y={handY + 7} width="10" height="7" rx="2" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1" />
      </g>

      <g transform="translate(240, 35)">
        <rect x="0" y="0" width="100" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="50" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          ПОЗИЦІЯ ЛІКТІВ
        </text>
        <text x="50" y="27" fill={isPeak ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isPeak ? 'Максимальний пік' : 'Лікті зафіксовані'}
        </text>
      </g>
    </svg>
  )
}
