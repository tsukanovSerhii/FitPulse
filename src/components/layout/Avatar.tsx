import { useId, useMemo } from 'react'
import { avatarShapes } from '@/utils/avatar'
import { cn } from '@/utils/cn'

/** Generated geometric avatar; the seed comes from the user's account. */
export function Avatar({ seed, name, className }: { seed: string; name?: string; className?: string }) {
  const clipId = useId()
  const s = useMemo(() => avatarShapes(seed), [seed])

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={name ? `Аватар: ${name}` : 'Аватар'}
      className={cn('shrink-0 rounded-full', className)}
    >
      <clipPath id={clipId}>
        <circle cx="32" cy="32" r="32" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="64" height="64" fill={s.background} />
        <circle {...s.circle} />
        <rect
          x={s.block.x - s.block.size / 2}
          y={s.block.y - s.block.size / 2}
          width={s.block.size}
          height={s.block.size}
          fill={s.block.fill}
          transform={`rotate(${s.block.rotate} ${s.block.x} ${s.block.y})`}
        />
        <path d={s.arc.d} fill="none" stroke={s.arc.stroke} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
