import React from 'react'
import { Dumbbell, Heart, Code2 } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md mt-20 py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Dumbbell className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200">FitPulse Workout Tracker</span>
          <span className="text-slate-500">— Курсовий проект з React та Redux Toolkit</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/25 font-mono text-[11px] font-semibold">
            <Code2 className="w-3.5 h-3.5" /> React 19 + Redux Toolkit
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 font-mono text-[11px] font-semibold">
            Tailwind CSS v4 + Vite
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Створено з</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>для демонстрації навичок React</span>
        </div>
      </div>
    </footer>
  )
}
