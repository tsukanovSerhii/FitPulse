// @vitest-environment jsdom
import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
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

  it('fades out showing its last content, then leaves the page', async () => {
    // jsdom has no Web Animations: stand in one closing animation that ends on demand
    let finish = () => {}
    const finished = new Promise<void>((resolve) => (finish = resolve))
    const getAnimations = vi.fn(() => [{ finished }] as unknown as Animation[])
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', { value: getAnimations, configurable: true })

    const { rerender } = render(
      <Modal isOpen title="Жим лежачи" onClose={() => {}}>
        Техніка жиму
      </Modal>,
    )
    // The parent clears the exercise as it closes the dialog
    rerender(
      <Modal isOpen={false} title={undefined} onClose={() => {}}>
        {null}
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('Техніка жиму')
    expect(screen.getByRole('heading', { name: 'Жим лежачи' })).toBeInTheDocument()

    await act(async () => finish())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    delete (HTMLElement.prototype as { getAnimations?: unknown }).getAnimations
  })
})
