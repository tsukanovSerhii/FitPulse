import { useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Field } from './Field'
import { controlClasses, describedBy } from './fieldStyles'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({ label, error, helperText, className, id, rows = 3, ...props }: TextareaProps) {
  const autoId = useId()
  const fieldId = id || props.name || autoId

  return (
    <Field id={fieldId} label={label} error={error} helperText={helperText}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, helperText)}
        className={cn(controlClasses(error), 'h-auto resize-y py-2.5', className)}
        {...props}
      />
    </Field>
  )
}
