import { useMemo } from 'react'
import { Badge } from '@/shared/ui'
import type { MuscleGroup } from '../model/types'
import { MUSCLE_GROUP_LABELS } from '../model/types'
import { cn } from '@/shared/lib/cn'
import { BackBody, FrontBody, createMusclePaint } from '@/shared/ui/body-map'

export interface MuscleMapProps {
  primaryMuscle: MuscleGroup
  muscleGroups: MuscleGroup[]
  className?: string
}

export function MuscleMap({ primaryMuscle, muscleGroups, className }: MuscleMapProps) {
  const paint = useMemo(() => createMusclePaint(primaryMuscle, muscleGroups), [primaryMuscle, muscleGroups])
  const secondary = muscleGroups.filter((m) => m !== primaryMuscle)

  return (
    <div className={cn('space-y-4 rounded-lg border border-line bg-bg p-4 sm:p-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <h4 className="font-sans text-sm font-bold normal-case tracking-normal text-fg">Анатомічна карта</h4>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-accent">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            Основний
          </span>
          <span className="flex items-center gap-1.5 text-fg-muted">
            <span className="size-2 rounded-full bg-accent/45" aria-hidden="true" />
            Допоміжний
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Спереду', Body: FrontBody },
          { label: 'Ззаду', Body: BackBody },
        ].map(({ label, Body }) => (
          <figure key={label} className="flex flex-col items-center gap-2 rounded-md border border-line p-3">
            <figcaption className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">{label}</figcaption>
            <Body paint={paint} className="h-48 w-28 sm:h-56 sm:w-36" />
          </figure>
        ))}
      </div>

      <dl className="space-y-2 border-t border-line pt-3 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-fg-muted">Основний м'яз</dt>
          <dd>
            <Badge variant="primary" dot size="sm">
              {MUSCLE_GROUP_LABELS[primaryMuscle]}
            </Badge>
          </dd>
        </div>
        {secondary.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-fg-muted">Синергісти</dt>
            <dd className="flex flex-wrap justify-end gap-1.5">
              {secondary.map((m) => (
                <Badge key={m} size="sm">
                  {MUSCLE_GROUP_LABELS[m]}
                </Badge>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
