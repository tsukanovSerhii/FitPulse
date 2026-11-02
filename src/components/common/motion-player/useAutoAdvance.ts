import { useEffect, useState } from 'react'

/** Cycles an index through `count` steps every `intervalMs` while `running`. */
export function useAutoAdvance(count: number, intervalMs: number, running: boolean) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!running || count < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(id)
  }, [count, intervalMs, running])

  return [Math.min(index, Math.max(count - 1, 0)), setIndex] as const
}
