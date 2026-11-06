import type { UserProfile } from '../model/types'

export interface BMIResult {
  bmi: number
  category: string
  color: string
  description: string
  healthyWeightMin: number
  healthyWeightMax: number
  dailyCalorieEstimate: number
}

export function calculateBMI(profile: UserProfile): BMIResult {
  const heightM = profile.heightCm / 100
  const bmi = Number((profile.weightKg / (heightM * heightM)).toFixed(1))

  let category = 'Нормальна вага'
  let color = 'text-success'
  let description = 'Ваша вага знаходиться в межах здорового діапазону. Продовжуйте тренування для підтримки форми.'

  if (bmi < 18.5) {
    category = 'Недостатня вага'
    color = 'text-warning'
    description = 'Рекомендується скоригувати раціон у бік профіциту калорій та збільшити силові навантаження.'
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Надлишкова вага'
    color = 'text-warning'
    description = 'Невеликий надлишок маси. Рекомендуються регулярні тренування та помірний дефіцит калорій.'
  } else if (bmi >= 30) {
    category = 'Ожиріння'
    color = 'text-danger'
    description = 'Підвищений ризик для здоров\'я. Проконсультуйтеся з лікарем та дотримуйтеся планомірних навантажень.'
  }

  const healthyWeightMin = Number((18.5 * heightM * heightM).toFixed(1))
  const healthyWeightMax = Number((24.9 * heightM * heightM).toFixed(1))

  // Basal metabolic rate, Mifflin-St Jeor
  let bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  if (profile.gender === 'male') {
    bmr += 5
  } else {
    bmr -= 161
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  }

  const multiplier = activityMultipliers[profile.activityLevel] || 1.4
  let tdee = bmr * multiplier

  if (profile.fitnessGoal === 'fat_loss') {
    tdee -= 400
  } else if (profile.fitnessGoal === 'muscle_gain') {
    tdee += 300
  }

  return {
    bmi,
    category,
    color,
    description,
    healthyWeightMin,
    healthyWeightMax,
    dailyCalorieEstimate: Math.round(tdee),
  }
}
