import { Toaster } from 'sonner'
import { useAppSelector } from '../store/hooks'

export function ThemedToaster() {
  const theme = useAppSelector((state) => state.theme.resolved)
  return (
    <Toaster
      theme={theme}
      position="top-center"
      offset={16}
      toastOptions={{
        classNames: {
          toast: '!bg-surface !text-fg !border-line !rounded-lg !shadow-pop',
          description: '!text-fg-muted',
          success: '[&_[data-icon]]:!text-success',
          error: '[&_[data-icon]]:!text-danger',
          warning: '[&_[data-icon]]:!text-warning',
        },
      }}
    />
  )
}
