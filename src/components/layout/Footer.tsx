import React from 'react'
import { Dumbbell, Heart, Code2 } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-surface/40 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-slate-300">FitPulse Workout Tracker</span>
          <span>— Курсовий проект з React & Redux Toolkit</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-[11px]">
            <Code2 className="w-3 h-3" /> React 19 + Redux Toolkit
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[11px]">
            Vite + Tailwind CSS v4
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span>Створено з</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>для демонстрації знань React</span>
        </div>
      </div>
    </footer>
  )
}
