import React from 'react'
import { Search, RotateCcw, Filter } from 'lucide-react'
import type { ExerciseFilters, MuscleGroup, Difficulty, Equipment } from '../model/types'
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '../model/types'
import { Button } from '@/components/common/Button'

export interface ExerciseFiltersBarProps {
  filters: ExerciseFilters
  onChange: (updates: Partial<ExerciseFilters>) => void
  onReset: () => void
  totalCount: number
  filteredCount: number
}

export const ExerciseFiltersBar: React.FC<ExerciseFiltersBarProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
  filteredCount,
}) => {
  const muscleGroups: { value: MuscleGroup | 'all'; label: string }[] = [
    { value: 'all', label: 'Всі групи м\'язів' },
    ...Object.entries(MUSCLE_GROUP_LABELS).map(([key, label]) => ({
      value: key as MuscleGroup,
      label,
    })),
  ]

  const difficulties: { value: Difficulty | 'all'; label: string }[] = [
    { value: 'all', label: 'Всі рівні складності' },
    ...Object.entries(DIFFICULTY_LABELS).map(([key, label]) => ({
      value: key as Difficulty,
      label,
    })),
  ]

  const equipments: { value: Equipment | 'all'; label: string }[] = [
    { value: 'all', label: 'Все обладнання' },
    ...Object.entries(EQUIPMENT_LABELS).map(([key, label]) => ({
      value: key as Equipment,
      label,
    })),
  ]

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.muscleGroup !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.equipment !== 'all'

  return (
    <div className="bg-card/70 border border-border rounded-2xl p-4 sm:p-5 mb-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ searchQuery: e.target.value })}
          placeholder="Пошук вправи за назвою або описом..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
        />
      </div>

      {/* Select Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Muscle group */}
        <div>
          <select
            value={filters.muscleGroup}
            onChange={(e) => onChange({ muscleGroup: e.target.value as MuscleGroup | 'all' })}
            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {muscleGroups.map((g) => (
              <option key={g.value} value={g.value} className="bg-surface">
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <select
            value={filters.difficulty}
            onChange={(e) => onChange({ difficulty: e.target.value as Difficulty | 'all' })}
            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {difficulties.map((d) => (
              <option key={d.value} value={d.value} className="bg-surface">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment */}
        <div>
          <select
            value={filters.equipment}
            onChange={(e) => onChange({ equipment: e.target.value as Equipment | 'all' })}
            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {equipments.map((eq) => (
              <option key={eq.value} value={eq.value} className="bg-surface">
                {eq.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary and Reset Button */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          Знайдено {filteredCount} із {totalCount} вправ
        </span>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Скинути фільтри
          </Button>
        )}
      </div>
    </div>
  )
}
