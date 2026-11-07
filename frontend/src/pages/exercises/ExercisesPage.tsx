import { Fragment, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { toast } from 'sonner'
import { Dumbbell, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { Button, EmptyState, IconButton, PageHeader } from '@/shared/ui'
import { AdSlot, CATALOG_AD_EVERY } from '@/features/ads'
import {
  AddExerciseModal,
  ExerciseCard,
  ExerciseDetailModal,
  ExerciseFiltersBar,
  ExerciseGridSkeleton,
  addCustomExercise,
  communityApi,
  MySubmissions,
  clearSelectedExercise,
  collapseVariants,
  fetchExercises,
  resetFilters,
  setFilter,
  setMyEquipment,
  setMyLimits,
  setSelectedExercise,
  toggleFavorite,
  type Exercise,
  type ExerciseFilters,
} from '@/features/exercises'
import { saveToSession, SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { useIncrementalList } from '@/shared/lib/useIncrementalList'
import { useSessionState } from '@/shared/storage/useSessionState'
import { injectExerciseSchema } from '@/shared/seo/meta'
import { PAGE_META } from '../meta'

const LIST_STEP = 24

export function ExercisesPage() {
  const dispatch = useAppDispatch()
  const { filteredItems, items, filters, favorites, selectedExercise, status } = useAppSelector((state) => state.exercises)

  const [favoritesOnly, setFavoritesOnly] = useSessionState(SESSION_KEYS.EXERCISE_FAVORITES_ONLY, false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [submissionsKey, setSubmissionsKey] = useState(0)

  useEffect(() => {
    if (items.length === 0) dispatch(fetchExercises())
  }, [dispatch, items.length])

  useEffect(() => {
    saveToSession(SESSION_KEYS.EXERCISE_FILTERS, filters)
  }, [filters])

  const entries = useMemo(
    () => collapseVariants(favoritesOnly ? filteredItems.filter((ex) => favorites.includes(ex.id)) : filteredItems),
    [filteredItems, favorites, favoritesOnly],
  )

  // Cards render a page at a time as the list scrolls; a filter change starts from the top
  const { visible, hasMore, showMore, watchEnd, remaining } = useIncrementalList(entries, { step: LIST_STEP, resetKey: entries })

  const select = (exercise: Exercise) => {
    dispatch(setSelectedExercise(exercise))
    injectExerciseSchema(exercise.name, exercise.description, exercise.muscleGroups)
  }

  // Equipment is the user's gym and is saved to the account; the rest are per-tab filters
  const changeFilters = ({ equipment, limits, ...rest }: Partial<ExerciseFilters>) => {
    if (equipment) dispatch(setMyEquipment(equipment))
    if (limits) dispatch(setMyLimits(limits))
    if (Object.keys(rest).length > 0) dispatch(setFilter(rest))
  }

  const handleToggleFavorite = (id: string, e?: MouseEvent) => {
    e?.stopPropagation()
    dispatch(toggleFavorite(id))
  }

  const handleCreateExercise = async (exerciseData: Omit<Exercise, 'id'>, { share }: { share: boolean }) => {
    await dispatch(addCustomExercise(exerciseData)).unwrap()
    if (!share) return
    // The personal copy is already saved; only the request to publish it can fail here
    try {
      await communityApi.submit(exerciseData)
      toast.success('Вправу надіслано на перевірку')
      setSubmissionsKey((key) => key + 1)
    } catch (err) {
      toast.error(err instanceof Error ? `Вправа збережена лише для вас. ${err.message}` : 'Вправа збережена лише для вас')
    }
  }

  const resetFilterValues = () => {
    dispatch(resetFilters())
    dispatch(setMyEquipment([]))
    dispatch(setMyLimits([]))
  }

  const resetAll = () => {
    resetFilterValues()
    setFavoritesOnly(false)
  }

  return (
    <div className="space-y-4">
      <SEO {...PAGE_META.exercises} />
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

      <MySubmissions load={communityApi.mine} refreshKey={submissionsKey} />

      <ExerciseFiltersBar
        filters={filters}
        onChange={changeFilters}
        onReset={resetFilterValues}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
        resultCount={entries.reduce((sum, entry) => sum + entry.variants.length, 0)}
      />

      {status !== 'succeeded' && status !== 'failed' && items.length === 0 ? (
        <ExerciseGridSkeleton />
      ) : entries.length === 0 ? (
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
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(({ exercise, variants }, i) => (
              <Fragment key={exercise.variant?.group ?? exercise.id}>
                <ExerciseCard
                  exercise={exercise}
                  variants={variants}
                  isFavorite={favorites.includes(exercise.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={select}
                />
                {(i + 1) % CATALOG_AD_EVERY === 0 && <AdSlot placement="catalog" />}
              </Fragment>
            ))}
          </div>
          {hasMore && (
            <div ref={watchEnd} className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={showMore}>
                Показати ще {Math.min(remaining, LIST_STEP)}
              </Button>
            </div>
          )}
        </div>
      )}

      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={() => dispatch(clearSelectedExercise())}
        isFavorite={selectedExercise ? favorites.includes(selectedExercise.id) : false}
        onToggleFavorite={(id) => dispatch(toggleFavorite(id))}
        allExercises={items}
        availableEquipment={filters.equipment}
        avoidJoints={filters.limits}
        onSelectExercise={select}
      />

      <AddExerciseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleCreateExercise} />
    </div>
  )
}
