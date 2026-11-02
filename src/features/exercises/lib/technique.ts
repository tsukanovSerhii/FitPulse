import type { Exercise, ExerciseTechnique, TechniqueStep } from '../model/types'

export interface Timeline {
  total: number
  starts: number[]
}

export function buildTimeline(steps: TechniqueStep[]): Timeline {
  const starts: number[] = []
  let total = 0
  for (const step of steps) {
    starts.push(total)
    total += step.seconds
  }
  return { total, starts }
}

/** Which step is on screen `time` seconds into the loop, and how far through it. */
export function stepAt({ total, starts }: Timeline, time: number): { index: number; progress: number } {
  if (total <= 0 || starts.length === 0) return { index: 0, progress: 0 }
  const t = ((time % total) + total) % total
  let index = 0
  while (index + 1 < starts.length && starts[index + 1] <= t) index++
  const end = index + 1 < starts.length ? starts[index + 1] : total
  const length = end - starts[index]
  return { index, progress: length > 0 ? (t - starts[index]) / length : 0 }
}

export function getTechnique(exercise: Exercise): ExerciseTechnique {
  if (exercise.technique) return exercise.technique
  return {
    steps: exercise.instructions.map((step, i) => ({
      title: `Крок ${i + 1}`,
      text: step.description,
      frame: 0,
      seconds: 0,
    })),
    cues: exercise.tips,
    mistakes: exercise.guide?.commonMistakes ?? [],
    advanced: exercise.guide?.proTips,
  }
}
