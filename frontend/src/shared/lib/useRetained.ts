import { useState } from 'react'

/**
 * The value, or the last one that was present once it turns null. A dialog whose data is cleared
 * as it closes keeps showing that data while it fades out, instead of vanishing at once.
 */
export function useRetained<T>(value: T | null | undefined): T | null | undefined {
  const [kept, setKept] = useState(value)
  if (value != null && value !== kept) setKept(value)
  return value ?? kept
}
