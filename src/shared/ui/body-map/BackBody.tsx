import type { MusclePaint } from './paint'

export function BackBody({ paint, className }: { paint: MusclePaint; className?: string }) {
  return (
    <svg viewBox="0 0 160 260" className={className} role="img" aria-label="Вигляд ззаду">
      <circle cx="80" cy="22" r="14" fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <path
        d="M 64 36 L 96 36 L 104 54 L 56 54 Z"
        fill={paint.fill('back')}
        stroke={paint.stroke('back')}
        strokeWidth="1.2"
      />

      <path
        d="M 52 46 C 44 48 38 58 38 66 C 44 66 52 58 54 48 Z"
        fill={paint.fill('shoulders')}
        stroke={paint.stroke('shoulders')}
        strokeWidth="1.2"
      />
      <path
        d="M 108 46 C 116 48 122 58 122 66 C 116 66 108 58 106 48 Z"
        fill={paint.fill('shoulders')}
        stroke={paint.stroke('shoulders')}
        strokeWidth="1.2"
      />

      <rect
        x="33"
        y="68"
        width="13"
        height="28"
        rx="6"
        fill={paint.fill('triceps')}
        stroke={paint.stroke('triceps')}
        strokeWidth="1.2"
      />
      <rect
        x="114"
        y="68"
        width="13"
        height="28"
        rx="6"
        fill={paint.fill('triceps')}
        stroke={paint.stroke('triceps')}
        strokeWidth="1.2"
      />

      <path
        d="M 56 54 Q 80 56 104 54 L 94 116 Q 80 118 66 116 Z"
        fill={paint.fill('back')}
        stroke={paint.stroke('back')}
        strokeWidth="1.5"
      />

      <path
        d="M 58 118 Q 80 124 102 118 Q 106 144 80 144 Q 54 144 58 118 Z"
        fill={paint.fill('glutes')}
        stroke={paint.stroke('glutes')}
        strokeWidth="1.5"
      />

      <path
        d="M 54 144 Q 76 144 76 190 L 52 188 Q 48 152 54 144 Z"
        fill={paint.fill('legs')}
        stroke={paint.stroke('legs')}
        strokeWidth="1.5"
      />
      <path
        d="M 106 144 Q 84 144 84 190 L 108 188 Q 112 152 106 144 Z"
        fill={paint.fill('legs')}
        stroke={paint.stroke('legs')}
        strokeWidth="1.5"
      />

      <rect
        x="57"
        y="204"
        width="14"
        height="38"
        rx="6"
        fill={paint.fill('calves')}
        stroke={paint.stroke('calves')}
        strokeWidth="1.5"
      />
      <rect
        x="89"
        y="204"
        width="14"
        height="38"
        rx="6"
        fill={paint.fill('calves')}
        stroke={paint.stroke('calves')}
        strokeWidth="1.5"
      />
    </svg>
  )
}
