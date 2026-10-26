import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Wind, Activity, User, Sparkles } from 'lucide-react'
import type { Exercise, MovementPhase } from '@/features/exercises/model/types'
import { Button } from './Button'
import { AthleteRig, type MovementPattern } from './AthleteRig'
import { MuscleMap } from './MuscleMap'

export interface ExerciseMotionPlayerProps {
  exercise: Exercise
  initialTab?: 'motion' | 'anatomy'
  showTabSwitcher?: boolean
  className?: string
}

/**
 * Resolves the biomechanical movement pattern for the athlete rig.
 */
function getMovementPattern(exercise: Exercise): MovementPattern {
  const id = exercise.id.toLowerCase()
  if (id.includes('bench-press') || id.includes('incline')) return 'bench_press'
  if (id.includes('squat')) return 'squat'
  if (id.includes('deadlift')) return 'deadlift'
  if (id.includes('pull-up')) return 'pull_up'
  if (id.includes('overhead-press') || id.includes('shoulder-press')) return 'overhead_press'
  if (id.includes('row')) return 'row'
  if (id.includes('push-up')) return 'push_up'
  if (id.includes('dip')) return 'dips'
  if (id.includes('curl')) return 'bicep_curl'
  if (id.includes('pushdown') || id.includes('tricep')) return 'tricep_pushdown'
  if (id.includes('plank')) return 'plank'
  if (id.includes('leg-raise')) return 'hanging_leg_raise'
  if (id.includes('lunge')) return 'lunge'
  if (id.includes('lateral')) return 'lateral_raise'
  if (id.includes('calf')) return 'calf_raise'
  if (id.includes('swing')) return 'kettlebell_swing'
  if (id.includes('treadmill') || id.includes('cardio') || id.includes('hiit')) return 'cardio_run'

  // Primary muscle fallbacks
  switch (exercise.primaryMuscle) {
    case 'chest':
      return 'bench_press'
    case 'legs':
    case 'calves':
      return 'squat'
    case 'back':
      return 'pull_up'
    case 'shoulders':
      return 'overhead_press'
    case 'biceps':
      return 'bicep_curl'
    case 'triceps':
      return 'dips'
    case 'abs':
      return 'plank'
    case 'glutes':
      return 'deadlift'
    default:
      return 'squat'
  }
}

export const ExerciseMotionPlayer: React.FC<ExerciseMotionPlayerProps> = ({
  exercise,
  initialTab = 'motion',
  showTabSwitcher = true,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'motion' | 'anatomy'>(initialTab)
  const [activePhaseIndex, setActivePhaseIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const phases: MovementPhase[] = exercise.guide?.phases || [
    {
      name: '1. Вихідне положення (Setup)',
      instruction: 'Займіть стабільну позицію, напружте кор, зведіть лопатки та зафіксуйте хват.',
      cue: 'Стабільний корпус, лопатки зібрані',
      breathing: 'inhale',
    },
    {
      name: '2. Ексцентрична фаза (Опускання)',
      instruction: 'Підконтрольно опускайте вагу протягом 2-3 секунд, відчуваючи натягнення цільового м\'яза.',
      cue: 'Повільний рух без ривків',
      breathing: 'inhale',
    },
    {
      name: '3. Пікова точка (Пауза)',
      instruction: 'Короткочасна фіксація в нижній амплітуді без втрати напруги та без відбиву від суглобів.',
      cue: 'Контроль без відскоку',
      breathing: 'hold',
    },
    {
      name: '4. Концентрична фаза (Підйом)',
      instruction: 'Потужним рухом витисніть/підтягніть снаряд за рахунок цільових м\'язів на видиху.',
      cue: 'Потужний видих на зусиллі',
      breathing: 'exhale',
    },
  ]

  // Auto-play animation cycle
  useEffect(() => {
    let timer: number | null = null
    if (isPlaying && activeTab === 'motion') {
      timer = window.setInterval(() => {
        setActivePhaseIndex((prev) => (prev + 1) % phases.length)
      }, 2200)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying, activeTab, phases.length])

  const pattern = getMovementPattern(exercise)
  const currentPhase = phases[activePhaseIndex] || phases[0]

  const breathingBadge = {
    inhale: { label: 'Вдих 🌬️', desc: 'Наповнення легень при опусканні' },
    exhale: { label: 'Видих 💨', desc: 'Потужне зусилля на підйомі' },
    hold: { label: 'Затримка ⏸️', desc: 'Стабілізація в піковій точці' },
  }[currentPhase.breathing]

  return (
    <div
      className={`rounded-3xl bg-[#121622] border border-white/[0.08] p-5 sm:p-6 shadow-xl shadow-black/40 space-y-4 ${className}`}
    >
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        {/* Title & View Switcher */}
        <div className="flex items-center gap-2">
          {showTabSwitcher ? (
            <div className="inline-flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('motion')
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'motion'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Техніка та рух
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false)
                  setActiveTab('anatomy')
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'anatomy'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Карта м'язів
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Правильна техніка виконання</span>
            </div>
          )}
        </div>

        {/* Playback Controls (only in motion tab) */}
        {activeTab === 'motion' && (
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
        )}
      </div>

      {/* VIEW 1: MOTION & ATHLETE RIG */}
      {activeTab === 'motion' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Stage: Vector Biomechanical Human Athlete */}
          <div className="relative h-60 sm:h-64 rounded-2xl bg-[#090d16] border border-white/[0.06] overflow-hidden flex items-center justify-center p-3">
            {/* Ambient center spotlight */}
            <div className="absolute w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* The articulated Human Athlete */}
            <AthleteRig pattern={pattern} phaseIndex={activePhaseIndex} />

            {/* Bottom-left Phase Pill */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121622]/90 border border-white/10 text-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-slate-400 font-medium">Фаза {activePhaseIndex + 1}:</span>
              <strong className="text-white">{currentPhase.name.split('(')[0]}</strong>
            </div>

            {/* Bottom-right Tempo Pill */}
            <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121622]/90 border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-md">
              <span className="text-slate-400 font-sans">Темп:</span>
              <strong className="text-sky-300">{exercise.guide?.tempo || '3-0-1-0'}</strong>
            </div>
          </div>

          {/* Phase Segmented Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {phases.map((p, idx) => {
              const isActive = activePhaseIndex === idx
              const shortName = p.name.split('.')[1] || p.name

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false)
                    setActivePhaseIndex(idx)
                  }}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 border-white shadow-md font-extrabold'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span
                    className={`block text-[10px] uppercase font-bold tracking-wider ${
                      isActive ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    Крок {idx + 1}
                  </span>
                  <span className="text-xs truncate block mt-0.5">{shortName}</span>
                </button>
              )
            })}
          </div>

          {/* Single High-Signal Guidance Box */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div>
              <h5 className="text-sm font-bold text-white mb-1">{currentPhase.name}</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{currentPhase.instruction}</p>
            </div>

            {/* Coach Cue & Breathing Strip */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-sky-400 font-bold">🧠 Фокус:</span>
                <span className="italic font-medium">«{currentPhase.cue}»</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-semibold text-[11px]">
                  <Wind className="w-3 h-3" />
                  {breathingBadge.label}
                </span>

                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                  {exercise.guide?.tempo || '3-0-1-0'} сек
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ANATOMY MAP */}
      {activeTab === 'anatomy' && (
        <div className="animate-fade-in">
          <MuscleMap
            primaryMuscle={exercise.primaryMuscle}
            muscleGroups={exercise.muscleGroups}
          />
        </div>
      )}
    </div>
  )
}
