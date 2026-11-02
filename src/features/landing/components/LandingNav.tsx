import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { Wordmark } from '@/components/layout/Wordmark'
import { ThemeCycleButton, buttonClasses } from '@/components/ui'

const LINKS = [
  { href: '#features', label: 'Можливості' },
  { href: '#how', label: 'Як це працює' },
  { href: '#pricing', label: 'Тарифи' },
]

export function LandingNav() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Wordmark />
        <nav aria-label="Розділи сторінки" className="hidden gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-fg-muted transition-colors hover:text-fg">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeCycleButton />
          {user ? (
            <Link to="/" className={buttonClasses('primary', 'sm')}>
              Відкрити застосунок
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonClasses('ghost', 'sm', 'hidden sm:inline-flex')}>
                Увійти
              </Link>
              <Link to="/register" className={buttonClasses('primary', 'sm')}>
                Почати
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
