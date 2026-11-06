/**
 * Folds the spellings people actually type into one form: Ukrainian і/ї/є and Russian ы/э/ё match
 * и/е, apostrophes disappear and punctuation becomes spaces. "Жим лёжа" and "жим лежа" meet "лежачи".
 */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ʼ’'`]/g, '')
    .replace(/[ії]/g, 'и')
    .replace(/ы/g, 'и')
    .replace(/[єэё]/g, 'е')
    .replace(/ґ/g, 'г')
    .replace(/[^a-zа-я0-9]+/g, ' ')
    .trim()
}

/** Every word of the query starts some word of the text, in any order: "тяга верх" finds "Тяга верхнього блока". */
export function matchesSearch(text: string, query: string): boolean {
  const terms = normalizeSearch(query).split(' ').filter(Boolean)
  if (terms.length === 0) return true
  const words = normalizeSearch(text).split(' ')
  return terms.every((term) => words.some((word) => word.startsWith(term)))
}
