import type { Equipment } from '@/features/exercises/model'
import type { ActivityLevel, FitnessGoal, UserProfile } from '@/features/profile/model'
import { templateDays, type PlanTemplate } from '@/features/workoutPlan/model'
import type { Experience, OnboardingAnswers, TrainingPlace } from '../model/types'

type PlanGoal = PlanTemplate['goal']
type PlanLevel = PlanTemplate['level']

const GOAL: Record<FitnessGoal, PlanGoal> = {
  muscle_gain: 'muscle',
  fat_loss: 'fatLoss',
  strength: 'strength',
  endurance: 'general',
  general_health: 'general',
}

const LEVEL: Record<Experience, PlanLevel> = { none: 'beginner', underYear: 'beginner', overYear: 'intermediate' }
const LEVEL_ORDER: PlanLevel[] = ['beginner', 'intermediate', 'advanced']

function score(template: PlanTemplate, answers: OnboardingAnswers): number {
  let points = 0
  if (template.goal === GOAL[answers.goal]) points += 3
  const levelGap = Math.abs(LEVEL_ORDER.indexOf(template.level) - LEVEL_ORDER.indexOf(LEVEL[answers.experience]))
  if (levelGap === 0) points += 2
  else if (levelGap === 1) points += 1
  points += Math.max(0, 2 - Math.abs(templateDays(template).length - answers.days))
  if (answers.place === 'gym' && template.home) points -= 1
  return points
}

/** The three programs that fit the answers best; ties keep the library order. */
export function recommendTemplates(templates: PlanTemplate[], answers: OnboardingAnswers): PlanTemplate[] {
  return templates
    .filter((template) => answers.place === 'gym' || template.home)
    .map((template, index) => ({ template, index, points: score(template, answers) }))
    .sort((a, b) => b.points - a.points || a.index - b.index)
    .slice(0, 3)
    .map(({ template }) => template)
}

export function activityFor(days: number): ActivityLevel {
  if (days <= 2) return 'light'
  if (days <= 4) return 'moderate'
  return 'active'
}

/** An empty list means everything is available, as in "Моє обладнання". */
export function equipmentFor(place: TrainingPlace): Equipment[] {
  return place === 'home' ? ['dumbbell', 'bodyweight', 'bands'] : []
}

export function profileFromAnswers(profile: UserProfile, answers: OnboardingAnswers, now = new Date()): UserProfile {
  return {
    ...profile,
    gender: answers.gender,
    age: answers.age,
    heightCm: answers.heightCm,
    weightKg: answers.weightKg,
    targetWeightKg: answers.targetWeightKg,
    fitnessGoal: answers.goal,
    activityLevel: activityFor(answers.days),
    onboardedAt: now.toISOString(),
  }
}
