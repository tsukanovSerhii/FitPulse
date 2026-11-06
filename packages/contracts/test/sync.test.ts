import { describe, expect, it } from 'vitest'
import { SYNC_LIMITS, syncRequestSchema } from '../src/index.js'

const change = (over: Record<string, unknown> = {}) => ({ kind: 'workout', id: 'w1', data: { a: 1 }, updatedAt: '2026-11-07T10:00:00.000Z', ...over })

describe('sync contracts', () => {
  it('accepts a cursor with changes, deletions included', () => {
    const parsed = syncRequestSchema.parse({ cursor: '0', changes: [change(), change({ id: 'w2', data: null })] })
    expect(parsed.changes).toHaveLength(2)
    expect(parsed.changes[1]!.data).toBeNull()
  })

  it('rejects an unknown kind, a long id and a bad cursor', () => {
    expect(syncRequestSchema.safeParse({ cursor: '0', changes: [change({ kind: 'secret' })] }).success).toBe(false)
    expect(syncRequestSchema.safeParse({ cursor: '0', changes: [change({ id: 'x'.repeat(101) })] }).success).toBe(false)
    expect(syncRequestSchema.safeParse({ cursor: '-1', changes: [] }).success).toBe(false)
  })

  it('caps the number of changes', () => {
    const many = Array.from({ length: SYNC_LIMITS.changes + 1 }, (_, i) => change({ id: `w${i}` }))
    expect(syncRequestSchema.safeParse({ cursor: '0', changes: many }).success).toBe(false)
  })
})
