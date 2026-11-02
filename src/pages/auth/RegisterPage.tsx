import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Shuffle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { SEO } from '@/components/common/SEO'
import { Avatar } from '@/components/layout/Avatar'
import { Button, Input } from '@/components/ui'
import { randomSeed } from '@/features/auth/api/authApi'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { PasswordField } from '@/features/auth/components/PasswordField'
import { validateRegistration, type FieldErrors } from '@/features/auth/lib/validation'
import { authErrorCleared, registerUser } from '@/features/auth/model/authSlice'
import type { RegistrationData } from '@/features/auth/model/types'

type Form = Omit<RegistrationData, 'avatarSeed'>

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((state) => state.auth)
  const [form, setForm] = useState<Form>({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors<Form>>({})
  const [avatarSeed, setAvatarSeed] = useState(randomSeed)

  useEffect(() => {
    dispatch(authErrorCleared())
  }, [dispatch])

  const update = (field: keyof Form) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateRegistration(form)
    setErrors(found)
    if (Object.keys(found).length === 0) dispatch(registerUser({ ...form, avatarSeed }))
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
        <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3">
          <Avatar seed={avatarSeed} name={form.name} className="size-14" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">{form.name.trim() || 'Ваша аватарка'}</p>
            <p className="text-xs text-fg-subtle">Згенерована випадково</p>
          </div>
          <Button type="button" variant="ghost" size="sm" icon={<Shuffle />} onClick={() => setAvatarSeed(randomSeed())}>
            Інша
          </Button>
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <Input
          label="Ім'я"
          autoComplete="name"
          value={form.name}
          onChange={(e) => update('name')(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={(e) => update('email')(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Пароль"
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
