import React from 'react'
import type { MuscleGroup } from '@/features/exercises/model/types'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import { Badge } from './Badge'

export interface MuscleMapProps {
  primaryMuscle: MuscleGroup
  muscleGroups: MuscleGroup[]
  className?: string
}

export const MuscleMap: React.FC<MuscleMapProps> = ({
  primaryMuscle,
  muscleGroups,
  className = '',
}) => {
  const secondaryMuscles = muscleGroups.filter((m) => m !== primaryMuscle)

  // Color helper based on role
  const getMuscleStatus = (muscle: MuscleGroup) => {
    if (muscle === primaryMuscle) return 'primary'
    if (secondaryMuscles.includes(muscle)) return 'secondary'
    return 'inactive'
  }

  const getSvgFill = (muscle: MuscleGroup) => {
    const status = getMuscleStatus(muscle)
    if (status === 'primary') return 'url(#primaryGlow)'
    if (status === 'secondary') return 'url(#secondaryGlow)'
    return '#1e293b' // slate-800
  }

  const getSvgStroke = (muscle: MuscleGroup) => {
    const status = getMuscleStatus(muscle)
    if (status === 'primary') return '#38bdf8'
    if (status === 'secondary') return '#818cf8'
    return '#334155'
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[#090d16] border border-white/[0.06] shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Анатомічна карта цільових м'язів
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Розподіл біомеханічного навантаження при правильній техніці
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Основний
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Допоміжний
          </span>
        </div>
      </div>

      {/* Visual Anatomy Graphic: Front & Back silhouettes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center justify-center py-1">
        {/* Silhouette Front */}
        <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Вигляд спереду (Front View)
          </span>
          <svg viewBox="0 0 160 260" className="w-32 h-52 transition-all filter drop-shadow-md">
            <defs>
              <linearGradient id="primaryGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="secondaryGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>

            {/* Head */}
            <circle cx="80" cy="22" r="14" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            {/* Neck */}
            <rect x="74" y="34" width="12" height="10" rx="3" fill="#1e293b" />

            {/* Shoulders (Front) */}
            <path
              d="M 52 46 C 44 48 38 58 38 66 C 44 66 52 58 54 48 Z"
              fill={getSvgFill('shoulders')}
              stroke={getSvgStroke('shoulders')}
              strokeWidth="1.2"
            />
            <path
              d="M 108 46 C 116 48 122 58 122 66 C 116 66 108 58 106 48 Z"
              fill={getSvgFill('shoulders')}
              stroke={getSvgStroke('shoulders')}
              strokeWidth="1.2"
            />

            {/* Chest */}
            <path
              d="M 54 48 Q 80 46 106 48 L 102 74 Q 80 82 58 74 Z"
              fill={getSvgFill('chest')}
              stroke={getSvgStroke('chest')}
              strokeWidth="1.5"
            />

            {/* Biceps */}
            <rect
              x="33"
              y="68"
              width="13"
              height="28"
              rx="6"
              fill={getSvgFill('biceps')}
              stroke={getSvgStroke('biceps')}
              strokeWidth="1.2"
            />
            <rect
              x="114"
              y="68"
              width="13"
              height="28"
              rx="6"
              fill={getSvgFill('biceps')}
              stroke={getSvgStroke('biceps')}
              strokeWidth="1.2"
            />

            {/* Forearms */}
            <rect x="29" y="100" width="11" height="32" rx="5" fill="#1e293b" stroke="#334155" />
            <rect x="120" y="100" width="11" height="32" rx="5" fill="#1e293b" stroke="#334155" />

            {/* Abs / Core */}
            <rect
              x="62"
              y="78"
              width="36"
              height="40"
              rx="6"
              fill={getSvgFill('abs')}
              stroke={getSvgStroke('abs')}
              strokeWidth="1.5"
            />

            {/* Pelvis / Hip */}
            <path d="M 58 118 Q 80 128 102 118 L 98 136 Q 80 142 62 136 Z" fill="#1e293b" />

            {/* Thighs / Quads (Legs) */}
            <path
              d="M 54 138 Q 76 138 76 190 L 52 188 Q 48 152 54 138 Z"
              fill={getSvgFill('legs')}
              stroke={getSvgStroke('legs')}
              strokeWidth="1.5"
            />
            <path
              d="M 106 138 Q 84 138 84 190 L 108 188 Q 112 152 106 138 Z"
              fill={getSvgFill('legs')}
              stroke={getSvgStroke('legs')}
              strokeWidth="1.5"
            />

            {/* Knees */}
            <circle cx="64" cy="195" r="5" fill="#1e293b" />
            <circle cx="96" cy="195" r="5" fill="#1e293b" />

            {/* Calves (Front Shin) */}
            <rect
              x="57"
              y="204"
              width="14"
              height="38"
              rx="6"
              fill={getSvgFill('calves')}
              stroke={getSvgStroke('calves')}
              strokeWidth="1.2"
            />
            <rect
              x="89"
              y="204"
              width="14"
              height="38"
              rx="6"
              fill={getSvgFill('calves')}
              stroke={getSvgStroke('calves')}
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Silhouette Back */}
        <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Вигляд ззаду (Back View)
          </span>
          <svg viewBox="0 0 160 260" className="w-36 h-56 transition-all filter drop-shadow-md">
            {/* Head back */}
            <circle cx="80" cy="22" r="14" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            {/* Traps / Upper Back */}
            <path
              d="M 64 36 L 96 36 L 104 54 L 56 54 Z"
              fill={getSvgFill('back')}
              stroke={getSvgStroke('back')}
              strokeWidth="1.2"
            />

            {/* Shoulders (Rear Delts) */}
            <path
              d="M 52 46 C 44 48 38 58 38 66 C 44 66 52 58 54 48 Z"
              fill={getSvgFill('shoulders')}
              stroke={getSvgStroke('shoulders')}
              strokeWidth="1.2"
            />
            <path
              d="M 108 46 C 116 48 122 58 122 66 C 116 66 108 58 106 48 Z"
              fill={getSvgFill('shoulders')}
              stroke={getSvgStroke('shoulders')}
              strokeWidth="1.2"
            />

            {/* Triceps */}
            <rect
              x="33"
              y="68"
              width="13"
              height="28"
              rx="6"
              fill={getSvgFill('triceps')}
              stroke={getSvgStroke('triceps')}
              strokeWidth="1.2"
            />
            <rect
              x="114"
              y="68"
              width="13"
              height="28"
              rx="6"
              fill={getSvgFill('triceps')}
              stroke={getSvgStroke('triceps')}
              strokeWidth="1.2"
            />

            {/* Lats & Lower Back */}
            <path
              d="M 56 54 Q 80 56 104 54 L 94 116 Q 80 118 66 116 Z"
              fill={getSvgFill('back')}
              stroke={getSvgStroke('back')}
              strokeWidth="1.5"
            />

            {/* Glutes */}
            <path
              d="M 58 118 Q 80 124 102 118 Q 106 144 80 144 Q 54 144 58 118 Z"
              fill={getSvgFill('glutes')}
              stroke={getSvgStroke('glutes')}
              strokeWidth="1.5"
            />

            {/* Hamstrings (Legs back) */}
            <path
              d="M 54 144 Q 76 144 76 190 L 52 188 Q 48 152 54 144 Z"
              fill={getSvgFill('legs')}
              stroke={getSvgStroke('legs')}
              strokeWidth="1.5"
            />
            <path
              d="M 106 144 Q 84 144 84 190 L 108 188 Q 112 152 106 144 Z"
              fill={getSvgFill('legs')}
              stroke={getSvgStroke('legs')}
              strokeWidth="1.5"
            />

            {/* Calves (Back) */}
            <rect
              x="57"
              y="204"
              width="14"
              height="38"
              rx="6"
              fill={getSvgFill('calves')}
              stroke={getSvgStroke('calves')}
              strokeWidth="1.5"
            />
            <rect
              x="89"
              y="204"
              width="14"
              height="38"
              rx="6"
              fill={getSvgFill('calves')}
              stroke={getSvgStroke('calves')}
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* Target Breakdown Legend */}
      <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Основний цільовий м'яз (Target):</span>
          <Badge variant="info" dot size="sm">
            {MUSCLE_GROUP_LABELS[primaryMuscle]} (~80-100% навантаження)
          </Badge>
        </div>

        {secondaryMuscles.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Синергісти / стабілізатори:</span>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {secondaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {MUSCLE_GROUP_LABELS[m]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
