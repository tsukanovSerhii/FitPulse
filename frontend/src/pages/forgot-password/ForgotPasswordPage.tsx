import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch } from '@/app/store/hooks'
import { AuthLayout, requestPasswordReset, validateForgot, type FieldErrors } from '@/features/auth'
import { SEO } from '@/shared/seo/SEO'
import { Button, Input } from '@/shared/ui'
import { PAGE_META } from '../meta'

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FieldErrors<{ email: string }>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validateForgot({ email })
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStatus('sending')
    setError(null)
    const result = await dispatch(requestPasswordReset(email.trim()))
    if (requestPasswordReset.fulfilled.match(result)) setStatus('sent')
    else {
      setStatus('idle')
      setError(result.payload ?? 'Щось пішло не так. Спробуйте ще раз')
    }
  }

  return (
    <AuthLayout
      title="Відновлення пароля"
      subtitle={
        <>
          Згадали пароль?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
            Увійти
          </Link>
        </>
      }
    >
      <SEO {...PAGE_META.forgotPassword} />
      {status === 'sent' ? (
        <p role="status" className="rounded-md border border-line bg-surface-2 px-4 py-3 text-sm">
          Якщо акаунт з таким email існує, ми надіслали лист із посиланням для нового пароля. Посилання діє одну годину.
        </p>
      ) : (
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors({})
            }}
            error={errors.email}
          />
          <Button type="submit" size="lg" className="w-full" isLoading={status === 'sending'}>
            Надіслати посилання
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
