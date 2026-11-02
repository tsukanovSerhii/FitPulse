import { toast } from 'sonner'
import { buttonClasses } from './buttonStyles'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

/**
 * Замінник window.confirm на базі sonner. Повертає true лише при
 * натисканні кнопки підтвердження; закриття свайпом/таймаутом — false.
 */
export function confirmAction({
  title,
  description,
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    const settle = (value: boolean, id: string | number) => {
      if (settled) return
      settled = true
      toast.dismiss(id)
      resolve(value)
    }

    toast.custom(
      (id) => (
        <div
          role="alertdialog"
          aria-label={title}
          className="w-[min(92vw,380px)] rounded-lg border border-line bg-surface p-4 text-fg shadow-pop"
        >
          <p className="font-semibold">{title}</p>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={buttonClasses('ghost', 'sm')} onClick={() => settle(false, id)}>
              {cancelLabel}
            </button>
            <button
              type="button"
              autoFocus
              className={buttonClasses(destructive ? 'danger' : 'primary', 'sm')}
              onClick={() => settle(true, id)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      {
        duration: 15000,
        onDismiss: (t) => settle(false, t.id),
        onAutoClose: (t) => settle(false, t.id),
      },
    )
  })
}
