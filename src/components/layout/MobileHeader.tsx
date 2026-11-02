import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { ThemeCycleButton } from '@/components/ui'
import { Avatar } from './Avatar'
import { Wordmark } from './Wordmark'

export function MobileHeader() {
  const profile = useAppSelector((state) => state.profile.profile)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-between px-5 sm:px-8">
        <Wordmark className="text-xl" />
        <div className="flex items-center gap-1">
          <ThemeCycleButton />
          <Link to="/profile" aria-label="Профіль" className="flex size-11 items-center justify-center">
            <Avatar name={profile.name} src={profile.avatarUrl} className="size-8" />
          </Link>
        </div>
      </div>
    </header>
  )
}
