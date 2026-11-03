import { Fragment, useEffect, useState, type MouseEvent } from 'react'
import { Dumbbell, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { Button, EmptyState, IconButton, PageHeader } from '@/shared/ui'
import { AdSlot, CATALOG_AD_EVERY } from '@/features/ads'
import { AddExerciseModal, ExerciseCard, ExerciseDetailModal, ExerciseFiltersBar, ExerciseGridSkeleton, addCustomExercise, clearSelectedExercise, fetchExercises, resetFilters, setFilter, setSelectedExercise, toggleFavorite, type Exercise } from '@/features/exercises'
import { saveToSession, SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { useSessionState } from '@/shared/storage/useSessionState'
import { injectExerciseSchema } from '@/shared/seo/meta'

export function ExercisesPage() {
  const dispatch = useAppDispatch()
  const { filteredItems, items, filters, favorites, selectedExercise, status } = useAppSelector((state) => state.exercises)

  const [favoritesOnly, setFavoritesOnly] = useSessionState(SESSION_KEYS.EXERCISE_FAVORITES_ONLY, false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (items.length === 0) dispatch(fetchExercises())
  }, [dispatch, items.length])

  useEffect(() => {
    saveToSession(SESSION_KEYS.EXERCISE_FILTERS, filters)
  }, [filters])

  const displayItems = favoritesOnly ? filteredItems.filter((ex) => favorites.includes(ex.id)) : filteredItems

  const handleToggleFavorite = (id: string, e?: MouseEvent) => {
    e?.stopPropagation()
    dispatch(toggleFavorite(id))
  }

  const handleCreateExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
    await dispatch(addCustomExercise(exerciseData)).unwrap()
  }

  const resetAll = () => {
    dispatch(resetFilters())
    setFavoritesOnly(false)
  }

  return (
    <div className="space-y-4">
      <SEO
        title="Каталог вправ"
        description="Довідник вправ для залу та дому: анатомія м'язів, фази руху та техніка."
      />
      <PageHeader
        compact
        title="Вправи"
        description="Анатомія, фази руху та техніка"
        actions={
          <>
            <IconButton
              label="Додати власну вправу"
              icon={<Plus />}
              onClick={() => setIsAddModalOpen(true)}
              className="border border-line sm:hidden"
            />
            <Button className="hidden sm:inline-flex" onClick={() => setIsAddModalOpen(true)} icon={<Plus />}>
              Додати вправу
            </Button>
          </>
        }
      />

      <ExerciseFiltersBar
        filters={filters}
        onChange={(updates) => dispatch(setFilter(updates))}
        onReset={() => dispatch(resetFilters())}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
        resultCount={displayItems.length}
      />

      {status !== 'succeeded' && status !== 'failed' && items.length === 0 ? (
        <ExerciseGridSkeleton />
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={<Dumbbell />}
          title={favoritesOnly ? 'Обраних вправ немає' : 'Нічого не знайдено'}
          description={
            favoritesOnly
              ? 'Натисніть на сердечко на картці вправи, щоб додати її сюди.'
              : 'Змініть запит або скиньте фільтри.'
          }
          action={
            <Button variant="outline" size="sm" onClick={resetAll}>
              Скинути фільтри
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((exercise, i) => (
            <Fragment key={exercise.id}>
              <ExerciseCard
                exercise={exercise}
                isFavorite={favorites.includes(exercise.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelect={(ex) => {
                  dispatch(setSelectedExercise(ex))
                  injectExerciseSchema(ex.name, ex.description, ex.muscleGroups)
                }}
              />
              {(i + 1) % CATALOG_AD_EVERY === 0 && <AdSlot placement="catalog" />}
            </Fragment>
          ))}
        </div>
      )}

      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={() => dispatch(clearSelectedExercise())}
        isFavorite={selectedExercise ? favorites.includes(selectedExercise.id) : false}
        onToggleFavorite={(id) => dispatch(toggleFavorite(id))}
      />

      <AddExerciseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleCreateExercise} />
    </div>
  )
}
