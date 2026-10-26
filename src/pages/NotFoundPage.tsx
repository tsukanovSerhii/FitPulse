import React from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Home } from 'lucide-react'
import { Button } from '@/components/common/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 rounded-3xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
        <Dumbbell className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-100 mb-2">404</h1>
      <p className="text-base text-slate-300 font-semibold mb-1">Сторінку не знайдено</p>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        Схоже, що ви шукаєте вправу чи сторінку, якої не існує. Поверніться на головну сторінку для продовження занять.
      </p>
      <Link to="/">
        <Button variant="primary" icon={<Home className="w-4 h-4" />}>
          На головну
        </Button>
      </Link>
    </div>
  )
}
