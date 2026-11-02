import { useState } from 'react'
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button, IconButton, Modal } from '@/components/ui'
import { cn } from '@/utils/cn'
import type { Difficulty, Equipment, ExerciseFilters, MuscleGroup } from '../model/types'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../model/types'

const MUSCLE_GROUPS: (MuscleGroup | 'all')[] = ['all', 'chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'cardio']

export interface ExerciseFiltersBarProps {
  filters: ExerciseFilters
  onChange: (updates: Partial<ExerciseFilters>) => void
  onReset: () => void
  favoritesOnly: boolean
  onFavoritesOnlyChange: (value: boolean) => void
  resultCount: number
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-md border px-3.5 text-xs font-semibold transition-colors duration-200',
        selected ? 'border-fg bg-fg text-bg' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}

export function ExerciseFiltersBar({
  filters,
  onChange,
  onReset,
  favoritesOnly,
  onFavoritesOnlyChange,
  resultCount,
}: ExerciseFiltersBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const extraFilters = Number(filters.difficulty !== 'all') + Number(filters.equipment !== 'all')
  const hasAnyFilter = extraFilters > 0 || filters.muscleGroup !== 'all' || filters.searchQuery !== '' || favoritesOnly

  return (
    <div className="sticky top-14 z-30 -mx-5 space-y-3 border-b border-line bg-bg/95 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-12 lg:px-12">
      <div className="flex items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Пошук вправи</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            type="search"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Пошук вправи"
            className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-10 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
          />
          {filters.searchQuery && (
            <button
              type="button"
              aria-label="Очистити пошук"
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-fg-subtle hover:text-fg"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <IconButton
          label={favoritesOnly ? 'Показати всі вправи' : 'Лише обрані'}
          aria-pressed={favoritesOnly}
          icon={<Heart className={cn(favoritesOnly && 'fill-current')} />}
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
          className={cn('border border-line', favoritesOnly && 'border-danger/40 text-danger hover:text-danger')}
        />

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Фільтри</span>
          {extraFilters > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[10px] text-on-accent">
              {extraFilters}
            </span>
          )}
          <span className="sr-only sm:hidden">Фільтри</span>
        </button>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12" role="group" aria-label="Група м'язів">
        {MUSCLE_GROUPS.map((m) => (
          <Chip key={m} selected={filters.muscleGroup === m} onClick={() => onChange({ muscleGroup: m })}>
            {m === 'all' ? 'Усі' : MUSCLE_GROUP_LABELS[m]}
          </Chip>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-fg-subtle">
        <span>
          <span className="font-mono text-fg tabular">{resultCount}</span> вправ
        </span>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={() => {
              onReset()
              onFavoritesOnlyChange(false)
            }}
            className="cursor-pointer font-semibold text-accent hover:text-accent-hover"
          >
            Скинути
          </button>
        )}
      </div>

      <Modal
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Фільтри"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => onChange({ difficulty: 'all', equipment: 'all' })}>
              Скинути
            </Button>
            <Button onClick={() => setSheetOpen(false)}>Показати {resultCount}</Button>
          </>
        }
      >
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Рівень</legend>
            <div className="flex flex-wrap gap-2">
              <Chip selected={filters.difficulty === 'all'} onClick={() => onChange({ difficulty: 'all' })}>
                Будь-який
              </Chip>
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <Chip key={d} selected={filters.difficulty === d} onClick={() => onChange({ difficulty: d })}>
                  {DIFFICULTY_LABELS[d]}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Обладнання</legend>
            <div className="flex flex-wrap gap-2">
              <Chip selected={filters.equipment === 'all'} onClick={() => onChange({ equipment: 'all' })}>
                Будь-яке
              </Chip>
              {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((eq) => (
                <Chip key={eq} selected={filters.equipment === eq} onClick={() => onChange({ equipment: eq })}>
                  {EQUIPMENT_LABELS[eq]}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>
      </Modal>
    </div>
  )
}
