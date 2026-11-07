// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ExerciseSubmission } from '@fitpulse/contracts'
import { describe, expect, it, vi } from 'vitest'
import { AddExerciseModal } from './AddExerciseModal'
import { MySubmissions } from './MySubmissions'

const exercise = { name: 'Жим Арнольда', primaryMuscle: 'shoulders', muscleGroups: ['shoulders'], difficulty: 'beginner', equipment: 'dumbbell', description: '', defaultSets: 3, defaultReps: 10, defaultRestSeconds: 60 } as const
const submission = (over: Partial<ExerciseSubmission>): ExerciseSubmission => ({
  id: crypto.randomUUID(),
  status: 'pending',
  rejectReason: null,
  exercise: { ...exercise, muscleGroups: ['shoulders'] },
  createdAt: '2026-11-08T10:00:00.000Z',
  reviewedAt: null,
  ...over,
})

describe('AddExerciseModal', () => {
  it('is personal by default; the switch asks to share it with everyone', async () => {
    const onSubmit = vi.fn(async () => undefined)
    const { unmount } = render(<AddExerciseModal isOpen onClose={() => undefined} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Назва'), 'Жим Арнольда')
    await userEvent.click(screen.getByRole('button', { name: 'Створити' }))
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Жим Арнольда' }), { share: false })
    unmount()

    render(<AddExerciseModal isOpen onClose={() => undefined} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Назва'), 'Жим Арнольда')
    await userEvent.click(screen.getByRole('checkbox', { name: /Запропонувати для всіх/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Створити' }))
    expect(onSubmit).toHaveBeenLastCalledWith(expect.anything(), { share: true })
  })
})

describe('MySubmissions', () => {
  it('shows each request with its status and the moderator\'s reason', async () => {
    const load = vi.fn(async () => [
      submission({ status: 'pending' }),
      submission({ status: 'approved', exercise: { ...exercise, muscleGroups: ['shoulders'], name: 'Тяга' } }),
      submission({ status: 'rejected', rejectReason: 'Дублює вбудовану', exercise: { ...exercise, muscleGroups: ['shoulders'], name: 'Присід' } }),
    ])
    render(<MySubmissions load={load} />)
    await userEvent.click(await screen.findByRole('button', { name: /Мої заявки · 3/ }))
    expect(screen.getByText('На перевірці')).toBeInTheDocument()
    expect(screen.getByText('Опубліковано')).toBeInTheDocument()
    expect(screen.getByText('Відхилено')).toBeInTheDocument()
    expect(screen.getByText(/Дублює вбудовану/)).toBeInTheDocument()
  })

  it('shows nothing without requests or when they cannot be loaded', async () => {
    const { container } = render(<MySubmissions load={async () => { throw new Error('offline') }} />)
    await new Promise((r) => setTimeout(r, 0))
    expect(container).toBeEmptyDOMElement()
  })
})
