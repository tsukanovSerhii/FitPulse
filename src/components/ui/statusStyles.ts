/**
 * State colors, kept apart from action colors: a solid accent fill always means "press me",
 * so finished items use the success tone and the current item only gets an accent outline.
 */
export const statusStyles = {
  done: 'border-success/40 bg-success-soft text-success',
  current: 'border-accent text-accent',
  planned: 'border-line-strong text-fg',
  idle: 'border-line text-fg-subtle',
} as const

export const progressFill = (complete: boolean) => (complete ? 'bg-success' : 'bg-accent')
