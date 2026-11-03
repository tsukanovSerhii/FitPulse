import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildTimeline, getTechnique, stepAt } from './technique'
import type { Exercise, TechniqueStep } from '../model/types'
import { INITIAL_EXERCISES } from '../api/seed'

const steps: TechniqueStep[] = [
  { title: 'Позиція', text: 'a', frame: 0, seconds: 1.5 },
  { title: 'Опускання', text: 'b', frame: 1, seconds: 3, breathing: 'inhale' },
  { title: 'Пауза', text: 'c', frame: 1, seconds: 1, breathing: 'hold' },
  { title: 'Жим', text: 'd', frame: 0, seconds: 1, breathing: 'exhale' },
]

const legacy = {
  id: 'custom-1',
  name: 'Моя вправа',
  muscleGroups: ['chest'],
  primaryMuscle: 'chest',
  difficulty: 'beginner',
  equipment: 'dumbbell',
  description: 'Опис',
  instructions: [
    { step: 1, description: 'Перший крок' },
    { step: 2, description: 'Другий крок' },
  ],
  tips: ['Порада'],
  defaultSets: 3,
  defaultReps: 10,
  defaultRestSeconds: 60,
} satisfies Exercise

describe('technique timeline', () => {
  it('sums step durations into one loop', () => {
    const timeline = buildTimeline(steps)
    expect(timeline.total).toBe(6.5)
    expect(timeline.starts).toEqual([0, 1.5, 4.5, 5.5])
  })

  it('finds the step and its progress at a moment of the loop', () => {
    const timeline = buildTimeline(steps)
    expect(stepAt(timeline, 0)).toEqual({ index: 0, progress: 0 })
    expect(stepAt(timeline, 3)).toEqual({ index: 1, progress: 0.5 })
    expect(stepAt(timeline, 5)).toEqual({ index: 2, progress: 0.5 })
  })

  it('wraps time past the end back to the start', () => {
    const timeline = buildTimeline(steps)
    expect(stepAt(timeline, 6.5 + 3)).toEqual({ index: 1, progress: 0.5 })
  })

  it('handles steps without duration', () => {
    const timeline = buildTimeline([{ title: 'x', text: 'y', frame: 0, seconds: 0 }])
    expect(timeline.total).toBe(0)
    expect(stepAt(timeline, 10)).toEqual({ index: 0, progress: 0 })
  })
})

describe('getTechnique', () => {
  it('returns curated technique as is', () => {
    const technique = { steps, cues: ['x'], mistakes: ['y'] }
    expect(getTechnique({ ...legacy, technique })).toBe(technique)
  })

  it('builds technique from legacy fields of custom exercises', () => {
    const technique = getTechnique({ ...legacy, guide: { commonMistakes: ['Помилка'], proTips: ['Про'] } })
    expect(technique.steps).toEqual([
      { title: 'Крок 1', text: 'Перший крок', frame: 0, seconds: 0 },
      { title: 'Крок 2', text: 'Другий крок', frame: 0, seconds: 0 },
    ])
    expect(technique.cues).toEqual(['Порада'])
    expect(technique.mistakes).toEqual(['Помилка'])
    expect(technique.advanced).toEqual(['Про'])
  })
})

describe('built-in exercise content', () => {
  it.each(INITIAL_EXERCISES.map((e) => [e.id, e] as const))('%s has complete technique and photos', (_, exercise) => {
    const technique = exercise.technique
    expect(technique).toBeDefined()
    expect(technique!.steps.length).toBeGreaterThanOrEqual(3)
    expect(technique!.steps.length).toBeLessThanOrEqual(4)
    expect(technique!.steps.every((s) => s.seconds > 0 && s.title && s.text)).toBe(true)
    expect(technique!.cues).toHaveLength(3)
    expect(technique!.mistakes).toHaveLength(3)
    for (const frame of exercise.frames ?? []) expect(existsSync(`public${frame}`)).toBe(true)
    expect(exercise.frames).toHaveLength(2)
  })
})
