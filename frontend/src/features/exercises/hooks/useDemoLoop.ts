import { useEffect, useMemo, useState } from 'react'
import type { TechniqueStep } from '../model/types'
import { buildTimeline, stepAt } from '../lib/technique'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Drives the demo: loops through the steps in real time and lets the user pause or jump to a step. */
export function useDemoLoop(steps: TechniqueStep[], enabled: boolean) {
  const timeline = useMemo(() => buildTimeline(steps), [steps])
  const canPlay = enabled && timeline.total > 0
  const [playing, setPlaying] = useState(() => canPlay && !prefersReducedMotion())
  const [time, setTime] = useState(0)

  useEffect(() => {
    if (!playing || !canPlay) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      setTime((t) => (t + delta) % timeline.total)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, canPlay, timeline.total])

  // A picked step is shown at its end, so the photo already displays that moment
  const select = (index: number) => {
    setPlaying(false)
    const end = index + 1 < timeline.starts.length ? timeline.starts[index + 1] : timeline.total
    setTime(Math.max(timeline.starts[index], end - 0.001))
  }

  return {
    ...stepAt(timeline, time),
    playing: playing && canPlay,
    canPlay,
    toggle: () => setPlaying((p) => !p),
    select,
  }
}
