// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NumberStepper } from './NumberStepper'

function Harness({ initial = 70, min = 0, max = 100 }: { initial?: number; min?: number; max?: number }) {
  const [value, setValue] = useState(initial)
  return <NumberStepper label="Вага" unit="кг" value={value} onChange={setValue} step={2.5} min={min} max={max} decimals={1} />
}

describe('NumberStepper', () => {
  it('steps the value up and down', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Вага: плюс 2.5' }))
    await user.click(screen.getByRole('button', { name: 'Вага: плюс 2.5' }))
    expect(screen.getByRole('spinbutton')).toHaveValue(75)
    await user.click(screen.getByRole('button', { name: 'Вага: мінус 2.5' }))
    expect(screen.getByRole('spinbutton')).toHaveValue(72.5)
  })

  it('stops at the limits and disables the button there', async () => {
    const user = userEvent.setup()
    render(<Harness initial={97.5} />)
    const plus = screen.getByRole('button', { name: 'Вага: плюс 2.5' })
    await user.click(plus)
    expect(screen.getByRole('spinbutton')).toHaveValue(100)
    expect(plus).toBeDisabled()
  })

  it('clamps typed values into range', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '250')
    expect(input).toHaveValue(100)
  })
})
