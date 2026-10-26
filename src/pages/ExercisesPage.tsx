import React, { useEffect, useState } from 'react'
import { Plus, Dumbbell, Heart, Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  fetchExercises,
  setFilter,
  resetFilters,
  setSelectedExercise,
  clearSelectedExercise,
  toggleFavorite,
  addCustomExercise,
} from '@/features/exercises/model/exercisesSlice'
import type { Exercise } from '@/features/exercises/model/types'
import { ExerciseCard } from '@/features/exercises/components/ExerciseCard'
import { ExerciseFiltersBar } from '@/features/exercises/components/ExerciseFiltersBar'
import { ExerciseDetailModal } from '@/features/exercises/components/ExerciseDetailModal'
import { AddExerciseModal } from '@/features/exercises/components/AddExerciseModal'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'

export const ExercisesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { filteredItems, items, filters, favorites, selectedExercise, status } = useAppSelector(
    (state) => state.exercises,
  )

  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchExercises())
    }
  }, [dispatch, items.length])

  // Filter displayed items by tab (all or favorites)
  const displayItems = activeTab === 'all'
    ? filteredItems
    : filteredItems.filter((ex) => favorites.includes(ex.id))

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    dispatch(toggleFavorite(id))
  }

  const handleCreateExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
    await dispatch(addCustomExercise(exerciseData)).unwrap()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-purple-400" />
            Каталог вправ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Велика база силових та функціональних вправ з технікою виконання та порадами
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Додати власну вправу
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Всі вправи ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'favorites'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500/40" />
          Обрані вправи ({favorites.length})
        </button>
      </div>

      {/* Filter component */}
      <ExerciseFiltersBar
        filters={filters}
        onChange={(updates) => dispatch(setFilter(updates))}
        onReset={() => dispatch(resetFilters())}
        totalCount={items.length}
        filteredCount={displayItems.length}
      />

      {/* Loading state */}
      {status === 'loading' && items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
          Завантаження каталогу вправ...
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="w-8 h-8" />}
          title={activeTab === 'favorites' ? 'У вас ще немає обраних вправ' : 'Вправ не знайдено'}
          description={
            activeTab === 'favorites'
              ? 'Натисніть на сердечко на будь-якій картці вправи, щоб додати її сюди для швидкого доступу.'
              : 'Спробуйте змінити пошуковий запит або скинути фільтри.'
          }
          action={
            activeTab === 'favorites' ? (
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('all')}>
                Переглянути всі вправи
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => dispatch(resetFilters())}>
                Скинути фільтри
              </Button>
            )
          }
        />
      ) : (
        /* Exercise Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayItems.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFavorite={favorites.includes(exercise.id)}
              onToggleFavorite={handleToggleFavorite}
              onSelect={(ex) => dispatch(setSelectedExercise(ex))}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={() => dispatch(clearSelectedExercise())}
        isFavorite={selectedExercise ? favorites.includes(selectedExercise.id) : false}
        onToggleFavorite={(id) => dispatch(toggleFavorite(id))}
      />

      {/* Add Custom Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateExercise}
      />
    </div>
  )
}
