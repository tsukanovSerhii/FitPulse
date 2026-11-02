import { tStyle, activeColor, bodyColor, jointColor } from '../palette'
import type { SceneProps } from '../types'

export function PullUpScene({ phase, className = '' }: SceneProps) {
  const bodyYOffset = [35, 15, -12, 20][phase]
  const isPeak = phase === 2

  return (
    <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
      <line x1="80" y1="28" x2="280" y2="28" stroke="var(--line-strong)" strokeWidth="6" strokeLinecap="round" />
      <line x1="90" y1="28" x2="90" y2="0" stroke="var(--line-strong)" strokeWidth="4" />
      <line x1="270" y1="28" x2="270" y2="0" stroke="var(--line-strong)" strokeWidth="4" />

      <circle cx="150" cy="28" r="6" fill={jointColor} />
      <circle cx="210" cy="28" r="6" fill={jointColor} />

      <g style={{ transform: `translateY(${bodyYOffset}px)`, ...tStyle }}>
        <circle cx="180" cy="52" r="11" fill={jointColor} />

        <polyline
          points={`150,${28 - bodyYOffset} 142,${isPeak ? 68 : 50} 162,64`}
          fill="none"
          stroke={jointColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={`210,${28 - bodyYOffset} 218,${isPeak ? 68 : 50} 198,64`}
          fill="none"
          stroke={jointColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 164 64 L 196 64 L 188 120 L 172 120 Z"
          fill={isPeak ? activeColor : bodyColor}
          opacity={isPeak ? 0.9 : 0.7}
          style={{
            ...tStyle,
            filter: isPeak ? 'drop-shadow(0 0 10px rgba(56,189,248,0.8))' : 'none',
          }}
        />

        <polyline
          points="176,120 178,160 174,195"
          fill="none"
          stroke={bodyColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="184,120 186,160 182,195"
          fill="none"
          stroke={bodyColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g transform="translate(240, 45)">
        <rect x="0" y="0" width="105" height="34" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x="52" y="14" fill="var(--fg-subtle)" fontSize="8" fontWeight="bold" textAnchor="middle">
          ПІКОВЕ СКОРОЧЕННЯ
        </text>
        <text x="52" y="27" fill={isPeak ? 'var(--accent)' : 'var(--fg)'} fontSize="11" fontWeight="900" textAnchor="middle">
          {isPeak ? 'Підборіддя над грифом' : 'Повний розтяг найширших'}
        </text>
      </g>
    </svg>
  )
}
