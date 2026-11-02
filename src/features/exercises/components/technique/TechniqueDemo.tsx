import { Pause, Play } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { TechniqueStep } from '../../model/types'
import { BREATHING_LABELS } from './labels'

interface TechniqueDemoProps {
  name: string
  frames: [string, string]
  steps: TechniqueStep[]
  index: number
  progress: number
  playing: boolean
  onToggle: () => void
}

const smooth = (t: number) => t * t * (3 - 2 * t)

/** Photos switch quickly; a long fade would leave both frames ghosted on screen. */
const FADE_SECONDS = 0.6

export function TechniqueDemo({ name, frames, steps, index, progress, playing, onToggle }: TechniqueDemoProps) {
  const step = steps[index]
  const previous = steps[(index - 1 + steps.length) % steps.length]
  const fade = Math.min(1, (progress * step.seconds) / FADE_SECONDS)
  const secondOpacity = previous.frame + (step.frame - previous.frame) * smooth(fade)

  return (
    <figure className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface-2">
      <img src={frames[0]} alt={`${name}: початкове положення`} className="absolute inset-0 size-full object-cover" />
      <img
        src={frames[1]}
        alt={`${name}: кінцеве положення`}
        className="absolute inset-0 size-full object-cover"
        style={{ opacity: secondOpacity }}
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? 'Пауза' : 'Відтворити демонстрацію'}
        className="absolute right-3 top-3 flex size-10 cursor-pointer items-center justify-center rounded-full bg-scrim/60 text-on-photo backdrop-blur-sm transition-colors hover:bg-scrim/80"
      >
        {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4 translate-x-px fill-current" aria-hidden="true" />}
      </button>

      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-scrim/85 to-transparent px-4 pb-3 pt-10 text-on-photo">
        <div className="flex items-baseline justify-between gap-3 text-sm" aria-live="polite">
          <span className="font-semibold">
            <span className="font-mono text-on-photo/70">
              {index + 1}/{steps.length}
            </span>{' '}
            {step.title}
          </span>
          <span className="font-mono text-xs text-on-photo/80">
            {step.seconds}&nbsp;с{step.breathing && ` · ${BREATHING_LABELS[step.breathing]}`}
          </span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-on-photo/25">
              <span
                className={cn('block h-full bg-on-photo', i < index && 'w-full', i > index && 'w-0')}
                style={i === index ? { width: `${progress * 100}%` } : undefined}
              />
            </span>
          ))}
        </div>
      </figcaption>
    </figure>
  )
}
