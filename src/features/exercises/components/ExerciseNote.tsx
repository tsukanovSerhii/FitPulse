import { useState } from 'react'
import { NotebookPen } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { cn } from '@/shared/lib/cn'
import { saveExerciseNote } from '../model/exercisesSlice'

/**
 * The user's own note for an exercise: seat position, grip, how it felt. It saves when the field
 * loses focus and shows wherever the exercise appears.
 */
export function ExerciseNote({ exerciseId, compact = false }: { exerciseId: string; compact?: boolean }) {
  const dispatch = useAppDispatch()
  const saved = useAppSelector((state) => state.exercises.notes[exerciseId] ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(saved)

  const save = () => {
    setEditing(false)
    if (draft.trim() !== saved) dispatch(saveExerciseNote({ exerciseId, text: draft }))
  }

  if (compact && !editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(saved)
          setEditing(true)
        }}
        className={cn('flex w-full cursor-pointer items-start gap-2 text-left text-sm', saved ? 'text-fg' : 'text-fg-subtle hover:text-fg')}
      >
        <NotebookPen className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        <span className="min-w-0 whitespace-pre-line">{saved || 'Додати нотатку: позиція сидіння, хват…'}</span>
      </button>
    )
  }

  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
        <NotebookPen className="size-3.5 text-accent" aria-hidden="true" />
        Моя нотатка
      </span>
      <textarea
        value={editing ? draft : saved}
        onFocus={() => {
          setDraft(saved)
          setEditing(true)
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        autoFocus={compact}
        rows={2}
        maxLength={300}
        placeholder="Позиція сидіння, хват, на що звернути увагу"
        className="w-full resize-none rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
      />
    </label>
  )
}
