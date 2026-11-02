/**
 * Фото з Wikimedia Commons. Ліцензія CC BY 2.0 вимагає атрибуції —
 * вона відображається у футері (див. Footer).
 */
export interface Photo {
  src: string
  alt: string
  author: string
  license: string
  licenseUrl: string
  source: string
}

export const PHOTOS = {
  heroRunner: {
    src: '/images/hero-runner-tunnel.webp',
    alt: 'Силует бігуна в кінці темного тунелю',
    author: 'Giuseppe Milo',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    source:
      'https://commons.wikimedia.org/wiki/File:The_runner_-_Chicago,_United_States_-_Black_and_white_street_photography_(21083841669).jpg',
  },
  runnerShoreline: {
    src: '/images/runner-shoreline.webp',
    alt: 'Бігун на набережній на тлі хмарного неба',
    author: 'Giuseppe Milo',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    source:
      'https://commons.wikimedia.org/wiki/File:The_runner_-_Chicago,_United_States_-_Black_and_white_street_photography_(21326098570).jpg',
  },
  deadlift: {
    src: '/images/deadlift.webp',
    alt: 'Атлет виконує станову тягу зі штангою',
    author: 'Nenad Stojkovic',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    source: 'https://commons.wikimedia.org/wiki/File:Fit_young_man_doing_deadlift_exercise_in_gym.jpg',
  },
} satisfies Record<string, Photo>
