import { useState } from 'react'
import { Activity, Eye, Pause, Play, RotateCcw, Sparkles, User } from 'lucide-react'
import { Button, SegmentedControl, type SegmentOption } from '@/components/ui'
import type { Exercise } from '@/features/exercises/model/types'
import { AthleteRig } from '../athlete-rig/AthleteRig'
import { MuscleMap } from '../MuscleMap'
import { DEFAULT_PHASES, DEFAULT_TEMPO, FRAME_LABELS, getMovementPattern } from './movement'
import { PhaseDetails, Stage, StepPicker } from './parts'
import { useAutoAdvance } from './useAutoAdvance'

type Tab = 'photo' | 'motion' | 'anatomy'

export interface ExerciseMotionPlayerProps {
  exercise: Exercise
  initialTab?: Tab
  showTabSwitcher?: boolean
  className?: string
}

export function ExerciseMotionPlayer({ exercise, initialTab = 'photo', showTabSwitcher = true, className = '' }: ExerciseMotionPlayerProps) {
  const frames = exercise.animationFrames ?? []
  const hasFrames = frames.length > 0
  const phases = exercise.guide?.phases ?? DEFAULT_PHASES
  const tempo = exercise.guide?.tempo ?? DEFAULT_TEMPO

  const [tab, setTab] = useState<Tab>(hasFrames ? initialTab : 'motion')
  const [isPlaying, setIsPlaying] = useState(true)
  const [frameIndex, setFrameIndex] = useAutoAdvance(frames.length, 1500, isPlaying && tab === 'photo')
  const [phaseIndex, setPhaseIndex] = useAutoAdvance(phases.length, 2200, isPlaying && tab === 'motion')
  const phase = phases[phaseIndex] ?? phases[0]

  const tabs: SegmentOption<Tab>[] = [
    ...(hasFrames ? [{ value: 'photo' as const, label: <><Eye />Техніка</> }] : []),
    { value: 'motion', label: <><User />Біомеханіка</> },
    { value: 'anatomy', label: <><Activity />М'язи</> },
  ]

  const changeTab = (next: Tab) => {
    setTab(next)
    setIsPlaying(next !== 'anatomy')
  }

  const reset = () => {
    setIsPlaying(false)
    setFrameIndex(0)
    setPhaseIndex(0)
  }

  const pick = (setter: (i: number) => void) => (i: number) => {
    setIsPlaying(false)
    setter(i)
  }

  return (
    <div className={`space-y-4 rounded-lg border border-line bg-surface p-5 sm:p-6 ${className}`}>
      <div className="flex flex-col justify-between gap-3 border-b border-line pb-3 sm:flex-row sm:items-center">
        {showTabSwitcher ? (
          <SegmentedControl label="Режим перегляду" options={tabs} value={tab} onChange={changeTab} size="sm" />
        ) : (
          <p className="flex items-center gap-2 text-sm font-bold text-fg">
            <Sparkles className="size-4 text-accent" aria-hidden="true" />
            Правильна техніка виконання
          </p>
        )}

        {tab !== 'anatomy' && (
          <div className="flex items-center gap-2">
            <Button
              variant={isPlaying ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              icon={isPlaying ? <Pause /> : <Play className="fill-current" />}
            >
              {isPlaying ? 'Пауза' : 'Демонстрація'}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw />}>
              Скинути
            </Button>
          </div>
        )}
      </div>

      {tab === 'photo' && hasFrames && (
        <div className="animate-fade-in space-y-4">
          <Stage
            tempo={tempo}
            caption={
              <>
                <span className="text-fg-muted">
                  Кадр {frameIndex + 1} з {frames.length}:
                </span>
                <strong className="text-fg">{FRAME_LABELS[frameIndex]?.title ?? `Фаза ${frameIndex + 1}`}</strong>
              </>
            }
          >
            <img
              src={frames[frameIndex]}
              alt={`${exercise.name}, кадр ${frameIndex + 1}`}
              className="max-h-full max-w-full select-none rounded-md object-contain"
            />
          </Stage>
          <StepPicker
            className="grid-cols-2"
            steps={frames.map((_, i) => FRAME_LABELS[i] ?? { title: `Кадр ${i + 1}` })}
            active={frameIndex}
            onSelect={pick(setFrameIndex)}
          />
          <PhaseDetails phase={phase} tempo={tempo} />
        </div>
      )}

      {tab === 'motion' && (
        <div className="animate-fade-in space-y-4">
          <Stage
            tempo={tempo}
            caption={
              <>
                <span className="text-fg-muted">Фаза {phaseIndex + 1}:</span>
                <strong className="text-fg">{phase.name.split('(')[0]}</strong>
              </>
            }
          >
            <AthleteRig pattern={getMovementPattern(exercise)} phaseIndex={phaseIndex} />
          </Stage>
          <StepPicker
            className="grid-cols-2 sm:grid-cols-4"
            steps={phases.map((p) => ({ title: p.name.split('.')[1]?.trim() || p.name }))}
            active={phaseIndex}
            onSelect={pick(setPhaseIndex)}
          />
          <PhaseDetails phase={phase} tempo={tempo} />
        </div>
      )}

      {tab === 'anatomy' && (
        <div className="animate-fade-in">
          <MuscleMap primaryMuscle={exercise.primaryMuscle} muscleGroups={exercise.muscleGroups} />
        </div>
      )}
    </div>
  )
}
