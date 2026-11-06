import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { Button, Checkbox, Input } from '@/shared/ui'
import { AuthLayout, PasswordField, validateLogin, type FieldErrors, authErrorCleared, loginUser, type Credentials } from '@/features/auth'
import { PAGE_META } from '../meta'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((state) => state.auth)
  const [form, setForm] = useState<Credentials>({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<FieldErrors<Credentials>>({})

  useEffect(() => {
    dispatch(authErrorCleared())
  }, [dispatch])

  const update = (field: keyof Credentials) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateLogin(form)
    setErrors(found)
    if (Object.keys(found).length === 0) dispatch(loginUser({ ...form, remember }))
  }

  return (
    <AuthLayout
      title="Вхід"
      subtitle={
        <>
          Немає акаунта?{' '}
          <Link to="/register" className="font-semibold text-accent hover:text-accent-hover">
            Зареєструйтеся
          </Link>
        </>
      }
    >
      <SEO {...PAGE_META.login} />
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <Input
          label="Email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={(e) => update('email')(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Пароль"
          placeholder="Ваш пароль"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => update('password')(e.target.value)}
          error={errors.password}
        />
        <Checkbox
          label="Запам'ятати мене"
          hint="Вимкніть на чужому пристрої: вихід відбудеться після закриття вкладки"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <Button type="submit" size="lg" className="w-full" isLoading={status === 'loading'}>
          Увійти
        </Button>
      </form>
    </AuthLayout>
  )
}
