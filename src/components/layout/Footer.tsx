import { PHOTOS } from '@/shared/config/photos'

const currentYear = new Date().getFullYear()

const photoAuthors = Object.values(PHOTOS).reduce<Record<string, string>>((acc, photo) => {
  acc[photo.author] ??= photo.source
  return acc
}, {})

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span>
          <span className="font-display text-sm uppercase tracking-wide text-fg">FitPulse</span> © {currentYear}
        </span>
        <span>
          Фото:{' '}
          {Object.entries(photoAuthors).map(([author, source], i) => (
            <span key={author}>
              {i > 0 && ', '}
              <a href={source} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-fg hover:underline">
                {author}
              </a>
            </span>
          ))}{' '}
          · Wikimedia Commons ·{' '}
          <a
            href="https://creativecommons.org/licenses/by/2.0"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:text-fg hover:underline"
          >
            CC BY 2.0
          </a>
        </span>
      </div>
    </footer>
  )
}
