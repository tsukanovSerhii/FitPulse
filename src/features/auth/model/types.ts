export type SubscriptionPlan = 'free' | 'pro' | 'team'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarSeed: string
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

export interface RegistrationData extends Credentials {
  name: string
  avatarSeed?: string
}

export interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}
