import React from 'react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/40 border border-border/60 rounded-2xl">
      {icon && <div className="mb-3 text-sky-400 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">{icon}</div>}
      <h4 className="text-base font-bold text-slate-200">{title}</h4>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
