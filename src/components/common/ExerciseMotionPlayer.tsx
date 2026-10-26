import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Wind, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Exercise, MovementPhase } from '@/features/exercises/model/types'
import { Button } from './Button'
import { Badge } from './Badge'

export interface ExerciseMotionPlayerProps {
  exercise: Exercise
}

export const ExerciseMotionPlayer: React.FC<ExerciseMotionPlayerProps> = ({ exercise }) => {
  // Default movement phases if not custom defined
  const phases: MovementPhase[] = exercise.guide?.phases || [
    {
      name: '1. Вихідне положення (Setup)',
      instruction:
        'Займіть стабільну позицію, зафіксуйте кор, зведіть лопатки та перевірте правильність хвату.',
      cue: 'Напружте прес, стабільний корпус',
      breathing: 'inhale',
    },
    {
      name: '2. Ексцентрична фаза (Опускання / Розтягнення)',
      instruction:
        'Підконтрольно опускайте снаряд протягом 2-3 секунд, відчуваючи максимальне натягнення цільового м\'яза.',
      cue: 'Повільно, без падіння ваги',
      breathing: 'inhale',
    },
    {
      name: '3. Пікова точка (Розтягнення та стабілізація)',
      instruction:
        'Короткочасна фіксація в нижній амплітуді без втрати напруги та без відбиву від суглобів.',
      cue: 'Контроль у нижній точці',
      breathing: 'hold',
    },
    {
      name: '4. Концентрична фаза (Вибуховий підйом)',
      instruction:
        'Потужним рухом витисніть/підтягніть снаряд за рахунок цільової групи м\'язів на видиху.',
      cue: 'Потужний видих на зусиллі!',
      breathing: 'exhale',
    },
  ]

  const [activePhaseIndex, setActivePhaseIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempoSeconds, setTempoSeconds] = useState(1)

  // Auto-play animation cycle
  useEffect(() => {
    let timer: number | null = null
    if (isPlaying) {
      timer = window.setInterval(() => {
        setActivePhaseIndex((prev) => (prev + 1) % phases.length)
        setTempoSeconds((prev) => (prev % 3) + 1)
      }, 2000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying, phases.length])

  const currentPhase = phases[activePhaseIndex]

  // Breathing color & text
  const breathingInfo = {
    inhale: { label: 'ВДИХ 🌬️ (Наповнення легень)', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
    exhale: { label: 'ВИДИХ 💨 (Потужне зусилля)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    hold: { label: 'ФІКСАЦІЯ ⏸️ (Затримка)', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  }[currentPhase.breathing]

  // Height offset for weight animation
  const weightYOffset = {
    0: 50,  // Setup
    1: 110, // Down (eccentric)
    2: 120, // Bottom peak
    3: 40,  // Up (concentric)
  }[activePhaseIndex] || 50

  return (
    <div className="space-y-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 p-5 sm:p-6 shadow-2xl">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h4 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Інтерактивний візуалізатор техніки та фаз руху
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Дотримуйтесь правильного темпу та дихання для максимального зростання результатів
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant={isPlaying ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            icon={isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            className="text-xs"
          >
            {isPlaying ? 'Пауза' : 'Демонстрація'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsPlaying(false)
              setActivePhaseIndex(0)
            }}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-white"
          >
            Скинути
          </Button>
        </div>
      </div>

      {/* Main Interactive Stage: Graphic Animation & Movement Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Animated Visual Diagram Canvas */}
        <div className="md:col-span-5 relative h-56 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 flex flex-col items-center justify-center overflow-hidden p-4">
          {/* Ambient lighting ring */}
          <div className="absolute w-40 h-40 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* SVG Movement Track & Weight Bar */}
          <svg viewBox="0 0 200 180" className="w-full h-full max-w-[220px]">
            {/* Guide trajectory line */}
            <line
              x1="100"
              y1="35"
              x2="100"
              y2="135"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Target muscle zone indicator */}
            <circle cx="100" cy="85" r="28" fill="#7c3aed" fillOpacity="0.12" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
            <text x="100" y="88" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold">
              ЦІЛЬОВА ЗОНА
            </text>

            {/* Moving barbell / dumbbell asset with smooth transition */}
            <g
              style={{
                transform: `translateY(${weightYOffset}px)`,
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Barbell Bar */}
              <rect x="25" y="-5" width="150" height="8" rx="4" fill="#94a3b8" />
              {/* Center Grip */}
              <rect x="80" y="-7" width="40" height="12" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
              {/* Left Plates */}
              <rect x="35" y="-22" width="10" height="42" rx="4" fill="#8b5cf6" stroke="#c084fc" strokeWidth="1.5" />
              <rect x="23" y="-18" width="8" height="34" rx="3" fill="#6d28d9" />
              {/* Right Plates */}
              <rect x="155" y="-22" width="10" height="42" rx="4" fill="#8b5cf6" stroke="#c084fc" strokeWidth="1.5" />
              <rect x="169" y="-18" width="8" height="34" rx="3" fill="#6d28d9" />

              {/* Force arrows */}
              {activePhaseIndex === 1 && (
                <path d="M 100 20 L 100 32 M 95 27 L 100 32 L 105 27" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              )}
              {activePhaseIndex === 3 && (
                <path d="M 100 -20 L 100 -32 M 95 -27 L 100 -32 L 105 -27" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
              )}
            </g>
          </svg>

          {/* Active Phase Pill Overlay */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
            <span className="text-slate-400 font-semibold">Фаза:</span>
            <span className="font-bold text-purple-300">{currentPhase.name.split('(')[0]}</span>
          </div>
        </div>

        {/* Phase Details, Breathing, Cue */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Phase selector buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {phases.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsPlaying(false)
                  setActivePhaseIndex(idx)
                }}
                className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                  activePhaseIndex === idx
                    ? 'bg-purple-600/25 border-purple-400 text-purple-300 shadow-md shadow-purple-600/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[10px] text-slate-400">Крок {idx + 1}</span>
                <span className="line-clamp-1">{p.name.split('.')[1] || p.name}</span>
              </button>
            ))}
          </div>

          {/* Phase Detailed Description Box */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-sm font-bold text-white">{currentPhase.name}</h5>
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border ${breathingInfo.color}`}>
                <Wind className="w-3 h-3" />
                {breathingInfo.label}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentPhase.instruction}
            </p>

            {/* Coach cue pill */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs">
              <span className="text-purple-400 font-bold">🧠 Ментальний фокус:</span>
              <span className="text-slate-200 font-medium italic">«{currentPhase.cue}»</span>
            </div>
          </div>

          {/* Tempo & Execution Standard */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-0.5">
                Рекомендований темп
              </span>
              <span className="font-extrabold text-white font-mono text-sm">
                {exercise.guide?.tempo || '3-0-1-0'} (секунди)
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                3с вниз • 0с пауза • 1с підйом
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-0.5">
                Правило дихання
              </span>
              <span className="font-bold text-amber-300 text-xs">
                Видих на підйомі!
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Не затримуйте дихання (Valsalva)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
