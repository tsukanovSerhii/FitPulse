# Accounts and JWT (Stage 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Server accounts with JWT for the app and the admin panel, password reset by email, and the app moving from browser-only accounts to the server without losing local data or offline start.

**Architecture:** Auth logic (passwords, JWT, refresh sessions, rate limits, mailer) lives in `@fitpulse/server-core` behind small repository interfaces; each backend wires its own Prisma tables and routes. The app's `features/auth/api` switches to an HTTP client that keeps the access token in memory and refreshes it through the `fp_refresh` cookie; local accounts are adopted on first sign-in.

**Tech Stack:** Fastify 5, `@fastify/cookie`, `jose` (HS256), argon2, ioredis, Prisma 7, nodemailer (SMTP to Mailpit), Resend HTTP API via `fetch`, React 19 + Redux Toolkit, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-06-accounts-auth-design.md`

## Global Constraints

- Contracts in `@fitpulse/contracts` are the single source for request/response shapes: name 2–60 chars trimmed, email trimmed + lowercased, password ≥ 8 chars (`MIN_PASSWORD_LENGTH = 8`), `remember: boolean`.
- `user` = `{ id, name, email, plan: 'free' | 'pro', createdAt }`; admin `user` adds `role: 'manager' | 'admin'`.
- Error codes and statuses exactly as the spec table: `EMAIL_TAKEN` 409, `INVALID_CREDENTIALS` 401, `ACCOUNT_BLOCKED` 403, `ACCOUNT_DISABLED` 403, `UNAUTHORIZED` 401, `SESSION_EXPIRED` 401, `REFRESH_RETRY` 409, `RESET_TOKEN_INVALID` 400, `RATE_LIMITED` 429 + `Retry-After`. Messages in Ukrainian: «Акаунт з таким email уже існує», «Невірний email або пароль».
- Access JWT HS256 via `jose`, 900 s, claims `sub`, `sid`, admin also `role`; app signs with `JWT_SECRET`, admin with `ADMIN_JWT_SECRET`.
- Refresh token: 32 random bytes base64url; DB stores SHA-256 hex. Cookie `fp_refresh` (admin `fp_admin_refresh`), `httpOnly`, `SameSite=Lax`, `Path=/api/auth`, `Secure` when `NODE_ENV=production`; `remember` → `Max-Age` 30 days, else no `Max-Age`.
- Session lifetimes: remember 30 d (extended on each refresh), not remember 12 h (extended), admin 8 h (not extended). Rotation grace 10 000 ms → `REFRESH_RETRY`; after grace → revoke session + `SESSION_EXPIRED`.
- Revoked `sid` kept in Redis key `auth:revoked:<sid>` for 900 s. Redis errors in rate limiting or revocation checks never block a request (log `warn`).
- Rate limits (fixed window, Redis `INCR` + `EXPIRE`): login 5/60 s per `ip+email` and 20/60 s per ip; register 5/3600 s per ip; forgot 3/3600 s per email and 10/3600 s per ip; refresh 60/60 s per ip. `RATE_LIMIT_ENABLED=false` disables them (dev compose, CI e2e).
- Auth endpoints accept only `application/json` bodies (Fastify default) — refresh/logout send `{}`.
- Both backends set `trustProxy: true`. nginx sends `X-Forwarded-Proto $http_x_forwarded_proto`.
- New env (api): `MAIL_PROVIDER` (`resend` | `smtp` | `log`, default `log`), `MAIL_FROM` (default `FitPulse <no-reply@fitpulse.app>`), `RESEND_API_KEY` (required when `resend`), `SMTP_URL` (required when `smtp`), `APP_URL` (default `http://localhost:5173`), `RATE_LIMIT_ENABLED` (default `true`). Admin: `RATE_LIMIT_ENABLED`.
- Frontend storage: `STORAGE_KEYS.SESSION` / `SESSION_KEYS.AUTH_SESSION` keep holding the signed-in user id (now the server id); new `STORAGE_KEYS.AUTH_USER = 'fitpulse_auth_user_v1'` and `SESSION_KEYS.AUTH_USER_TAB = 'fitpulse_auth_user_tab_v1'` cache the last known user; new per-user `STORAGE_KEYS.AVATAR = 'fitpulse_avatar_v1'` in `USER_KEYS`. `fitpulse_accounts_v1` is only read (and pruned) for adoption.
- Every integration test runs against `fitpulse_test` with Postgres and Redis (CI `integration` job); the machine has no Docker — integration and e2e are verified in CI.

## Review Focus

1. Two tabs refreshing at the same moment → neither tab is signed out. Test: Task 5 `parallel refresh within grace returns REFRESH_RETRY and keeps the session`; Task 8 `refresh is single-flight across calls`.
2. Phone offline when the app starts → user stays signed in with cached data. Test: Task 8 `restore keeps the cached user on network error`.
3. Old local account whose email already exists on the server with another password → no data loss, generic error. Test: Task 9 `EMAIL_TAKEN during adoption keeps local data and reports invalid credentials`.
4. Redis down → login and refresh still work. Test: Task 3 `rate limit allows the request when Redis fails`, Task 3 `authenticate allows when the revocation check fails`.
5. Password reset email for an unknown address or a mail provider failure → same 204, no leak. Test: Task 6 `forgot for unknown email returns 204 without mail` and `mailer failure still returns 204`.

---

### Task 1: Auth contracts

**Files:** Create `packages/contracts/src/auth.ts`; modify `packages/contracts/src/errors.ts`, `src/index.ts`, `package.json` (declare `zod` dependency, add `test` script + vitest dev dep, `vitest.config.ts`). Test: `packages/contracts/test/auth.test.ts`.

**Interfaces — Produces:**
- `MIN_PASSWORD_LENGTH = 8`; `emailSchema` (trim, lowercase, `z.email()`), `passwordSchema` (min 8, max 128), `nameSchema` (trim, 2–60).
- `registerRequestSchema { name, email, password, remember }`, `loginRequestSchema { email, password: z.string().min(1), remember }`, `forgotPasswordRequestSchema { email }`, `resetPasswordRequestSchema { token: z.string().min(1), password }`, `updateMeRequestSchema { name?, email?, currentPassword? }`.
- `userSchema { id: uuid, name, email, plan: enum('free','pro'), createdAt: iso string }`, `adminUserSchema` = `{ id, email, role: enum('manager','admin'), createdAt }`, `authResponseSchema { accessToken, user }`, `adminAuthResponseSchema { accessToken, user: adminUserSchema }`, and `z.infer` types `User`, `AdminUser`, `RegisterRequest`, `LoginRequest`, …
- `ErrorCode` gains `EmailTaken`, `InvalidCredentials`, `AccountBlocked`, `AccountDisabled`, `Unauthorized`, `SessionExpired`, `RefreshRetry`, `ResetTokenInvalid`, `RateLimited` with the spec's string values.

- [ ] Step 1: tests `email is trimmed and lowercased` (`' Ira@Mail.COM '` → `'ira@mail.com'`), `password shorter than 8 is rejected`, `name is trimmed and needs 2 chars`, `login accepts any non-empty password` (old local passwords are not re-validated), `updateMe allows name only`.
- [ ] Step 2: run `npm test -w @fitpulse/contracts` → FAIL (module missing).
- [ ] Step 3: implement; run → PASS; `npm run build -w @fitpulse/contracts`.
- [ ] Step 4: commit `feat(contracts): auth request, response and error schemas shared by apps and APIs`.

### Task 2: Database migration and shared password hashing

**Files:** Modify `packages/db/prisma/schema.prisma`; create migration `packages/db/prisma/migrations/20261107000000_auth/migration.sql`; move argon2 to `packages/server-core/src/passwords.ts`; modify `packages/db/src/seed-admin.ts` to accept a `hash: (password) => Promise<string>` argument; modify `packages/db/prisma/seed.ts`. Test: extend `packages/db/test/schema.int.test.ts`, `seed-admin.int.test.ts`; create `packages/server-core/test/passwords.test.ts`.

**Interfaces — Produces:**
- Prisma: `User.name String`, `User.plan Plan @default(FREE)` (`enum Plan { FREE PRO }`, mapped `plan`); `Session`/`AdminSession`: `refreshTokenHash @unique`, `previousTokenHash String?` (indexed), `rotatedAt DateTime?`, `remember Boolean @default(false)`; `PasswordResetToken { id, userId → User cascade, tokenHash @unique, expiresAt, usedAt?, createdAt }` mapped `password_reset_tokens`.
- `hashPassword(password: string): Promise<string>`, `verifyPassword(hash: string, password: string): Promise<boolean>` (argon2id; returns false on malformed hash) exported from `@fitpulse/server-core`.
- `seedAdmin(prisma, { email, password }, hash): Promise<{ created: boolean }>`.
- Migration adds `name` with a temporary default `''` for existing rows, then drops the default (no existing users in production yet).

- [ ] Step 1: tests — `verifyPassword accepts the right password and rejects others`, `verifyPassword returns false for a malformed hash`; integration `password reset tokens are deleted with the user`, `refresh token hashes are unique`.
- [ ] Step 2: run unit → FAIL.
- [ ] Step 3: implement; generate migration with `prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` (CI shadow DB) or hand-write matching SQL, then `prisma migrate diff ... --exit-code` must report no drift in CI.
- [ ] Step 4: unit PASS, `npm run build -w @fitpulse/db -w @fitpulse/server-core`; commit `feat(db): names, plans, rotating sessions and password reset tokens`.

### Task 3: Auth kit in server-core (tokens, sessions, rate limits, authenticate)

**Files:** Create in `packages/server-core/src/auth/`: `tokens.ts`, `refresh-token.ts`, `sessions.ts`, `rate-limit.ts`, `authenticate.ts`, `cookies.ts`, `index.ts`; modify `src/service.ts` (register `@fastify/cookie`, `trustProxy: true` via `createBaseApp`), `src/app.ts`, `src/index.ts`. Tests: `packages/server-core/test/auth/*.test.ts` (unit, fake repo + fake Redis object), `test/auth/rate-limit.int.test.ts` (real Redis).

**Interfaces — Produces:**
- `createAccessTokens(secret: string, ttlSeconds = 900)` → `{ sign(claims: { sub: string; sid: string; role?: string }): Promise<string>; verify(token: string): Promise<{ sub: string; sid: string; role?: string }> }` (throws `AuthError('UNAUTHORIZED')`).
- `class AuthError extends Error { code: ErrorCode; status: number }` — the error handler renders it as `{ error: { code, message } }` and sets `Retry-After` when `retryAfter` is set.
- `newRefreshToken(): string`, `hashToken(token: string): string` (sha256 hex).
- `interface SessionRecord { id; accountId; expiresAt: Date; revokedAt: Date | null; remember: boolean; previousTokenHash: string | null; rotatedAt: Date | null }`
- `interface SessionRepo { create(d: { accountId; refreshTokenHash; expiresAt; remember; userAgent?: string }): Promise<{ id: string }>; findByTokenHash(h): Promise<SessionRecord | null>; findByPreviousHash(h): Promise<SessionRecord | null>; rotate(id, d: { refreshTokenHash; previousTokenHash; rotatedAt; expiresAt }): Promise<void>; revoke(id): Promise<void>; revokeAllForAccount(accountId): Promise<string[]> }`
- `createSessionService({ repo, redis, lifetimes: { remember: ms; short: ms }, extendOnRefresh: boolean, graceMs = 10_000, now = () => new Date() })` → `{ start(accountId, { remember, userAgent }): Promise<{ sessionId; refreshToken; remember }>; refresh(token): Promise<{ sessionId; accountId; refreshToken; remember }>; revoke(sessionId): Promise<void>; revokeAll(accountId): Promise<void> }`; `refresh` throws `AuthError('SESSION_EXPIRED')` / `AuthError('REFRESH_RETRY')`; revocations also `SET auth:revoked:<sid> 1 EX 900`.
- `rateLimit(redis, { key: string; limit: number; windowSeconds: number; enabled: boolean; log }): Promise<void>` throws `AuthError('RATE_LIMITED')` with `retryAfter` = key TTL.
- `authenticate(tokens, redis, log)` → Fastify `preHandler` setting `request.auth: { accountId; sessionId; role?: string }` (declaration-merged type); missing/invalid token or revoked sid → `UNAUTHORIZED`.
- `setRefreshCookie(reply, name, token, { remember, secure })`, `clearRefreshCookie(reply, name, secure)`, `readRefreshCookie(request, name): string | undefined`; constants `REMEMBER_MS = 30 days`, `SHORT_MS = 12 h`, `ADMIN_MS = 8 h`.

- [ ] Step 1: unit tests — `signed token verifies with the same secret only`, `expired token is rejected` (ttl 1 s, fake time via `jose` `currentDate`/`setIssuedAt` or wait), `start stores only the token hash`, `refresh rotates the token and extends a remember session`, `admin refresh keeps the original expiry`, `parallel refresh within grace returns REFRESH_RETRY and keeps the session`, `reused token after grace revokes the session`, `expired or revoked session is SESSION_EXPIRED`, `rate limit allows the request when Redis fails`, `authenticate rejects a revoked session`, `authenticate allows when the revocation check fails`, `cookie has httpOnly, SameSite=Lax, Path=/api/auth and Max-Age only when remembered`; integration `sixth attempt in the window is RATE_LIMITED with Retry-After`.
- [ ] Step 2: run → FAIL; implement; run `npm test -w @fitpulse/server-core` → PASS.
- [ ] Step 3: commit `feat(api): JWT, rotating refresh sessions, rate limits and auth hook in server-core`.

### Task 4: Mailer

**Files:** Create `packages/server-core/src/mail/{mailer.ts,resend.ts,smtp.ts,log.ts,index.ts}`; add `nodemailer` dep. Test: `packages/server-core/test/mail.test.ts`.

**Interfaces — Produces:**
- `interface Mailer { send(m: { to: string; subject: string; text: string; html: string }): Promise<void> }`
- `createMailer(config: { MAIL_PROVIDER; MAIL_FROM; RESEND_API_KEY?; SMTP_URL? }, deps: { fetchFn?: typeof fetch; log }): Mailer`.
- `mailEnvSchema` (Zod) with the env rules from Global Constraints, `superRefine` requiring `RESEND_API_KEY` for `resend` and `SMTP_URL` for `smtp`.
- Resend: `POST https://api.resend.com/emails`, `Authorization: Bearer <key>`, JSON `{ from, to: [to], subject, text, html }`; non-2xx → throws with status.

- [ ] Step 1: tests — `resend posts the message with the API key` (stub fetch, assert URL, headers, body), `resend throws on a non-2xx answer`, `log mailer writes subject and recipient`, `config requires RESEND_API_KEY for resend`.
- [ ] Step 2: FAIL → implement → PASS. Commit `feat(api): Mailer with Resend, SMTP for Mailpit and a log fallback`.

### Task 5: App auth routes (register, login, refresh, logout, me)

**Files:** Create `backend/src/auth/{routes.ts,users.ts,session-repo.ts}`, `backend/src/me/routes.ts`; modify `backend/src/config.ts` (mail + rate-limit env merged from `mailEnvSchema`), `backend/src/app.ts` (register routes, pass `prisma` as full `PrismaClient` — widen `AppDeps.prisma` to `PrismaClient`), `backend/src/server.ts`, `backend/test/app.test.ts` stubs. Tests: `backend/test/auth.int.test.ts`, `backend/test/me.int.test.ts`, shared `backend/test/helpers.ts` (`buildTestApp()` with real Prisma/Redis, `LogMailer` capturing sent messages in an array, `RATE_LIMIT_ENABLED` true, truncate tables + `FLUSHDB` between tests).

**Interfaces:**
- Consumes: Task 1 schemas, Task 3 kit, Task 4 `Mailer`.
- Produces: `toUserDto(user: PrismaUser): User` (plan lower-cased, `createdAt.toISOString()`); `createUserSessionRepo(prisma): SessionRepo`; `buildApp({ config, prisma, redis, mailer? })` (mailer defaults to `createMailer(config)`).
- Behavior per spec tables; login runs `verifyPassword` against a fixed dummy argon2 hash when the email is unknown (same timing); blocked users → 403 after a correct password; `remember` from body; `userAgent` from header (trimmed to 255).
- `PATCH /api/me`: name change; email change requires `currentPassword` (missing → 400 `VALIDATION_ERROR`, wrong → 401 `INVALID_CREDENTIALS`, taken → 409 `EMAIL_TAKEN`).

- [ ] Step 1: integration tests from the spec's backend list (register, case-insensitive 409, login ok / wrong / unknown same body, blocked 403, refresh rotates cookie, `parallel refresh within grace returns REFRESH_RETRY and keeps the session` over HTTP, reuse after grace (fake `now` injected through `buildApp` option `now`) → 401, logout then refresh 401 and old access token 401, sixth login 429 with `Retry-After`, `me` with/without token, PATCH cases, `cookie is Secure in production`).
- [ ] Step 2: run in CI-equivalent env (`DATABASE_URL`, `REDIS_URL`) → FAIL; implement; → PASS. Unit `npm test -w @fitpulse/api` still PASS.
- [ ] Step 3: commit `feat(api): register, login, refresh, logout and profile endpoints`.

### Task 6: Password reset

**Files:** Create `backend/src/auth/password-reset.ts`, `backend/src/auth/emails.ts`. Test: `backend/test/password-reset.int.test.ts`.

**Interfaces — Produces:** `resetPasswordEmail({ name, link }): { subject: 'Відновлення пароля FitPulse'; text; html }`; routes `POST /api/auth/password/forgot` and `/reset` per spec; token = `newRefreshToken()`, stored hashed, `expiresAt = now + 1 h`; new request marks older unused tokens used; reset hashes the new password, marks token used, `sessions.revokeAll(userId)`.

- [ ] Step 1: tests — `forgot sends a link to APP_URL/reset-password with a token`, `forgot for unknown email returns 204 without mail`, `mailer failure still returns 204`, `reset sets the new password and revokes every session`, `reset token works once`, `expired reset token is RESET_TOKEN_INVALID`, `a newer request invalidates the older link`, `fourth forgot for one email in an hour is RATE_LIMITED`.
- [ ] Step 2: FAIL → implement → PASS. Commit `feat(api): password reset by email`.

### Task 7: Admin auth

**Files:** Create `backend-AdminPanel/src/auth/{routes.ts,admins.ts,session-repo.ts}`, `backend-AdminPanel/src/me/routes.ts`; modify config/app/server like Task 5. Test: `backend-AdminPanel/test/auth.int.test.ts`.

**Interfaces — Produces:** `toAdminDto(admin): AdminUser` (role lower-cased); cookie `fp_admin_refresh`; lifetime `ADMIN_MS` without extension; JWT `role`.

- [ ] Step 1: tests — `admin and manager sign in with their role in the token`, `disabled admin is ACCOUNT_DISABLED`, `admin session is not extended by refresh`, `app access token is rejected by the admin API` (sign with `JWT_SECRET`), `logout revokes the admin session`.
- [ ] Step 2: FAIL → implement → PASS. Commit `feat(admin-api): staff sign-in with roles and 8-hour sessions`.

### Task 8: App HTTP client, server-backed authApi and offline restore

**Files:** Create `frontend/src/shared/api/http.ts` (+ `http.test.ts`); rewrite `frontend/src/features/auth/api/authApi.ts` (+ `authApi.test.ts`); modify `features/auth/model/authSlice.ts`, `model/types.ts` (drop `StoredAccount` from public types, keep it in `lib/localAccounts.ts`), `shared/storage/localStorage.ts`, `sessionStorage.ts`, `app/` bootstrap (dispatch `restoreSession()` once after store creation and on `window` `online` when the last restore failed offline).

**Interfaces — Produces:**
- `class ApiError extends Error { status; code; retryAfter?: number }`, `class NetworkError extends Error`.
- `setAccessToken(token: string | null)`, `setRefreshHandler(fn: () => Promise<boolean>)`, `apiRequest<T>(path: string, init?: { method?; body?: unknown; auth?: boolean }): Promise<T>` — JSON in/out, `credentials: 'same-origin'`; on 401 `UNAUTHORIZED` with `auth` → one refresh (single-flight, `navigator.locks.request('fitpulse-refresh', …)` when available) then retry once.
- `authApi`: `register(data)`, `login(data)`, `restore(): Promise<AuthUser | null | 'offline'>`, `logout()`, `forgotPassword(email)`, `resetPassword(token, password)`, `updateProfile({ name?, email?, currentPassword? })`, `cachedUser(): AuthUser | null`. Successful sign-in saves the session marker + cached user in local or session storage per `remember`.
- Slice: `initialState.user = authApi.cachedUser()`; new thunks `restoreSession`, `requestPasswordReset`, `resetPassword`, `updateAccount` (replaces `syncAccount`, async); `AuthError` messages: `RATE_LIMITED` → «Забагато спроб. Спробуйте за N хв», `NetworkError` → «Немає з'єднання з сервером».

- [ ] Step 1: tests (stub `fetch`) — `adds the bearer token`, `refresh is single-flight across calls` (three parallel 401 → one refresh call), `retries once after REFRESH_RETRY`, `network failure throws NetworkError`; authApi — `login caches the user for remembered sessions only in localStorage`, `restore keeps the cached user on network error`, `restore signs out on SESSION_EXPIRED`, `logout clears token, marker and cached user`.
- [ ] Step 2: FAIL → implement → PASS; whole frontend suite `npm test -w @fitpulse/web` PASS (update existing auth tests to the new API).
- [ ] Step 3: commit `feat(auth): sign in through the API and keep the last user for offline starts`.

### Task 9: Adopting local accounts

**Files:** Create `frontend/src/features/auth/lib/localAccounts.ts` (+ test); modify `shared/storage/userStorage.ts` (`moveUserData`), `authApi.login/register`, `features/profile` avatar code and `setAvatar` (avatar → `STORAGE_KEYS.AVATAR` user data).

**Interfaces — Produces:** `findLocalAccount(email): StoredAccount | undefined`, `verifyLocalPassword(account, password): Promise<boolean>` (existing PBKDF2 `hashPassword`), `adoptLocalAccount(email, serverUserId): void` (moves data via `moveUserData(localId, serverId)` — copies keys missing under the target, removes source keys, moves avatar from the old account record into `AVATAR`, prunes the account from `fitpulse_accounts_v1`); `moveUserData(fromId: string, toId: string): void`.

- [ ] Step 1: tests — `move copies missing keys and keeps existing ones`, `login with a matching local password registers on the server and adopts data`, `EMAIL_TAKEN during adoption keeps local data and reports invalid credentials`, `any successful sign-in adopts the local account with the same email`, `avatar moves into per-user data`.
- [ ] Step 2: FAIL → implement → PASS; frontend suite PASS. Commit `feat(auth): move existing on-device accounts and their data to the server account`.

### Task 10: Password reset pages and profile email change

**Files:** Create `frontend/src/pages/forgot-password/ForgotPasswordPage.tsx`, `pages/reset-password/ResetPasswordPage.tsx` (+ tests); modify `app/router/AppRoutes.tsx` (public routes `forgot-password`, `reset-password`), `pages/login/LoginPage.tsx` (link «Забули пароль?»), `pages/profile/ProfilePage.tsx` (current password field shown when email differs; dispatch `updateAccount`), `build/preloadRoutePlugin` map in `vite.config.ts` if login is preloaded.

- [ ] Step 1: tests — `forgot page shows the confirmation after sending`, `reset page requires matching passwords`, `reset page without token shows the invalid link message`, `profile asks for the current password when the email changes`.
- [ ] Step 2: FAIL → implement → PASS; lint + typecheck. Commit `feat(auth): forgot and reset password pages, password check for email changes`.

### Task 11: Admin panel sign-in

**Files:** Create `frontend-AdminPanel/src/api/client.ts` (same token/refresh contract as Task 8 for `/api/auth/*`), `src/auth/LoginForm.tsx`, `src/auth/useSession.ts`; modify `App.tsx`. Tests: `src/App.test.tsx`.

- [ ] Step 1: tests — `shows the login form without a session`, `signs in and shows email and role` («Ви увійшли як a@x.com (адміністратор)»), `shows the error for wrong credentials`, `logout returns to the login form`, keep `API: працює` status line.
- [ ] Step 2: FAIL → implement → PASS. Commit `feat(admin-web): staff sign-in and sign-out`.

### Task 12: Infrastructure, e2e and docs

**Files:** Modify `docker-compose.yml` (service `mailpit`, api env `MAIL_PROVIDER=smtp`, `SMTP_URL=smtp://mailpit:1025`, `APP_URL`, `RATE_LIMIT_ENABLED=false` for api and admin-api), `render.yaml` (api: `MAIL_PROVIDER=resend`, `RESEND_API_KEY`, `MAIL_FROM`, `APP_URL` as `sync: false`), both nginx templates (`X-Forwarded-Proto $http_x_forwarded_proto`), `frontend/vite.config.ts` (`preview.proxy` same as `server.proxy`), `.github/workflows/ci.yml` (e2e job: postgres + redis services, build packages + api, `migrate:deploy`, start `node backend/dist/server.js &` with `NODE_ENV=test`, `MAIL_PROVIDER=log`, `RATE_LIMIT_ENABLED=false`, wait for `/api/health`), `frontend/e2e/auth.spec.ts` (+ forgot page, + local account adoption scenario seeding `fitpulse_accounts_v1` with a PBKDF2 account and history before sign-in), `docs/backend.md`, `README.md`.

- [ ] Step 1: e2e tests — `forgot password shows the confirmation`, `an on-device account keeps its workouts after signing in on the server`.
- [ ] Step 2: push; CI `e2e`, `integration`, `docker` green.
- [ ] Step 3: commits `chore(docker): Mailpit and mail settings for local password resets`, `ci: run e2e against the real API with Postgres and Redis`, `docs: accounts, sessions and password reset`.
