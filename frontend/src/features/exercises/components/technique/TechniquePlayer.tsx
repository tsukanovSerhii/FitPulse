import type { Exercise } from '../../model/types'
import { getTechnique } from '../../lib/technique'
import { StepList } from './StepList'
import { TechniqueDemo } from './TechniqueDemo'
import { useDemoLoop } from '../../hooks/useDemoLoop'

/** Photo demo synced with the step list; exercises without photos get a plain step list. */
export function TechniquePlayer({ exercise }: { exercise: Exercise }) {
  const { steps } = getTechnique(exercise)
  const demo = useDemoLoop(steps, Boolean(exercise.frames))

  return (
    <div className="space-y-4">
      {exercise.frames && demo.canPlay && (
        <TechniqueDemo
          name={exercise.name}
          frames={exercise.frames}
          steps={steps}
          index={demo.index}
          progress={demo.progress}
          playing={demo.playing}
          onToggle={demo.toggle}
        />
      )}
      {steps.length > 0 && <StepList steps={steps} active={demo.canPlay ? demo.index : undefined} onSelect={demo.canPlay ? demo.select : undefined} />}
    </div>
  )
}
