import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Field, controlClasses, describedBy } from './Field'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id || props.name || autoId

  return (
    <Field id={inputId} label={label} error={error} helperText={helperText}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, helperText)}
        className={cn(controlClasses(error), props.type === 'number' && 'font-mono tabular', className)}
        {...props}
      />
    </Field>
  )
}
