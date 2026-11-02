import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { Button, Input } from '@/shared/ui'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { PasswordField } from '@/features/auth/components/PasswordField'
import { validateRegistration, type FieldErrors } from '@/features/auth/lib/validation'
import { authErrorCleared, registerUser } from '@/features/auth/model/authSlice'
import type { RegistrationData } from '@/features/auth/model/types'
import { removeFromSession, SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { useSessionState } from '@/shared/storage/useSessionState'

type Form = RegistrationData

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((state) => state.auth)
  // Name and email survive a reload within the tab; the password never leaves memory.
  const [draft, setDraft] = useSessionState(SESSION_KEYS.REGISTER_DRAFT, { name: '', email: '' })
  const [password, setPassword] = useState('')
  const form: Form = { ...draft, password }
  const [errors, setErrors] = useState<FieldErrors<Form>>({})

  useEffect(() => {
    dispatch(authErrorCleared())
  }, [dispatch])

  const update = (field: keyof Form) => (value: string) => {
    if (field === 'password') setPassword(value)
    else setDraft((d) => ({ ...d, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateRegistration(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    dispatch(registerUser(form))
      .unwrap()
      .then(() => removeFromSession(SESSION_KEYS.REGISTER_DRAFT))
      .catch(() => {})
  }

  return (
    <AuthLayout
      title="Реєстрація"
      subtitle={
        <>
          Вже маєте акаунт?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
            Увійдіть
          </Link>
        </>
      }
    >
      <SEO title="Реєстрація" description="Створіть акаунт FitPulse безкоштовно." />
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <Input
          label="Ім'я"
          placeholder="Як до вас звертатися"
          autoComplete="name"
          value={form.name}
          onChange={(e) => update('name')(e.target.value)}
          error={errors.name}
        />
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
          placeholder="Щонайменше 8 символів, літери й цифри"
          autoComplete="new-password"
          showStrength
          value={form.password}
          onChange={(e) => update('password')(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" size="lg" className="w-full" isLoading={status === 'loading'}>
          Створити акаунт
        </Button>
        <p className="text-center text-xs text-fg-subtle">Тариф «Старт» безкоштовний. Картка не потрібна.</p>
      </form>
    </AuthLayout>
  )
}
