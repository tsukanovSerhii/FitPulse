import React from 'react'
import { Dumbbell, Heart, Code2 } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#0c0f16] mt-20 py-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-[#d4ff00] text-black font-black flex items-center justify-center">
            <Dumbbell className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <span className="font-heading font-black text-slate-100 block tracking-tight">FITPULSE</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Inspired by Apollo Next Digital Club
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center font-bold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-[#d4ff00]" /> React 19 + Redux Toolkit
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[11px]">
            Tailwind CSS v4 + Vite
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <span>Створено для курсового проекту</span>
          <Heart className="w-3.5 h-3.5 text-[#d4ff00] fill-[#d4ff00]" />
        </div>
      </div>
    </footer>
  )
}
