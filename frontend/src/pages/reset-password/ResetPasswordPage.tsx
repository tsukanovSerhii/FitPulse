import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/app/store/hooks'
import { AuthLayout, PasswordField, resetPassword, validateNewPassword, type FieldErrors, type NewPasswordForm } from '@/features/auth'
import { SEO } from '@/shared/seo/SEO'
import { Button } from '@/shared/ui'
import { PAGE_META } from '../meta'

const linkClass = 'font-semibold text-accent hover:text-accent-hover'

export function ResetPasswordPage() {
  const dispatch = useAppDispatch()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  // Kept in state, then removed from the address bar and history so the one-time token is not
  // left behind on a shared device or sent to anything that reads the URL
  const [token] = useState(() => params.get('token'))
  useEffect(() => {
    if (params.has('token')) navigate('/reset-password', { replace: true })
  }, [params, navigate])
  const [form, setForm] = useState<NewPasswordForm>({ password: '', confirm: '' })
  const [errors, setErrors] = useState<FieldErrors<NewPasswordForm>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof NewPasswordForm) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validateNewPassword(form)
    setErrors(found)
    if (Object.keys(found).length > 0 || !token) return
    setStatus('saving')
    setError(null)
    const result = await dispatch(resetPassword({ token, password: form.password }))
    if (resetPassword.fulfilled.match(result)) setStatus('done')
    else {
      setStatus('idle')
      setError(result.payload ?? 'Щось пішло не так. Спробуйте ще раз')
    }
  }

  return (
    <AuthLayout
      title="Новий пароль"
      subtitle={
        <>
          Згадали пароль?{' '}
          <Link to="/login" className={linkClass}>
            Увійти
          </Link>
        </>
      }
    >
      <SEO {...PAGE_META.resetPassword} />
      {!token ? (
        <div className="space-y-3 text-sm">
          <p role="alert">Посилання недійсне або застаріло</p>
          <Link to="/forgot-password" className={linkClass}>
            Надіслати нове посилання
          </Link>
        </div>
      ) : status === 'done' ? (
        <div className="space-y-3 text-sm">
          <p role="status">Пароль змінено. Увійдіть з новим паролем.</p>
          <Link to="/login" className={linkClass}>
            Увійти
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && (
            <div role="alert" className="space-y-2 rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
              <p>{error}</p>
              <Link to="/forgot-password" className={linkClass}>
                Надіслати нове посилання
              </Link>
            </div>
          )}
          <PasswordField
            label="Новий пароль"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update('password')(e.target.value)}
            error={errors.password}
          />
          <PasswordField
            label="Повторіть пароль"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => update('confirm')(e.target.value)}
            error={errors.confirm}
          />
          <Button type="submit" size="lg" className="w-full" isLoading={status === 'saving'}>
            Зберегти пароль
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
