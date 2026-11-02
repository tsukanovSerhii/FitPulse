import type { ComponentType } from 'react'
import { BenchPressScene } from './scenes/BenchPressScene'
import { SquatScene } from './scenes/SquatScene'
import { DeadliftScene } from './scenes/DeadliftScene'
import { PullUpScene } from './scenes/PullUpScene'
import { OverheadPressScene } from './scenes/OverheadPressScene'
import { BicepCurlScene } from './scenes/BicepCurlScene'
import { RowScene } from './scenes/RowScene'
import { PushUpScene } from './scenes/PushUpScene'
import { PlankScene } from './scenes/PlankScene'
import { IsolationScene } from './scenes/IsolationScene'
import type { MovementPattern, SceneProps } from './types'

export type { MovementPattern } from './types'

const SCENES: Partial<Record<MovementPattern, ComponentType<SceneProps>>> = {
  bench_press: BenchPressScene,
  incline_bench_press: BenchPressScene,
  squat: SquatScene,
  deadlift: DeadliftScene,
  kettlebell_swing: DeadliftScene,
  pull_up: PullUpScene,
  hanging_leg_raise: PullUpScene,
  overhead_press: OverheadPressScene,
  bicep_curl: BicepCurlScene,
  row: RowScene,
  push_up: PushUpScene,
  dips: PushUpScene,
  plank: PlankScene,
}

export interface AthleteRigProps {
  pattern: MovementPattern
  phaseIndex: number
  className?: string
}

/** Animated mannequin for a movement pattern; one SVG scene per pattern family. */
export function AthleteRig({ pattern, phaseIndex, className = '' }: AthleteRigProps) {
  const Scene = SCENES[pattern] ?? IsolationScene
  return <Scene phase={Math.min(Math.max(phaseIndex, 0), 3)} className={className} />
}
