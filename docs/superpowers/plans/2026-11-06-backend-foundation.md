# Backend Foundation (Stage 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-app repo into an npm-workspaces monorepo with the existing app in `frontend/`, two Fastify backends, an admin shell, a Prisma database package, Docker for dev, CI, and a Render Blueprint.

**Architecture:** Four apps (`frontend`, `frontend-AdminPanel`, `backend`, `backend-AdminPanel`) and three shared packages (`packages/contracts`, `packages/server-core`, `packages/db`). Backends are thin: `buildApp` composes `@fitpulse/server-core` (config, errors, health) with their own config and Prisma/Redis clients. Each frontend ships as an nginx image that proxies `/api/*` to its backend so cookies stay same-origin.

**Tech Stack:** Node 24 (images, CI; local Node 22 works), npm workspaces, TypeScript ~6.0.3, Fastify 5.12, fastify-type-provider-zod 7, Zod 4, Prisma 7.10 with `@prisma/adapter-pg`, ioredis 6, argon2, Vitest 5, oxlint, Vite 8, nginx:alpine, Postgres 17, Redis 7.

**Spec:** `docs/superpowers/specs/2026-11-06-backend-foundation-design.md`

## Global Constraints

- Layout at repo root: `frontend/`, `frontend-AdminPanel/`, `backend/`, `backend-AdminPanel/`, `packages/db/`, `packages/contracts/`, `packages/server-core/`.
- Package names: `@fitpulse/web`, `@fitpulse/admin-web`, `@fitpulse/api`, `@fitpulse/admin-api`, `@fitpulse/db`, `@fitpulse/contracts`, `@fitpulse/server-core`.
- Workspaces order in root `package.json`: `packages/contracts`, `packages/server-core`, `packages/db`, `backend`, `backend-AdminPanel`, `frontend`, `frontend-AdminPanel` (build order relies on it).
- Dependency rules: frontends never import `@fitpulse/db`, `@fitpulse/server-core` or a backend; backends never import each other.
- All packages are ESM (`"type": "module"`), compiled with `tsc` to `dist/`; packages export `./dist/index.js` with `types`.
- Error body is always `{ error: { code, message, details? } }`; codes `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`.
- `GET /api/health` → 200 `{ status: "ok" }` without touching DB/Redis. `GET /api/health/ready` → 200/503 `{ status: "ok" | "unavailable", checks: { database, redis } }`, each check times out after 2000 ms.
- Ports: `backend` 3000, `backend-AdminPanel` 3001, `frontend` dev 5173, `frontend-AdminPanel` dev 5174; production reads `PORT`.
- Env: `DATABASE_URL`, `REDIS_URL` (accepts `redis://` and `rediss://`), `JWT_SECRET` (api) / `ADMIN_JWT_SECRET` (admin-api), min 32 chars, `NODE_ENV`, `PORT`, `HOST` (default `0.0.0.0`), `LOG_LEVEL` (default `info`), optional `CORS_ORIGIN`; api only: `RUN_MIGRATIONS`.
- `npm test` never needs Postgres or Redis; `npm run test:integration` requires `DATABASE_URL` and `REDIS_URL` pointing at the test database `fitpulse_test`.
- Every Node workspace has `vitest.config.ts` (unit: `test/**/*.test.ts`, excludes `**/*.int.test.ts`) and `vitest.integration.config.ts` (`test/**/*.int.test.ts`, `fileParallelism: false`); scripts `test: vitest run`, `test:integration: vitest run -c vitest.integration.config.ts`. Packages without unit tests use `--passWithNoTests`.
- Containers run as the `node` user; secrets never committed.
- Frontend logic is untouched: every existing lint, unit, e2e, size-budget and Lighthouse check must still pass.
- Commits follow the user's format: `<type>(<scope>): <summary>` plus "— why" bullets; no Claude attribution.

## Review Focus

1. Postgres asleep or unreachable (Neon cold start, wrong URL) → `/api/health` stays 200, `/api/health/ready` answers 503 within ~2 s instead of hanging. Test: Task 2 `ready times out a hanging check`.
2. Same email typed with different case (`Ann@x.com` vs `ann@x.com`) → second insert rejected. Test: Task 3 `email is unique ignoring case`.
3. Managed Redis URL with TLS (`rediss://…` from Render Key Value/Upstash) → config accepts it. Test: Task 2 `accepts rediss urls`.
4. Refreshing a deep link (`/exercise/bench-press`, `/plans`) on the nginx image → prerendered HTML or `index.html`, never 404. Test: Task 7 docker smoke step in CI (Task 9).
5. A POST with a JSON body through the nginx `/api` proxy → reaches the API unchanged (API's JSON 404 comes back, not nginx HTML). Test: Task 9 smoke step.

---

### Task 1: Move the app into `frontend/` and create the workspace root

**Files:**
- Move (git mv): `src/ public/ build/ e2e/ scripts/ index.html vite.config.ts tsconfig*.json .oxlintrc.json playwright.config.ts lighthouserc.json vercel.json .env.example package.json` → `frontend/`
- Create: `package.json` (root), `tsconfig.base.json`, `.nvmrc` (`24`)
- Modify: `.gitignore`, `.github/workflows/ci.yml`, regenerate `package-lock.json` at root (delete old)

**Interfaces:**
- Produces: root scripts `lint`, `test`, `typecheck`, `build` = `npm run <x> --workspaces --if-present`; `test:integration` same pattern; `dev` not defined at root (Docker runs dev).
- Produces: `tsconfig.base.json` for Node packages: `target es2023`, `module/moduleResolution nodenext`, `strict`, `declaration`, `sourceMap`, `skipLibCheck`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`.

- [ ] **Step 1:** `git mv` the listed paths into `frontend/`. Rename `frontend/package.json` `name` to `@fitpulse/web`; add `"typecheck": "tsc -b"`. Keep its scripts otherwise.
- [ ] **Step 2:** Write root `package.json`: `"private": true`, `"type": "module"`, `"workspaces": ["frontend"]` (each later task appends its own path, keeping the Global Constraints order), `"engines": { "node": ">=22" }`, devDependency `typescript ~6.0.3` moved from frontend to root.
- [ ] **Step 3:** Delete root `package-lock.json`, run `npm install` at root. Run: `npm ls --workspaces --depth=0` → lists `@fitpulse/web`.
- [ ] **Step 4:** `.gitignore`: patterns are unanchored already (`node_modules`, `dist`, `playwright-report/`…) so they keep working; add `.env`, `**/src/generated/`.
- [ ] **Step 5:** Verify the app is unchanged: from `frontend/` run `npm run lint`, `npm test`, `npm run build`, `npm run check:size`, `npm run test:e2e`. Expected: same pass counts as on `main`.
- [ ] **Step 6:** CI: existing three jobs keep their steps but `npm ci` stays at root and every other step runs with `working-directory: frontend`; artifact paths become `frontend/dist`, `frontend/playwright-report`, `frontend/lighthouse-report`; the vercel.json check reads `frontend/vercel.json`.
- [ ] **Step 7:** Commit `refactor: move the app into frontend/ as the first npm workspace`.

### Task 2: `packages/contracts` and `packages/server-core`

**Files:**
- Create: `packages/contracts/{package.json,tsconfig.json,src/index.ts,src/errors.ts,src/health.ts}`
- Create: `packages/server-core/{package.json,tsconfig.json,vitest.config.ts,src/index.ts,src/config.ts,src/app.ts,src/errors.ts,src/health.ts}`
- Test: `packages/server-core/test/{config.test.ts,app.test.ts,health.test.ts}`

**Interfaces:**
- Produces (`@fitpulse/contracts`): `errorResponseSchema` (Zod, shape per Global Constraints, `details: { path: string; message: string }[]` optional), `ErrorResponse`; `ErrorCode` const object; `healthResponseSchema` (`{ status: z.literal('ok') }`); `readinessResponseSchema` (`{ status: z.enum(['ok','unavailable']), checks: z.record(z.string(), z.enum(['ok','fail'])) }`) and their types. Depends only on `zod ^4.6.7`.
- Produces (`@fitpulse/server-core`):
  - `baseEnvSchema` (Zod object with the env vars from Global Constraints except the JWT secrets and `RUN_MIGRATIONS`).
  - `class ConfigError extends Error` whose message lists every invalid variable name with its issue.
  - `parseConfig<S extends z.ZodType>(schema: S, env: Record<string, string | undefined>): z.infer<S>` — throws `ConfigError`.
  - `createBaseApp(opts: { logger: FastifyServerOptions['logger'] }): FastifyInstance` typed with `ZodTypeProvider`; sets zod validator/serializer compilers, the error handler (validation → 400 `VALIDATION_ERROR` with details; errors with `statusCode < 500` keep code/message; everything else → 500 `INTERNAL_ERROR`, message `Internal server error`, logged) and the not-found handler (404 `NOT_FOUND`).
  - `healthRoutes`: Fastify plugin with options `{ checks: Record<string, () => Promise<unknown>>; timeoutMs?: number }` (default 2000) registering `GET /health` and `GET /health/ready`; callers register it with `{ prefix: '/api' }`. 503 body uses `status: 'unavailable'`.
  - `createRedis(url: string): Redis` (ioredis, `lazyConnect: true`, `maxRetriesPerRequest: 1`, `connectTimeout: 2000`) — used by both backends.
  - Deps: `fastify ^5.12.8`, `fastify-plugin`, `fastify-type-provider-zod ^7.0.0`, `zod`, `ioredis ^6.0.0`, `@fitpulse/contracts`.

- [ ] **Step 1: Write failing tests** (`app.inject`, no network):
  - `config.test.ts`: `parses defaults` (minimal env → `HOST '0.0.0.0'`, `LOG_LEVEL 'info'`, `NODE_ENV 'development'`); `accepts rediss urls` (`REDIS_URL='rediss://default:pw@host:6380'` passes); `lists every missing variable` (empty env → `ConfigError` message contains `DATABASE_URL` and `REDIS_URL`); `coerces PORT` (`'8080'` → `8080`).
  - `app.test.ts`: `unknown route returns 404 error body` (`GET /nope` → 404, body `{ error: { code: 'NOT_FOUND' } }` and matches `errorResponseSchema`); `validation error returns 400 with details` (test route with zod body schema, bad body → 400 `VALIDATION_ERROR`, `details[0].path`); `unexpected error hides details` (route throws `new Error('secret')` → 500, message `Internal server error`, body does not contain `secret`).
  - `health.test.ts`: `health ignores checks` (checks that reject → `/api/health` 200 `{ status: 'ok' }`); `ready ok when all checks pass` (200, `checks: { database: 'ok', redis: 'ok' }`); `ready 503 when a check fails` (redis rejects → 503, `redis: 'fail'`, `database: 'ok'`); `ready times out a hanging check` (check never resolves, `timeoutMs: 50` → 503 within 500 ms).
- [ ] **Step 2:** Add both packages to root workspaces, `npm install`, run `npm test -w @fitpulse/server-core` → FAIL (modules missing).
- [ ] **Step 3:** Implement contracts and server-core per Interfaces. Each package `package.json`: `exports` → `{ ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }`, scripts `build: tsc -p tsconfig.json`, `typecheck: tsc --noEmit`, `lint: oxlint src test`, `test: vitest run`. Tests import from `../src`.
- [ ] **Step 4:** Run `npm test -w @fitpulse/server-core` → PASS; `npm run build -w @fitpulse/contracts -w @fitpulse/server-core` → `dist/` emitted; `npm run lint` and `npm run typecheck` at root → clean.
- [ ] **Step 5:** Commit `feat(api): shared contracts and Fastify core for config, errors and health checks`.

### Task 3: `packages/db` — Prisma schema, first migration, seed

**Files:**
- Create: `packages/db/{package.json,tsconfig.json,prisma.config.ts,vitest.config.ts}`
- Create: `packages/db/prisma/schema.prisma`, `packages/db/prisma/migrations/<timestamp>_init/migration.sql`, `packages/db/prisma/seed.ts`
- Create: `packages/db/src/{index.ts,client.ts,seed-admin.ts}`
- Test: `packages/db/test/{schema.int.test.ts,seed-admin.int.test.ts,helpers.ts}`

**Interfaces:**
- Produces: `createPrismaClient(databaseUrl: string): PrismaClient` (uses `PrismaPg` adapter); re-exports `PrismaClient`, `Prisma`, `AdminRole` from the generated client.
- Produces: `seedAdmin(prisma: PrismaClient, input: { email: string; password: string }): Promise<{ created: boolean }>` — hashes with argon2id, no-op when that email exists.
- Produces scripts: `generate` (`prisma generate`), `migrate:dev`, `migrate:deploy` (`prisma migrate deploy`), `migrate:check` (`prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code`), `db:seed` (`tsx prisma/seed.ts`, reads `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`), `build` (`prisma generate && tsc`), `test:integration` (`vitest run --project integration` or a dedicated config matching `*.int.test.ts`), `test` (no-op unit set: `vitest run --passWithNoTests` excluding `*.int.test.ts`).
- `prisma` and `@prisma/client`, `@prisma/adapter-pg` pinned `7.10.1` as **dependencies** (the api image runs `migrate deploy` at start).

- [ ] **Step 1: Schema** in `schema.prisma`: generator `prisma-client` with `output = "../src/generated/prisma"`, `moduleFormat = "esm"`, `importFileExtension = "js"`; datasource `postgresql` (URL comes from `prisma.config.ts` via `env('DATABASE_URL')`, `shadowDatabaseUrl` from optional `SHADOW_DATABASE_URL`). Models exactly per spec: `User`, `Session`, `AdminUser`, `AdminSession`, enum `AdminRole { MANAGER ADMIN }`; ids `String @id @default(uuid()) @db.Uuid`; emails `String @unique @db.Citext`; `Session.user` / `AdminSession.admin` with `onDelete: Cascade`; index on `Session.userId` and `AdminSession.adminId`; table names mapped snake_case (`@@map("users")`, …, columns `@map("password_hash")` etc.).
- [ ] **Step 2: Migration:** generate with `prisma migrate dev --create-only --name init` against a local DB, then prepend `CREATE EXTENSION IF NOT EXISTS citext;` to `migration.sql`. Without a local DB, write it with `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`.
- [ ] **Step 3: Write failing integration tests** (helpers truncate tables between tests; DB = `DATABASE_URL`):
  - `migrations apply to an empty database` (CI applies `migrate:deploy` first; test asserts `SELECT extname FROM pg_extension` includes `citext` and the four tables exist).
  - `email is unique ignoring case` (create `Ann@x.com`, then `ann@x.com` → rejects with Prisma code `P2002`).
  - `deleting a user deletes its sessions` (user + 2 sessions, delete user → `session.count() === 0`).
  - `seedAdmin creates the admin once` (first call `{ created: true }`, role `ADMIN`, hash starts `$argon2id$`, not equal to the password; second call `{ created: false }`, `adminUser.count() === 1`).
- [ ] **Step 4:** Implement `client.ts`, `seed-admin.ts`, `prisma/seed.ts` (role `ADMIN`, exits 1 with a message if the env vars are missing).
- [ ] **Step 5:** Verify: `npm run build -w @fitpulse/db` (offline-safe) and `npm run migrate:check -w @fitpulse/db` with a DB → exit 0. Integration tests run in Task 8 (Docker) / Task 9 (CI) when no local Postgres+Redis: record that, do not skip silently.
- [ ] **Step 6:** Commit `feat(db): Prisma schema with users, sessions and admins, first migration and admin seed`.

### Task 4: `backend` (Fastify API)

**Files:**
- Create: `backend/{package.json,tsconfig.json,vitest.config.ts,.env.example,Dockerfile,docker-entrypoint.sh}`
- Create: `backend/src/{config.ts,app.ts,server.ts}`
- Test: `backend/test/app.test.ts`, `backend/test/ready.int.test.ts`

**Interfaces:**
- Consumes: `baseEnvSchema`, `parseConfig`, `createBaseApp`, `healthRoutes`, `createRedis` (Task 2); `createPrismaClient` (Task 3).
- Produces: `apiEnvSchema = baseEnvSchema.extend({ JWT_SECRET: z.string().min(32), PORT: default 3000 })`, `type ApiConfig`, `loadConfig(env = process.env): ApiConfig`.
- Produces: `buildApp(deps: { config: ApiConfig; prisma: Pick<PrismaClient, '$queryRaw' | '$disconnect'>; redis: Pick<Redis, 'ping' | 'quit'> }): Promise<FastifyInstance>` — logger `pino-pretty` transport only when `NODE_ENV === 'development'`; registers `@fastify/cors` only when `CORS_ORIGIN` is set; registers `healthRoutes` at `/api` with checks `database: () => prisma.$queryRaw\`SELECT 1\``, `redis: () => redis.ping()`; `onClose` hook disconnects both.
- `server.ts`: `loadConfig` → clients → `buildApp` → `listen({ port, host })`; on `ConfigError` print the message and `process.exit(1)`; SIGTERM → `app.close()`.
- Scripts: `dev: tsx watch src/server.ts`, `build: tsc`, `start: node dist/server.js`, `test`, `test:integration`, `lint`, `typecheck`.

- [ ] **Step 1: Write failing tests** with stub clients:
  - `health responds without the database` (stubs reject → `/api/health` 200).
  - `ready reports database and redis` (stubs resolve → 200 both `ok`).
  - `missing JWT_SECRET stops the config` (`loadConfig({...valid, JWT_SECRET: 'short'})` throws `ConfigError` mentioning `JWT_SECRET`).
  - `ready.int.test.ts`: real `createPrismaClient` + `createRedis` from env → `/api/health/ready` 200.
- [ ] **Step 2:** Add workspace, install (`fastify`, `@fastify/cors`, `pino-pretty` dev, `tsx` dev), run tests → FAIL.
- [ ] **Step 3:** Implement per Interfaces. Run `npm test -w @fitpulse/api` → PASS; `npm run build -w @fitpulse/api`.
- [ ] **Step 4: Dockerfile** (context = repo root), stages: `deps` (`node:24-slim`, copy root `package*.json` and every workspace `package.json`, `npm ci`), `build` (copy `packages/` + `backend/`, `npm run build -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/api`), `runtime` (`node:24-slim`, `NODE_ENV=production`, `npm ci --omit=dev -w @fitpulse/api -w @fitpulse/db -w @fitpulse/server-core -w @fitpulse/contracts`, copy each `dist/` and `packages/db/prisma` + `prisma.config.ts`, `USER node`, `EXPOSE 3000`, `ENTRYPOINT ["backend/docker-entrypoint.sh"]`). Also add root `.dockerignore` (`**/node_modules`, `**/dist`, `.git`, `**/.env`, reports).
- [ ] **Step 5:** `docker-entrypoint.sh` (`#!/bin/sh`, `set -e`): if `RUN_MIGRATIONS = true` run `npm run migrate:deploy -w @fitpulse/db`; then `exec node backend/dist/server.js`. Commit it with LF endings (add `*.sh text eol=lf` to `.gitattributes`).
- [ ] **Step 6:** Commit `feat(api): Fastify API with health checks against Postgres and Redis`.

### Task 5: `backend-AdminPanel` (Fastify admin API)

**Files:** mirror Task 4 under `backend-AdminPanel/` (no entrypoint script; `CMD ["node", "backend-AdminPanel/dist/server.js"]`).

**Interfaces:**
- Produces: `adminEnvSchema = baseEnvSchema.extend({ ADMIN_JWT_SECRET: z.string().min(32), PORT: default 3001 })`, `type AdminConfig`, `loadConfig`, `buildApp` with the same deps signature as Task 4.

- [ ] **Step 1:** Write the same three unit tests plus `uses ADMIN_JWT_SECRET, not JWT_SECRET` (env with only `JWT_SECRET` → `ConfigError` mentioning `ADMIN_JWT_SECRET`) and the ready integration test.
- [ ] **Step 2:** Implement, run `npm test -w @fitpulse/admin-api` → PASS, build.
- [ ] **Step 3:** Commit `feat(admin-api): admin Fastify API skeleton with its own JWT secret`.

### Task 6: `frontend-AdminPanel` shell

**Files:**
- Create: `frontend-AdminPanel/{package.json,index.html,vite.config.ts,tsconfig.json,vitest.config.ts,.oxlintrc.json}`, `src/{main.tsx,App.tsx,api/health.ts,index.css}`
- Test: `frontend-AdminPanel/src/App.test.tsx`

**Interfaces:**
- Consumes: `healthResponseSchema` from `@fitpulse/contracts`.
- Produces: `fetchApiHealth(fetchFn = fetch): Promise<'ok' | 'down'>` (GET `/api/health`, parses with the schema, any failure → `'down'`).
- `App`: heading `FitPulse Admin`, text `Вхід для менеджерів і адміністраторів з'явиться на наступному етапі`, status line `API: працює` / `API: недоступне`.
- Vite: port 5174, `server.proxy['/api'] = process.env.API_PROXY_TARGET ?? 'http://localhost:3001'`, `server.host = true`. Same React/Vite/Tailwind versions as `frontend`.

- [ ] **Step 1: Failing tests:** `shows API up` (fetch stub returns `{ status: 'ok' }` → text `API: працює`); `shows API down on network error` (stub rejects → `API: недоступне`).
- [ ] **Step 2:** Implement; also add the same proxy to `frontend/vite.config.ts` (`API_PROXY_TARGET ?? 'http://localhost:3000'`, `host: true`) without touching anything else there.
- [ ] **Step 3:** Run tests, `npm run build -w @fitpulse/admin-web`, root `npm run lint` → PASS.
- [ ] **Step 4:** Commit `feat(admin-web): admin panel shell that reports the admin API status`.

### Task 7: nginx images for both frontends

**Files:**
- Create: `frontend/Dockerfile`, `frontend/nginx/default.conf.template`, `frontend-AdminPanel/Dockerfile`, `frontend-AdminPanel/nginx/default.conf.template`

**Interfaces:**
- Image env: `PORT` (default `8080` via `ENV`), `API_UPSTREAM` (e.g. `https://fitpulse-api.onrender.com` or `http://api:3000`). nginx:alpine renders `/etc/nginx/templates/*.template` with envsubst; restrict with `NGINX_ENVSUBST_FILTER=PORT|API_UPSTREAM`.
- Template: `listen ${PORT}`; `location /api/ { proxy_pass ${API_UPSTREAM}; proxy_set_header Host $proxy_host; proxy_ssl_server_name on; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; client_max_body_size 5m; }`; `location = /sw.js { add_header Cache-Control "no-cache"; }`; `location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }`; `location / { try_files $uri $uri.html $uri/index.html /index.html; }`; gzip on for text/js/css/json/svg.
- Build stage: `node:24-slim`, `npm ci`, build contracts then the app (`npm run build -w @fitpulse/web`); `VITE_*` passed as build args (`VITE_SITE_URL`, `VITE_ADS_ENABLED`, `VITE_ERROR_ENDPOINT`). Runtime: `nginxinc/nginx-unprivileged:alpine` (runs as non-root, supports the same templates; `PORT` must be ≥ 1024), copy `dist` to `/usr/share/nginx/html`.

- [ ] **Step 1:** Check how the prerender plugin names files (`frontend/dist/exercise/bench-press/index.html` vs `.html`) after `npm run build`; keep the matching `try_files` entries only.
- [ ] **Step 2:** Write Dockerfiles and templates per Interfaces.
- [ ] **Step 3:** Verification happens in Task 9's docker job (no local Docker): build both images; run `web` with `API_UPSTREAM=http://api:3000` on a network with the api image; `curl -fsS localhost:8080/exercise/bench-press | grep -q '<title>'`; `curl -fsS localhost:8080/plans | grep -q 'id="root"'`; `curl -s -X POST -H 'content-type: application/json' -d '{"a":1}' localhost:8080/api/nope` → JSON containing `"NOT_FOUND"`; `curl -fsS localhost:8080/api/health` → `{"status":"ok"}`.
- [ ] **Step 4:** Commit `feat(docker): nginx images for both frontends that proxy /api to their backend`.

### Task 8: Docker Compose for development

**Files:**
- Create: `Dockerfile.dev` (root), `docker-compose.yml`, `docker/postgres/init.sql`, `.env.example` (root, compose variables)

**Interfaces:**
- `Dockerfile.dev`: `node:24-slim`, workdir `/app`, copy all `package*.json`, `npm ci`, copy the rest; used by every Node service.
- Services per spec table: `db` (`postgres:17-alpine`, user/password `fitpulse`, healthcheck `pg_isready`, `init.sql` creates `fitpulse_test`), `redis` (`redis:7-alpine`, healthcheck `redis-cli ping`), `migrate` (`npm run migrate:deploy -w @fitpulse/db`, depends on db healthy), `api` (`npm run dev -w @fitpulse/api`, env from compose, `depends_on: db healthy, redis healthy, migrate completed_successfully`, port 3000), `admin-api` (same, 3001), `web` (`npm run dev -w @fitpulse/web -- --host`, `API_PROXY_TARGET=http://api:3000`, 5173), `admin-web` (5174, `http://admin-api:3001`).
- Bind mount `./:/app`; named volume `node_modules:/app/node_modules` plus per-workspace node_modules volumes so Windows host modules never shadow Linux ones; `CHOKIDAR_USEPOLLING=true` for watchers on Windows mounts.
- Packages are consumed from `dist/`, so `api`/`admin-api` dev command first runs `npm run build -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db` (put it in a `predev` script of each backend).
- Dev secrets in compose are obvious placeholders (`dev-only-jwt-secret-change-me-0000000000`).

- [ ] **Step 1:** Write files. `docker compose config` validates syntax (CI step in Task 9).
- [ ] **Step 2:** Document in README the commands: `docker compose up`, `docker compose run --rm api npm run test:integration -w @fitpulse/api` with `DATABASE_URL` overridden to `fitpulse_test`, `docker compose run --rm api npm run db:seed -w @fitpulse/db`.
- [ ] **Step 3:** Commit `chore(docker): run the database, Redis, both APIs and both frontends with docker compose`.

### Task 9: CI for backends and images

**Files:** Modify `.github/workflows/ci.yml`

- [ ] **Step 1:** Rename job `quality` → `frontend`; add `workspaces` job: `npm ci`, `npm run build -w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db`, then `npm run lint`, `npm run typecheck` and `npm test`, each with `-w @fitpulse/contracts -w @fitpulse/server-core -w @fitpulse/db -w @fitpulse/api -w @fitpulse/admin-api -w @fitpulse/admin-web` (the `frontend` job already covers `@fitpulse/web`).
- [ ] **Step 2:** Add `integration` job: services `postgres:17-alpine` (db `fitpulse_test`) and `redis:7-alpine` with health options; env `DATABASE_URL=postgresql://fitpulse:fitpulse@localhost:5432/fitpulse_test`, `SHADOW_DATABASE_URL` → a second database created by a `psql` step, `REDIS_URL=redis://localhost:6379`; steps: `npx prisma validate`, `npm run migrate:deploy -w @fitpulse/db`, `npm run migrate:check -w @fitpulse/db`, `npm run test:integration --workspaces --if-present`.
- [ ] **Step 3:** Add `docker` job: `docker compose config -q`; build the four images with `docker build -f <app>/Dockerfile .`; run the smoke script from Task 7 Step 3 on a user-defined network with postgres, redis and the api image (`RUN_MIGRATIONS=true`), waiting up to 60 s for `/api/health`.
- [ ] **Step 4:** Push the branch, watch the run, fix until green. Expected: jobs `frontend`, `e2e`, `lighthouse`, `workspaces`, `integration`, `docker` all pass.
- [ ] **Step 5:** Commit `ci: lint, test and build every workspace, run integration tests and smoke-test the images`.

### Task 10: Render Blueprint and docs

**Files:**
- Create: `render.yaml`
- Modify: `docs/backend.md` (rewrite for this stack), `docs/architecture.md` (paths), `README.md` (structure, Docker commands), `docs/README.md` (link the spec)

**Interfaces:**
- `render.yaml` services: `fitpulse-api` (`type: web`, `runtime: docker`, `dockerfilePath: ./backend/Dockerfile`, `dockerContext: .`, `healthCheckPath: /api/health`, env `RUN_MIGRATIONS=true`, `NODE_ENV=production`, `DATABASE_URL`/`JWT_SECRET` `sync: false`, `REDIS_URL` `fromService: { type: keyvalue, name: fitpulse-redis, property: connectionString }`), `fitpulse-admin-api` (same with `ADMIN_JWT_SECRET`, no `RUN_MIGRATIONS`), `fitpulse-web` and `fitpulse-admin-web` (`runtime: docker`, `API_UPSTREAM` `sync: false`, `healthCheckPath: /`), `fitpulse-redis` (`type: keyvalue`, `plan: free`, `ipAllowList: []`, `maxmemoryPolicy: noeviction`). All `plan: free`, `autoDeploy: true`, `buildFilter.paths` per service (its folder + `packages/**` + `package-lock.json`).

- [ ] **Step 1:** Write `render.yaml`; check it parses: `npx --yes js-yaml render.yaml > /dev/null` → exit 0. Add the same command to the CI `docker` job.
- [ ] **Step 2:** Rewrite docs per spec "Документація"; mention the Render free-tier sleep and that Neon is the recommended DB.
- [ ] **Step 3:** Commit `docs: describe the Fastify backend, Docker and Render setup` (render.yaml in a separate `chore(deploy): Render Blueprint for both APIs, both frontends and Redis` commit).
