import { tStyle, activeColor, bodyColor, jointColor, equipmentColor, benchColor } from '../palette'
import type { SceneProps } from '../types'

export function BenchPressScene({ phase, className = '' }: SceneProps) {
  const barY = [68, 98, 116, 76][phase]
  const elbowX = [125, 122, 118, 124][phase]
  const elbowY = [95, 120, 138, 102][phase]
  const isPeakContraction = phase === 2 || phase === 3

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="20" y1="190" x2="340" y2="190" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />

      <rect x="75" y="138" width="165" height="12" rx="4" fill={benchColor} stroke="var(--line-strong)" strokeWidth="1.5" />
      <rect x="90" y="150" width="10" height="40" rx="2" fill="var(--line-strong)" />
      <rect x="220" y="150" width="10" height="40" rx="2" fill="var(--line-strong)" />
      <rect x="76" y="70" width="8" height="68" rx="2" fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="1" />
      <path d="M 72 70 L 88 70 L 88 80 L 72 80 Z" fill="var(--line-strong)" />

      <circle cx="102" cy="130" r="11" fill={jointColor} />

      <path
        d="M 112 135 C 130 120, 160 120, 185 137"
        fill="none"
        stroke={bodyColor}
        strokeWidth="16"
        strokeLinecap="round"
      />

      <path
        d="M 124 125 C 138 116, 155 116, 168 126"
        fill="none"
        stroke={activeColor}
        strokeWidth={isPeakContraction ? '10' : '6'}
        strokeLinecap="round"
        style={{
          ...tStyle,
          filter: isPeakContraction ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
          opacity: isPeakContraction ? 1 : 0.6,
        }}
      />

      <circle cx="185" cy="137" r="9" fill={bodyColor} />

      <polyline
        points="185,137 225,152 232,190"
        fill="none"
        stroke={bodyColor}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="225" y1="190" x2="245" y2="190" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />

      <circle cx="128" cy="128" r="7" fill={jointColor} />

      <polyline
        points={`128,128 ${elbowX},${elbowY} 150,${barY}`}
        fill="none"
        stroke={jointColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={tStyle}
      />

      <circle cx={elbowX} cy={elbowY} r="5" fill={activeColor} style={tStyle} />

      <circle cx="150" cy={barY} r="6" fill={jointColor} style={tStyle} />

      <g style={tStyle}>
        <line x1="60" y1={barY} x2="240" y2={barY} stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
        <rect x="75" y={barY - 14} width="5" height="28" rx="2" fill="var(--fg-subtle)" />
        <rect x="80" y={barY - 26} width="8" height="52" rx="3" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1" />
        <rect x="88" y={barY - 22} width="6" height="44" rx="2" fill="color-mix(in srgb, var(--accent) 65%, var(--bg))" />
        <rect x="210" y={barY - 26} width="8" height="52" rx="3" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1" />
        <rect x="218" y={barY - 22} width="6" height="44" rx="2" fill="color-mix(in srgb, var(--accent) 65%, var(--bg))" />
      </g>

      <g transform="translate(260, 45)">
        <rect x="0" y="0" width="86" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="43" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          КУТ ЛІКТІВ
        </text>
        <text x="43" y="27" fill="var(--accent)" fontSize="11" fontWeight="900" textAnchor="middle">
          ~75° (Оптимально)
        </text>
      </g>
    </svg>
  )
}
