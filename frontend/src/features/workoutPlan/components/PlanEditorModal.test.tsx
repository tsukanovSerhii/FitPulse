// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlanEditorModal } from './PlanEditorModal'

describe('PlanEditorModal', () => {
  it('shows a field error instead of saving an empty name', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<PlanEditorModal isOpen onClose={() => {}} onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: 'Створити' }))
    expect(screen.getByLabelText('Назва')).toHaveAccessibleDescription('Введіть назву програми')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves a trimmed plan with an empty week', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<PlanEditorModal isOpen onClose={onClose} onSave={onSave} />)

    await user.type(screen.getByLabelText('Назва'), '  Мій спліт  ')
    await user.click(screen.getByRole('button', { name: 'Створити' }))

    const plan = onSave.mock.calls[0][0]
    expect(plan.name).toBe('Мій спліт')
    expect(Object.values(plan.schedule).every((day) => Array.isArray(day) && day.length === 0)).toBe(true)
    expect(onClose).toHaveBeenCalled()
  })
})
