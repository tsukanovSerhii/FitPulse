import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
  /** Доступна назва, якщо `label` — лише іконка */
  ariaLabel?: string
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Назва групи для скрінрідерів */
  label: string
  size?: 'sm' | 'md'
  /** `underline` — як навігація в референсі, `pill` — компактний перемикач */
  appearance?: 'pill' | 'underline'
  className?: string
}

/**
 * Радіогрупа з roving tabindex: стрілки / Home / End переміщують вибір,
 * у фокусі лише активний сегмент.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  appearance = 'pill',
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  const select = (index: number) => {
    const next = (index + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(activeIndex + 1),
      ArrowDown: () => select(activeIndex + 1),
      ArrowLeft: () => select(activeIndex - 1),
      ArrowUp: () => select(activeIndex - 1),
      Home: () => select(0),
      End: () => select(options.length - 1),
    }
    const action = keys[event.key]
    if (action) {
      event.preventDefault()
      action()
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'inline-flex items-center',
        appearance === 'pill' ? 'gap-0.5 rounded-md border border-line bg-surface-2 p-0.5' : 'gap-5 border-b border-line',
        className,
      )}
    >
      {options.map((option, index) => {
        const checked = index === activeIndex
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.ariaLabel}
            title={option.ariaLabel}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex cursor-pointer items-center justify-center gap-1.5 font-semibold whitespace-nowrap transition-colors duration-200 [&_svg]:size-4',
              appearance === 'pill' && [
                'rounded-[5px]',
                size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3.5 text-sm',
                checked ? 'bg-surface text-fg shadow-sm' : 'text-fg-subtle hover:text-fg',
              ],
              appearance === 'underline' && [
                '-mb-px border-b-2 pb-2.5 pt-1 text-sm',
                checked ? 'border-accent text-fg' : 'border-transparent text-fg-subtle hover:text-fg',
              ],
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
