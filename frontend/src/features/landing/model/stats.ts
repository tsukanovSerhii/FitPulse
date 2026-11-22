/** The numbers on the landing page; stats.test.ts checks them against the catalogs */
export const LANDING_STATS = {
  exercises: 115,
  programs: 19,
}

export const STATS = [
  { value: String(LANDING_STATS.exercises), label: 'вправ із фото-технікою та картою м’язів' },
  { value: String(LANDING_STATS.programs), label: 'готових програм від 2 до 6 днів на тиждень' },
  { value: '1', label: 'дотик, щоб записати підхід' },
  { value: '0 ₴', label: 'щоб почати тренуватися' },
]
