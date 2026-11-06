// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useIncrementalList } from './useIncrementalList'

const items = Array.from({ length: 60 }, (_, i) => i)

describe('useIncrementalList', () => {
  it('shows one page, then the next on request', () => {
    const { result } = renderHook(() => useIncrementalList(items, { step: 24 }))
    expect(result.current.visible).toHaveLength(24)
    expect(result.current.remaining).toBe(36)
    act(() => result.current.showMore())
    expect(result.current.visible).toHaveLength(48)
    act(() => result.current.showMore())
    expect(result.current.visible).toHaveLength(60)
    expect(result.current.hasMore).toBe(false)
  })

  it('starts over when the list changes', () => {
    const { result, rerender } = renderHook(({ list }) => useIncrementalList(list, { step: 24, resetKey: list }), { initialProps: { list: items } })
    act(() => result.current.showMore())
    expect(result.current.visible).toHaveLength(48)
    rerender({ list: items.slice(0, 50) })
    expect(result.current.visible).toHaveLength(24)
  })
})
