// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Відкрити</button>
      <Modal
        isOpen={open}
        title="Нова програма"
        onClose={() => {
          onClose()
          setOpen(false)
        }}
      >
        <input aria-label="Назва" />
        <button>Зберегти</button>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('opens as a labelled dialog and moves focus inside', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('Відкрити'))

    const dialog = screen.getByRole('dialog', { name: 'Нова програма' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  })

  it('keeps Tab focus inside the dialog', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('Відкрити'))
    const dialog = screen.getByRole('dialog')

    for (let i = 0; i < 5; i++) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('closes on Escape and returns focus to the opener', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    const opener = screen.getByText('Відкрити')
    await user.click(opener)
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
