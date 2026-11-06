import type { SubscriptionPlan } from '@/features/subscription'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  plan: SubscriptionPlan
  createdAt: string
}

export interface StoredAccount extends AuthUser {
  passwordHash: string
  salt: string
}

export interface Credentials {
  email: string
  password: string
}

export interface LoginData extends Credentials {
  /** false keeps the session only for the current tab */
  remember: boolean
}

export interface RegistrationData extends Credentials {
  name: string
}

export interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}
