import type { UserProfile } from '@/features/profile/model/types'

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
  let color = 'text-emerald-400'
  let description = 'Ваша вага знаходиться в межах здорового діапазону. Продовжуйте тренування для підтримки форми.'

  if (bmi < 18.5) {
    category = 'Недостатня вага'
    color = 'text-amber-400'
    description = 'Рекомендується скоригувати раціон у бік профіциту калорій та збільшити силові навантаження.'
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Надлишкова вага'
    color = 'text-amber-400'
    description = 'Невеликий надлишок маси. Рекомендуються регулярні тренування та помірний дефіцит калорій.'
  } else if (bmi >= 30) {
    category = 'Ожиріння'
    color = 'text-rose-500'
    description = 'Підвищений ризик для здоров\'я. Проконсультуйтеся з лікарем та дотримуйтеся планомірних навантажень.'
  }

  const healthyWeightMin = Number((18.5 * heightM * heightM).toFixed(1))
  const healthyWeightMax = Number((24.9 * heightM * heightM).toFixed(1))

  // Базовий метаболізм (BMR за формулою Міффліна-Сан Жеора)
  let bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  if (profile.gender === 'male') {
    bmr += 5
  } else {
    bmr -= 161
  }

  // Коефіцієнт активності
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  }

  const multiplier = activityMultipliers[profile.activityLevel] || 1.4
  let tdee = bmr * multiplier

  // Коригування залежно від мети
  if (profile.fitnessGoal === 'fat_loss') {
    tdee -= 400 // помірний дефіцит
  } else if (profile.fitnessGoal === 'muscle_gain') {
    tdee += 300 // помірний профіцит
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
