import { memo, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { IconButton } from './IconButton'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  eyebrow?: ReactNode
  subtitle?: ReactNode
  /** Extra controls placed before the close button */
  headerActions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
}

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Renders its children until `frozen`, then keeps the last output however the props change. */
const Frozen = memo(
  function Frozen({ children }: { children: ReactNode; frozen: boolean }) {
    return children
  },
  (_, next) => next.frozen,
)

/** Accessible dialog: portal, focus trap, Escape, scroll lock and focus restore. */
export function Modal({ isOpen, onClose, title, eyebrow, subtitle, headerActions, children, footer, maxWidth = 'lg' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  // Stays rendered after isOpen turns false until the closing animation ends
  const [mounted, setMounted] = useState(isOpen)
  if (isOpen && !mounted) setMounted(true)
  const closing = mounted && !isOpen

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!closing) return
    const animations = dialogRef.current?.getAnimations?.() ?? []
    let cancelled = false
    Promise.all(animations.map((animation) => animation.finished))
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setMounted(false)
      })
    return () => {
      cancelled = true
    }
  }, [closing])

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    // Focus the first control after the close button, falling back to the dialog itself
    const [first, second] = focusables()
    ;(second ?? first ?? dialog)?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <div className={cn('fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4', closing && 'pointer-events-none')}>
      <div
        className={cn('absolute inset-0 bg-overlay backdrop-blur-sm', closing ? 'animate-fade-out' : 'animate-fade-in')}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          // min-w-0: a <select> is as wide as its longest option and would push the dialog past a phone screen
          'relative flex max-h-[92dvh] w-full min-w-0 flex-col overflow-hidden border border-line bg-surface shadow-pop outline-none',
          closing ? 'animate-sink' : 'animate-rise',
          'rounded-t-lg sm:rounded-lg',
          widths[maxWidth],
        )}
      >
        {/* While it fades out, the dialog keeps showing what it showed when open, not its emptied state */}
        <Frozen frozen={closing}>
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {eyebrow && <div className="mb-1 text-xs font-medium tracking-wider text-accent">{eyebrow}</div>}
              {title && (
                <h2 id={titleId} className="text-xl sm:text-2xl text-fg">
                  {title}
                </h2>
              )}
              {subtitle && <div className="mt-1.5 text-sm text-fg-muted">{subtitle}</div>}
            </div>
            <div className="-mr-2 flex shrink-0 items-center gap-1">
              {headerActions}
              <IconButton label="Закрити" icon={<X />} size="sm" onClick={onClose} />
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
        </Frozen>
      </div>
    </div>,
    document.body,
  )
}
