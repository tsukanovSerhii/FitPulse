import type { Exercise } from '../../model/types'

/** Strips the leading emoji marker from tips saved by older versions. */
export const stripMarker = (text: string) => text.replace(/^(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\u{FE0F}?\s*)+/u, '')

const FALLBACK = {
  commonMistakes: [
    'Занадто велика вага на шкоду амплітуді та безпеці суглобів.',
    'Різке скидання ваги замість підконтрольного негативного руху.',
    'Неправильне дихання (затримка подиху викликає спазм тиску).',
  ],
  beginnerTips: [
    "Перші 2-3 тижні працюйте з помірною вагою на 10-12 повторень для закріплення зв'язку «мозок-м'яз».",
    'Робіть розминочні підходи з легким обтяженням перед робочими сетами.',
    "Якщо відчуваєте біль у зв'язках чи суглобах — зупиніться та перевірте кут постановки кінцівок.",
  ],
  proTips: [
    'Застосовуйте метод «Rest-Pause» або дропсет в останньому підході для максимального рекрутування рухових одиниць.',
    'Контролюйте темп 3-0-1-0: повільне опускання дає більший стимул для росту.',
    'Фіксуйте пікове скорочення на 1 секунду для подолання інерції.',
  ],
}

export function guideTips(exercise: Exercise) {
  const guide = exercise.guide
  return {
    commonMistakes: (guide?.commonMistakes ?? FALLBACK.commonMistakes).map(stripMarker),
    beginnerTips: (guide?.beginnerTips ?? FALLBACK.beginnerTips).map(stripMarker),
    proTips: (guide?.proTips ?? FALLBACK.proTips).map(stripMarker),
  }
}
