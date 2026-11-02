import { useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Field, controlClasses, describedBy } from '@/components/ui'
import { cn } from '@/utils/cn'
import { passwordStrength } from '../lib/validation'

const STRENGTH = [
  { label: 'Дуже слабкий', className: 'bg-danger' },
  { label: 'Слабкий', className: 'bg-danger' },
  { label: 'Середній', className: 'bg-warning' },
  { label: 'Надійний', className: 'bg-success' },
  { label: 'Дуже надійний', className: 'bg-success' },
]

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  label: string
  value: string
  error?: string
  showStrength?: boolean
}

export function PasswordField({ label, value, error, showStrength = false, className, ...props }: PasswordFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const score = passwordStrength(value)
  const helperText = showStrength && value ? STRENGTH[score].label : undefined

  return (
    <Field id={id} label={label} error={error} helperText={helperText}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, helperText)}
          className={cn(controlClasses(error), 'pr-12', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-fg-subtle hover:text-fg"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {showStrength && value && (
        <div className="grid grid-cols-4 gap-1" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={cn('h-1 rounded-full', i < score ? STRENGTH[score].className : 'bg-line')} />
          ))}
        </div>
      )}
    </Field>
  )
}
