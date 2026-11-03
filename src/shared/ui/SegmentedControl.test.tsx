// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const OPTIONS = [
  { value: 'light', label: 'Світла' },
  { value: 'dark', label: 'Темна' },
  { value: 'system', label: 'Системна' },
] as const

function Harness() {
  const [value, setValue] = useState<'light' | 'dark' | 'system'>('light')
  return <SegmentedControl label="Тема" options={[...OPTIONS]} value={value} onChange={setValue} />
}

describe('SegmentedControl', () => {
  it('exposes a radio group with the current choice checked', () => {
    render(<Harness />)
    expect(screen.getByRole('radiogroup', { name: 'Тема' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Світла' })).toHaveAttribute('aria-checked', 'true')
  })

  it('moves the selection with arrow keys, wrapping around, and keeps a single tab stop', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.tab()
    expect(screen.getByRole('radio', { name: 'Світла' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Темна' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Темна' })).toHaveFocus()

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Системна' })).toHaveAttribute('aria-checked', 'true')

    const tabbable = screen.getAllByRole('radio').filter((radio) => radio.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
  })

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.tab()
    await user.keyboard('{End}')
    expect(screen.getByRole('radio', { name: 'Системна' })).toHaveAttribute('aria-checked', 'true')
    await user.keyboard('{Home}')
    expect(screen.getByRole('radio', { name: 'Світла' })).toHaveAttribute('aria-checked', 'true')
  })
})
