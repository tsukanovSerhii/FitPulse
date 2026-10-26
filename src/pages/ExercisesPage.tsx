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
import { updatePageSEO, injectExerciseSchema } from '@/utils/seo'

export const ExercisesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { filteredItems, items, filters, favorites, selectedExercise, status } = useAppSelector(
    (state) => state.exercises,
  )

  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    updatePageSEO({
      title: 'Каталог вправ з правильною технікою та анатомією м\'язів | FitPulse',
      description: 'Повний довідник вправ для тренажерного залу та дому. Анатомічна карта м\'язів, фази руху, поради для новачків та тонкощі для профі.',
      keywords: ['вправи в залі', 'техніка вправ', 'анатомія м\'язів', 'як правильно робити жим', 'присідання техніка'],
    })
    if (items.length === 0) {
      dispatch(fetchExercises())
    }
  }, [dispatch, items.length])

  // Filter displayed items by tab (all or favorites)
  const displayItems =
    activeTab === 'all'
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-4xl font-heading font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 -rotate-45" />
            </div>
            Каталог вправ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            База силових та функціональних вправ з анатомією м'язів, фазами руху та порадами
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
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-slate-950 shadow-md font-bold'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Всі вправи ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'fill-white' : ''}`} />
          Обрані ({favorites.length})
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
          <div className="animate-spin w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full mx-auto mb-3" />
          Завантаження каталогу вправ...
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="w-8 h-8 text-sky-400" />}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayItems.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFavorite={favorites.includes(exercise.id)}
              onToggleFavorite={handleToggleFavorite}
              onSelect={(ex) => {
                dispatch(setSelectedExercise(ex))
                injectExerciseSchema(ex.name, ex.description, ex.muscleGroups)
              }}
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
