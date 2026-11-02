export type MovementPattern =
  | 'bench_press'
  | 'incline_bench_press'
  | 'squat'
  | 'deadlift'
  | 'pull_up'
  | 'overhead_press'
  | 'row'
  | 'push_up'
  | 'dips'
  | 'bicep_curl'
  | 'tricep_pushdown'
  | 'lunge'
  | 'plank'
  | 'hanging_leg_raise'
  | 'lateral_raise'
  | 'calf_raise'
  | 'cardio_run'
  | 'kettlebell_swing'

export interface SceneProps {
  phase: number
  className?: string
}
