import { tStyle, activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function PushUpScene({ phase, className = '' }: SceneProps) {
  const bodyY = [130, 150, 168, 142][phase]
  const elbowX = [148, 140, 134, 144][phase]
  const isBottom = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="30" y1="185" x2="330" y2="185" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />

      <circle cx="160" cy="182" r="5" fill={jointColor} />
      <circle cx="280" cy="182" r="5" fill={jointColor} />

      <g style={tStyle}>
        <line
          x1="280"
          y1="180"
          x2="160"
          y2={bodyY}
          stroke={bodyColor}
          strokeWidth="11"
          strokeLinecap="round"
        />

        <line
          x1="190"
          y1={(bodyY + 180) / 2 - 4}
          x2="160"
          y2={bodyY}
          stroke={activeColor}
          strokeWidth={isBottom ? '9' : '5'}
          strokeLinecap="round"
          style={{
            filter: isBottom ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
          }}
        />

        <circle cx="140" cy={bodyY - 6} r="10" fill={jointColor} />

        <polyline
          points={`160,${bodyY} ${elbowX},${(bodyY + 182) / 2} 160,182`}
          fill="none"
          stroke={jointColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g transform="translate(240, 35)">
        <rect x="0" y="0" width="105" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="52" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          ЛІНІЯ ТОРСУ
        </text>
        <text x="52" y="27" fill={isBottom ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isBottom ? 'Повна амплітуда' : 'Прес напружений'}
        </text>
      </g>
    </svg>
  )
}
