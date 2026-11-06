import { useState, type FormEvent } from 'react'

export function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSubmit(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Щось пішло не так')
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-md border border-gray-300 px-3 py-2'
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="block space-y-1">
        <span className="text-sm font-medium">Email</span>
        <input className={field} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Пароль</span>
        <input className={field} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <button type="submit" disabled={busy} className="w-full rounded-md bg-gray-900 px-4 py-2 font-semibold text-white disabled:opacity-60">
        Увійти
      </button>
    </form>
  )
}
