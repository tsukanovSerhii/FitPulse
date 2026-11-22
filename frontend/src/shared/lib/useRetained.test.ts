// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRetained } from './useRetained'

describe('useRetained', () => {
  it('follows the value and keeps the last one once it is cleared', () => {
    const { result, rerender } = renderHook(({ value }: { value: string | null }) => useRetained(value), { initialProps: { value: null as string | null } })
    expect(result.current).toBeNull()

    rerender({ value: 'Жим лежачи' })
    expect(result.current).toBe('Жим лежачи')

    rerender({ value: null })
    expect(result.current).toBe('Жим лежачи')

    rerender({ value: 'Присідання' })
    expect(result.current).toBe('Присідання')
  })
})
