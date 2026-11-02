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
import { Modal } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { MuscleMap } from '@/components/common/MuscleMap'
import { ExerciseMotionPlayer } from '@/components/common/ExerciseMotionPlayer'

/** Strips the leading emoji marker from tips saved by older versions. */
const stripMarker = (text: string) => text.replace(/^(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\u{FE0F}?\s*)+/u, '')

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

        <p className="text-xs sm:text-sm text-fg-muted leading-relaxed bg-surface-2 p-4 rounded-lg border border-line">
          {exercise.description}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-surface/80 rounded-md border border-line text-center">
            <span className="text-[10px] uppercase font-bold text-fg-muted block mb-0.5">
              Підходи
            </span>
            <span className="text-base font-extrabold text-fg flex items-center justify-center gap-1 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-accent" />
              {exercise.defaultSets} сети
            </span>
          </div>

          <div className="p-3 bg-surface/80 rounded-md border border-line text-center">
            <span className="text-[10px] uppercase font-bold text-fg-muted block mb-0.5">
              Повторення
            </span>
            <span className="text-base font-extrabold text-fg flex items-center justify-center gap-1 font-mono">
              <Dumbbell className="w-3.5 h-3.5 text-accent" />
              {exercise.defaultReps} повт
            </span>
          </div>

          <div className="p-3 bg-surface/80 rounded-md border border-line text-center">
            <span className="text-[10px] uppercase font-bold text-fg-muted block mb-0.5">
              Відпочинок
            </span>
            <span className="text-base font-extrabold text-fg flex items-center justify-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-accent" />
              {exercise.defaultRestSeconds}с
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-line pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('technique')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'technique'
                ? 'bg-accent-soft text-accent border border-accent/30'
                : 'text-fg-subtle hover:text-fg'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Техніка та анімація
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anatomy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'anatomy'
                ? 'bg-accent-soft text-accent border border-accent/30'
                : 'text-fg-subtle hover:text-fg'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Анатомія м'язів
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-accent-soft text-accent border border-accent/30'
                : 'text-fg-subtle hover:text-fg'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Новачкам vs Профі
          </button>
        </div>

        {activeTab === 'technique' && (
          <div className="space-y-5 animate-fade-in">
            <ExerciseMotionPlayer exercise={exercise} showTabSwitcher={false} />

            <div>
              <h4 className="text-sm font-bold text-fg mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Покрокова інструкція виконання:
              </h4>
              <div className="space-y-2">
                {exercise.instructions.map((step) => (
                  <div
                    key={step.step}
                    className="flex items-start gap-3 p-3 rounded-md bg-surface-2 border border-line text-xs text-fg-muted leading-relaxed"
                  >
                    <span className="w-6 h-6 rounded-lg bg-accent-soft text-accent border border-accent/30 font-bold flex items-center justify-center shrink-0">
                      {step.step}
                    </span>
                    <span className="pt-0.5">{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anatomy' && (
          <div className="space-y-4 animate-fade-in">
            <MuscleMap
              primaryMuscle={exercise.primaryMuscle}
              muscleGroups={exercise.muscleGroups}
            />

            {exercise.calories && (
              <div className="flex items-center gap-2 text-xs text-fg-muted bg-warning-soft border border-warning/20 p-3.5 rounded-md">
                <Flame className="w-4 h-4 text-warning shrink-0" />
                <span>
                  Енерговитрати: <strong>~{exercise.calories} ккал/хв</strong> високої інтенсивності.
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-lg bg-danger-soft border border-danger/30 space-y-2.5">
              <h4 className="text-sm font-extrabold text-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                Типові помилки (чого уникати новачкові):
              </h4>
              <ul className="space-y-2 text-xs text-fg">
                {(guide?.commonMistakes || [
                  'Занадто велика вага на шкоду амплітуді та безпеці суглобів.',
                  'Різке скидання ваги замість підконтрольного негативного руху.',
                  'Неправильне дихання (затримка подиху викликає спазм тиску).',
                ]).map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span>{stripMarker(m)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-accent-soft border border-accent/30 space-y-2.5">
              <h4 className="text-sm font-extrabold text-accent flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Базові поради для початківців (Beginner Guide):
              </h4>
              <ul className="space-y-2 text-xs text-fg">
                {(guide?.beginnerTips || [
                  'Перші 2-3 тижні працюйте з помірною вагою на 10-12 повторень для закріплення зв\'язку «мозок-м\'яз».',
                  'Робіть розминочні підходи з легким обтяженням перед робочими сетами.',
                  'Якщо відчуваєте біль у зв\'язках чи суглобах — зупиніться та перевірте кут постановки кінцівок.',
                ]).map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span>{stripMarker(t)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-warning-soft border border-warning/30 space-y-2.5">
              <h4 className="text-sm font-extrabold text-warning flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                Професійні тонкощі для досвідчених (Pro Level):
              </h4>
              <ul className="space-y-2 text-xs text-fg">
                {(guide?.proTips || [
                  'Застосовуйте метод «Rest-Pause» або дропсет в останньому підході для максимального рекрутування рухових одиниць.',
                  'Контролюйте темп 3-0-1-0: 3 секунди опускання дають на 40% більший мікронадрив саркомерів для росту.',
                  'Фіксуйте пікове скорочення на 1 секунду для подолання інерції.',
                ]).map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span>{stripMarker(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-line">
          <Button variant="secondary" onClick={onClose}>
            Закрити
          </Button>
        </div>
      </div>
    </Modal>
  )
}
