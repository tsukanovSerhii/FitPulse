import type { Exercise } from '../model/types'
import { ARMS } from './catalog/arms'
import { BACK } from './catalog/back'
import { CARDIO } from './catalog/cardio'
import { CHEST } from './catalog/chest'
import { CORE } from './catalog/core'
import { LEGS } from './catalog/legs'
import { SHOULDERS } from './catalog/shoulders'

export const INITIAL_EXERCISES: Exercise[] = [...CHEST, ...BACK, ...LEGS, ...SHOULDERS, ...ARMS, ...CORE, ...CARDIO]
