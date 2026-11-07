import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cx } from './format.ts'

export function Button({ tone = 'default', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'primary' | 'danger' }) {
  const tones = {
    default: 'border border-gray-300 bg-white hover:bg-gray-50',
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return <button type="button" className={cx('rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50', tones[tone], className)} {...props} />
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      {title && <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>}
      {children}
    </section>
  )
}

export const ErrorText = ({ children }: { children: ReactNode }) => (
  <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
    {children}
  </p>
)
