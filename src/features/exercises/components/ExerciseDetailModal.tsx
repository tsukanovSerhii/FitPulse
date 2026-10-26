import React, { useState } from 'react'
import {
  Dumbbell,
  Flame,
  Clock,
  RefreshCw,
  CheckCircle2,
  Heart,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react'
import type { Exercise } from '../model/types'
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '../model/types'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { MuscleMap } from '@/components/common/MuscleMap'
import { ExerciseMotionPlayer } from '@/components/common/ExerciseMotionPlayer'

export interface ExerciseDetailModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

type ModalTab = 'technique' | 'anatomy' | 'guide'

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('technique')

  if (!exercise) return null

  const difficultyVariant = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const

  const guide = exercise.guide

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise.name} maxWidth="2xl">
      <div className="space-y-6">
        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" dot size="sm">
              Ціль: {MUSCLE_GROUP_LABELS[exercise.primaryMuscle]}
            </Badge>
            <Badge variant={difficultyVariant[exercise.difficulty]} size="sm">
              {DIFFICULTY_LABELS[exercise.difficulty]}
            </Badge>
            <Badge variant="neutral" size="sm">
              {EQUIPMENT_LABELS[exercise.equipment]}
            </Badge>
          </div>

          <Button
            variant={isFavorite ? 'danger' : 'outline'}
            size="sm"
            onClick={() => onToggleFavorite(exercise.id)}
            icon={<Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />}
            className="text-xs"
          >
            {isFavorite ? 'В обраному' : 'В обране'}
          </Button>
        </div>

        {/* Short description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          {exercise.description}
        </p>

        {/* Quick parameters ribbon */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Підходи
            </span>
            <span className="text-base font-extrabold text-white flex items-center justify-center gap-1 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              {exercise.defaultSets} сети
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Повторення
            </span>
            <span className="text-base font-extrabold text-white flex items-center justify-center gap-1 font-mono">
              <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
              {exercise.defaultReps} повт
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Відпочинок
            </span>
            <span className="text-base font-extrabold text-white flex items-center justify-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {exercise.defaultRestSeconds}с
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('technique')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'technique'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Техніка та анімація
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anatomy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'anatomy'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Анатомія м'язів
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Новачкам vs Профі
          </button>
        </div>

        {/* TAB 1: Technique & Motion Player */}
        {activeTab === 'technique' && (
          <div className="space-y-5 animate-fade-in">
            {/* Motion Visualizer */}
            <ExerciseMotionPlayer exercise={exercise} showTabSwitcher={false} />

            {/* Step by step execution */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Покрокова інструкція виконання:
              </h4>
              <div className="space-y-2">
                {exercise.instructions.map((step) => (
                  <div
                    key={step.step}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed"
                  >
                    <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold flex items-center justify-center shrink-0">
                      {step.step}
                    </span>
                    <span className="pt-0.5">{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Muscle Anatomy Map */}
        {activeTab === 'anatomy' && (
          <div className="space-y-4 animate-fade-in">
            <MuscleMap
              primaryMuscle={exercise.primaryMuscle}
              muscleGroups={exercise.muscleGroups}
            />

            {exercise.calories && (
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Енерговитрати: <strong>~{exercise.calories} ккал/хв</strong> високої інтенсивності.
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Beginner vs Pro Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-5 animate-fade-in">
            {/* Common Mistakes to Avoid (Crucial for beginners!) */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
              <h4 className="text-sm font-extrabold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Типові помилки (чого уникати новачкові):
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {(guide?.commonMistakes || [
                  '❌ Занадто велика вага на шкоду амплітуді та безпеці суглобів.',
                  '❌ Різке скидання ваги замість підконтрольного негативного руху.',
                  '❌ Неправильне дихання (затримка подиху викликає спазм тиску).',
                ]).map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Beginner Guide */}
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-2.5">
              <h4 className="text-sm font-extrabold text-sky-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                Базові поради для початківців (Beginner Guide):
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {(guide?.beginnerTips || [
                  '🔰 Перші 2-3 тижні працюйте з помірною вагою на 10-12 повторень для закріплення зв\'язку «мозок-м\'яз».',
                  '🔰 Робіть розминочні підходи з легким обтяженням перед робочими сетами.',
                  '🔰 Якщо відчуваєте біль у зв\'язках чи суглобах — зупиніться та перевірте кут постановки кінцівок.',
                ]).map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Tips for Experienced Gymgoers */}
            <div className="p-4 rounded-2xl bg-purple-950/25 border border-purple-500/30 space-y-2.5">
              <h4 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Професійні тонкощі для досвідчених (Pro Level):
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {(guide?.proTips || [
                  '⚡ Застосовуйте метод «Rest-Pause» або дропсет в останньому підході для максимального рекрутування рухових одиниць.',
                  '⚡ Контролюйте темп 3-0-1-0: 3 секунди опускання дають на 40% більший мікронадрив саркомерів для росту.',
                  '⚡ Фіксуйте пікове скорочення на 1 секунду для подолання інерції.',
                ]).map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Закрити
          </Button>
        </div>
      </div>
    </Modal>
  )
}
