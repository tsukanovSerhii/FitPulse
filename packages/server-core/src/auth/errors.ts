import { ErrorCode } from '@fitpulse/contracts'

const DETAILS = {
  [ErrorCode.EmailTaken]: [409, 'Акаунт з таким email уже існує'],
  [ErrorCode.InvalidCredentials]: [401, 'Невірний email або пароль'],
  [ErrorCode.AccountBlocked]: [403, 'Акаунт заблоковано. Зверніться до підтримки'],
  [ErrorCode.AccountDisabled]: [403, 'Обліковий запис вимкнено'],
  [ErrorCode.Unauthorized]: [401, 'Потрібно увійти'],
  [ErrorCode.SessionExpired]: [401, 'Сесія завершилася. Увійдіть знову'],
  [ErrorCode.RefreshRetry]: [409, 'Сесію щойно оновлено. Повторіть запит'],
  [ErrorCode.ResetTokenInvalid]: [400, 'Посилання недійсне або застаріло'],
  [ErrorCode.RateLimited]: [429, 'Забагато спроб. Спробуйте пізніше'],
  [ErrorCode.Forbidden]: [403, 'Недостатньо прав для цієї дії'],
} as const

export type AuthErrorCode = keyof typeof DETAILS

/** An auth failure the shared error handler renders as { error: { code, message } }. */
export class AuthError extends Error {
  readonly statusCode: number
  readonly code: AuthErrorCode
  readonly retryAfter?: number

  constructor(code: AuthErrorCode, opts: { message?: string; retryAfter?: number } = {}) {
    const [status, message] = DETAILS[code]
    super(opts.message ?? message)
    this.name = 'AuthError'
    this.code = code
    this.statusCode = status
    this.retryAfter = opts.retryAfter
  }
}
