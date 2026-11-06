import { useCallback, useState } from 'react'

/**
 * Renders a long list in pages: the first `step` items, then the next ones as a sentinel at the end
 * scrolls into view. Changing `resetKey` (filters, a search) starts from the first page again.
 */
export function useIncrementalList<T>(items: T[], { step = 24, resetKey }: { step?: number; resetKey?: unknown } = {}) {
  const [state, setState] = useState({ key: resetKey, limit: step })
  // Resetting during render is React's pattern for state that follows a prop
  if (state.key !== resetKey) setState({ key: resetKey, limit: step })
  const limit = state.key === resetKey ? state.limit : step

  const showMore = useCallback(() => setState((s) => ({ ...s, limit: s.limit + step })), [step])
  const hasMore = limit < items.length

  // A callback ref with cleanup: the observer follows the sentinel as it mounts and unmounts
  const watchEnd = useCallback(
    (node: HTMLElement | null) => {
      if (!node || typeof IntersectionObserver === 'undefined') return
      const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && showMore(), { rootMargin: '600px 0px' })
      observer.observe(node)
      return () => observer.disconnect()
    },
    [showMore],
  )

  return { visible: items.slice(0, limit), hasMore, showMore, watchEnd, remaining: items.length - limit }
}
