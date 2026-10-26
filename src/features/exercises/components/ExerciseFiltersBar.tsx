import React from 'react'
import { Search, RotateCcw, Filter, X } from 'lucide-react'
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
  const muscleGroupsList: (MuscleGroup | 'all')[] = [
    'all',
    'chest',
    'back',
    'legs',
    'shoulders',
    'biceps',
    'triceps',
    'abs',
    'cardio',
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
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 mb-6 space-y-4 shadow-xl backdrop-blur-md">
      {/* Search Input Row */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ searchQuery: e.target.value })}
          placeholder="Пошук вправи за назвою або описом..."
          className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onChange({ searchQuery: '' })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Muscle Group Filter Pills */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Група м'язів:
        </span>
        <div className="flex flex-wrap gap-2">
          {muscleGroupsList.map((m) => {
            const isSelected = filters.muscleGroup === m
            const label = m === 'all' ? 'Всі м\'язи' : MUSCLE_GROUP_LABELS[m]
            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ muscleGroup: m })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/20'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Select Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Рівень складності:
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => onChange({ difficulty: e.target.value as Difficulty | 'all' })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {difficulties.map((d) => (
              <option key={d.value} value={d.value} className="bg-slate-900 text-slate-100">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Тип обладнання:
          </label>
          <select
            value={filters.equipment}
            onChange={(e) => onChange({ equipment: e.target.value as Equipment | 'all' })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {equipments.map((eq) => (
              <option key={eq.value} value={eq.value} className="bg-slate-900 text-slate-100">
                {eq.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary and Reset Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          Знайдено <strong className="text-white">{filteredCount}</strong> із {totalCount} вправ
        </span>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Скинути всі фільтри
          </Button>
        )}
      </div>
    </div>
  )
}
