import { useEffect, useState } from 'react'
import { fetchApiHealth, type ApiStatus } from './api/health.ts'

const STATUS_TEXT: Record<ApiStatus | 'loading', string> = {
  loading: 'API: перевіряємо…',
  ok: 'API: працює',
  down: 'API: недоступне',
}

export function App({ fetchFn = fetch }: { fetchFn?: typeof fetch }) {
  const [status, setStatus] = useState<ApiStatus | 'loading'>('loading')

  useEffect(() => {
    let active = true
    fetchApiHealth(fetchFn).then((result) => {
      if (active) setStatus(result)
    })
    return () => {
      active = false
    }
  }, [fetchFn])

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6 font-sans">
      <h1 className="text-3xl font-bold">FitPulse Admin</h1>
      <p className="text-gray-600">Вхід для менеджерів і адміністраторів з'явиться на наступному етапі</p>
      <p role="status" className={status === 'down' ? 'text-red-600' : 'text-gray-900'}>
        {STATUS_TEXT[status]}
      </p>
    </main>
  )
}
