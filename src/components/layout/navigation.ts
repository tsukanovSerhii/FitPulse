import { Calendar, Dumbbell, Home, TrendingUp, User, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Головна', path: '/', icon: Home },
  { label: 'Вправи', path: '/exercises', icon: Dumbbell },
  { label: 'Програми', path: '/plans', icon: Calendar },
  { label: 'Прогрес', path: '/progress', icon: TrendingUp },
  { label: 'Профіль', path: '/profile', icon: User },
]
