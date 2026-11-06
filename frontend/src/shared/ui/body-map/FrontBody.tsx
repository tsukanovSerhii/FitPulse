import type { MusclePaint } from './paint'

export function FrontBody({ paint, className }: { paint: MusclePaint; className?: string }) {
  return (
    <svg viewBox="0 0 160 260" className={className} role="img" aria-label="Вигляд спереду">

      <circle cx="80" cy="22" r="14" fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <rect x="74" y="34" width="12" height="10" rx="3" fill="var(--surface-2)" />

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

      <path
        d="M 54 48 Q 80 46 106 48 L 102 74 Q 80 82 58 74 Z"
        fill={paint.fill('chest')}
        stroke={paint.stroke('chest')}
        strokeWidth="1.5"
      />

      <rect
        x="33"
        y="68"
        width="13"
        height="28"
        rx="6"
        fill={paint.fill('biceps')}
        stroke={paint.stroke('biceps')}
        strokeWidth="1.2"
      />
      <rect
        x="114"
        y="68"
        width="13"
        height="28"
        rx="6"
        fill={paint.fill('biceps')}
        stroke={paint.stroke('biceps')}
        strokeWidth="1.2"
      />

      <rect x="29" y="100" width="11" height="32" rx="5" fill="var(--surface-2)" stroke="var(--line-strong)" />
      <rect x="120" y="100" width="11" height="32" rx="5" fill="var(--surface-2)" stroke="var(--line-strong)" />

      <rect
        x="62"
        y="78"
        width="36"
        height="40"
        rx="6"
        fill={paint.fill('abs')}
        stroke={paint.stroke('abs')}
        strokeWidth="1.5"
      />

      <path d="M 58 118 Q 80 128 102 118 L 98 136 Q 80 142 62 136 Z" fill="var(--surface-2)" />

      <path
        d="M 54 138 Q 76 138 76 190 L 52 188 Q 48 152 54 138 Z"
        fill={paint.fill('legs')}
        stroke={paint.stroke('legs')}
        strokeWidth="1.5"
      />
      <path
        d="M 106 138 Q 84 138 84 190 L 108 188 Q 112 152 106 138 Z"
        fill={paint.fill('legs')}
        stroke={paint.stroke('legs')}
        strokeWidth="1.5"
      />

      <circle cx="64" cy="195" r="5" fill="var(--surface-2)" />
      <circle cx="96" cy="195" r="5" fill="var(--surface-2)" />

      <rect
        x="57"
        y="204"
        width="14"
        height="38"
        rx="6"
        fill={paint.fill('calves')}
        stroke={paint.stroke('calves')}
        strokeWidth="1.2"
      />
      <rect
        x="89"
        y="204"
        width="14"
        height="38"
        rx="6"
        fill={paint.fill('calves')}
        stroke={paint.stroke('calves')}
        strokeWidth="1.2"
      />
    </svg>
  )
}
