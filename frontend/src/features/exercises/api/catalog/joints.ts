import type { Joint } from '../../model/types'

/**
 * Joints an exercise loads noticeably. With a joint marked as one to protect, the catalog hides these
 * exercises and replacements skip them; everything not listed is considered gentle on all three.
 */
export const JOINT_STRESS: Record<string, Joint[]> = {
  // Knees: deep knee bend under load, jumps, lockout of the knee
  'ex-barbell-squat': ['knees', 'back'],
  'ex-front-squat': ['knees', 'back'],
  'ex-smith-squat': ['knees'],
  'ex-hack-squat': ['knees'],
  'ex-goblet-squat': ['knees'],
  'ex-leg-press': ['knees'],
  'ex-leg-extension': ['knees'],
  'ex-dumbbell-lunges': ['knees'],
  'ex-barbell-lunge': ['knees', 'back'],
  'ex-walking-lunge': ['knees'],
  'ex-split-squat': ['knees'],
  'ex-step-ups': ['knees'],
  'ex-box-jump': ['knees'],
  'ex-jump-rope': ['knees'],
  'ex-stair-climber': ['knees'],
  'ex-hiit-treadmill': ['knees'],
  // Lower back: hinging or bending with a heavy bar, or the spine loaded standing
  'ex-deadlift': ['back'],
  'ex-sumo-deadlift': ['back'],
  'ex-rack-pull': ['back'],
  'ex-trap-bar-deadlift': ['back'],
  'ex-romanian-deadlift': ['back'],
  'ex-stiff-leg-dumbbell-deadlift': ['back'],
  'ex-good-morning': ['back'],
  'ex-barbell-row': ['back'],
  'ex-reverse-grip-row': ['back'],
  'ex-two-dumbbell-row': ['back'],
  'ex-t-bar-row': ['back'],
  'ex-hyperextension': ['back'],
  'ex-kettlebell-swing': ['back'],
  'ex-farmers-walk': ['back'],
  'ex-barbell-shrug': ['back'],
  // Shoulders: deep pressing, pressing overhead, dips and the upright row
  'ex-bench-press': ['shoulders'],
  'ex-smith-bench-press': ['shoulders'],
  'ex-incline-barbell-press': ['shoulders'],
  'ex-smith-incline-press': ['shoulders'],
  'ex-decline-bench-press': ['shoulders'],
  'ex-close-grip-bench-press': ['shoulders'],
  'ex-dips': ['shoulders'],
  'ex-bench-dips': ['shoulders'],
  'ex-overhead-press': ['shoulders', 'back'],
  'ex-seated-barbell-press': ['shoulders'],
  'ex-push-press': ['shoulders', 'back'],
  'ex-arnold-press': ['shoulders'],
  'ex-upright-row': ['shoulders'],
  'ex-dumbbell-pullover': ['shoulders'],
  'ex-dumbbell-fly': ['shoulders'],
  'ex-incline-dumbbell-fly': ['shoulders'],
}
