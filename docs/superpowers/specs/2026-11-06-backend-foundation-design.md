# Бекенд FitPulse: архітектура й етап 1 (фундамент)

Дата: 2026-11-06. Статус: на погодженні.

## Мета

FitPulse зараз — React-застосунок, усі дані якого лежать у браузері. Потрібні справжні акаунти, синхронізація між пристроями й адмін-панель. Проєкт має збиратися в Docker і розгортатися на Render без ручного налаштування серверів.

Що вирішено разом із власником проєкту:

| Питання | Рішення |
|---|---|
| Стек бекенду | Fastify, TypeScript, Postgres, Redis, JWT, Prisma |
| Хостинг | Render. Кожна частина — Docker-образ |
| Структура | Корінь репозиторію: `frontend/`, `backend/`, `frontend-AdminPanel/`, `backend-AdminPanel/` і спільні `packages/` |
| Адмінка | Підтримка користувачів, контент (вправи, програми), бізнес-статистика й підписки. Ролі `manager` і `admin` |
| Авторизація | Access JWT на 15 хвилин у пам'яті й refresh-токен у cookie `httpOnly` з ротацією. Сесії й ліміти частоти в Redis |
| Офлайн | Лишається: тренування пишеться на телефоні без мережі, сервер отримує зміни пізніше |

## Етапи

Кожен етап отримує власну специфікацію й план.

1. **Фундамент** (цей документ): структура, переїзд фронта, workspaces, Docker, скелети двох бекендів, Prisma з першою міграцією, CI, конфіг Render.
2. Акаунти: реєстрація, вхід, refresh, вихід, скидання пароля, вхід адмінів.
3. Синхронізація даних застосунку з сервером.
4. Адмінка: API й інтерфейс для підтримки, контенту й статистики. Тут вирішимо, як каталог вправ переходить із коду в базу і що буде з пререндером.
5. Push-сповіщення й оплата Pro.

## Структура репозиторію

```
frontend/               поточний React-застосунок, переїжджає з кореня без змін логіки
frontend-AdminPanel/    React 19 + Vite + Tailwind 4 + React Router
backend/                Fastify: API застосунку, префікс /api
backend-AdminPanel/     Fastify: API адмінки, префікс /api
packages/db/            schema.prisma, міграції, сід, експорт Prisma Client
packages/contracts/     Zod-схеми запитів і відповідей, спільні типи
packages/server-core/   спільний каркас Fastify для обох бекендів: конфіг, помилки, health
docs/                   документація
.github/workflows/      CI
docker-compose.yml      уся система локально
render.yaml             Render Blueprint: усі сервіси продакшену
package.json            npm workspaces і загальні скрипти
tsconfig.base.json      спільні налаштування TypeScript
```

- Workspaces: `frontend`, `frontend-AdminPanel`, `backend`, `backend-AdminPanel`, `packages/*`. Один `package-lock.json` у корені.
- Імена пакетів: `@fitpulse/web`, `@fitpulse/admin-web`, `@fitpulse/api`, `@fitpulse/admin-api`, `@fitpulse/db`, `@fitpulse/contracts`, `@fitpulse/server-core`.
- Кореневі скрипти запускають команду в усіх workspaces: `npm run lint`, `npm test`, `npm run build`, `npm run typecheck`.
- Залежності: фронти не імпортують бекенди й `@fitpulse/db`. Бекенди не імпортують один одного. Обидва бекенди беруть схему й клієнт із `@fitpulse/db`, а каркас — із `@fitpulse/server-core`. Усі чотири застосунки беруть типи з `@fitpulse/contracts`. Фронти не імпортують `@fitpulse/server-core`.

## Бекенди

Обидва бекенди влаштовані однаково. Спільне (перевірка конфігу, форма помилок, маршрути health із тайм-аутом перевірок 2 секунди) лежить у `@fitpulse/server-core`, а в кожному бекенді лишаються лише власні налаштування й маршрути:

```
src/
  app.ts          buildApp(config): створює Fastify, реєструє плагіни й маршрути. Його ж використовують тести
  server.ts       читає змінні середовища, запускає app.listen
  config.ts       перевіряє змінні середовища Zod-схемою; без потрібних змінних сервер не стартує
  plugins/        prisma, redis, обробник помилок
  routes/         health.ts
test/             тести на справжніх Postgres і Redis
Dockerfile
```

- Fastify 5, валідація й типи через `fastify-type-provider-zod` зі схемами з `@fitpulse/contracts`.
- Логи — вбудований pino. У продакшені JSON, у розробці читабельний формат.
- Помилки мають одну форму: `{ error: { code, message } }`. Помилки валідації повертають 400 з полями, а невідомі — 500 без деталей назовні.
- `GET /api/health` відповідає `{ status: "ok" }` без звернення до бази: так перевірка здоров'я Render не перезапускає сервіс, коли база недоступна. `GET /api/health/ready` перевіряє Postgres і Redis.
- Збірка через `tsc` у `dist/`, запуск `node dist/server.js`. У розробці `tsx watch`.
- Порти: `backend` слухає 3000, `backend-AdminPanel` — 3001. На Render порт береться зі змінної `PORT`.
- Змінні середовища: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` (у адмінки окремий `ADMIN_JWT_SECRET`), `CORS_ORIGIN` лише для розробки, `NODE_ENV`, `PORT`.

## База даних (packages/db)

- Prisma ORM, провайдер `postgresql`. Міграції лежать у `packages/db/prisma/migrations` і потрапляють у git.
- Перша міграція містить лише те, що потрібно етапу 2: таблиці для акаунтів. Таблиці програм, тренувань і решти даних додадуть міграції етапу 3.

| Таблиця | Поля |
|---|---|
| `User` | `id` uuid, `email` унікальний (без урахування регістру), `passwordHash`, `emailVerifiedAt`, `blockedAt`, `createdAt`, `updatedAt` |
| `Session` | `id` uuid, `userId` → `User` (каскадне видалення), `refreshTokenHash`, `userAgent`, `createdAt`, `expiresAt`, `revokedAt` |
| `AdminUser` | `id` uuid, `email` унікальний, `passwordHash`, `role` (`MANAGER` або `ADMIN`), `createdAt`, `updatedAt`, `disabledAt` |
| `AdminSession` | як `Session`, але з посиланням на `AdminUser` |

- Користувачі застосунку й адміністратори лежать в окремих таблицях. Акаунт застосунку не може стати адміном через помилку в правах.
- Сесії зберігаються в Postgres як джерело правди. Redis тримає ліміти частоти й кеш відкликаних сесій для швидкої перевірки.
- Сід `npm run db:seed` створює першого адміна з `SEED_ADMIN_EMAIL` і `SEED_ADMIN_PASSWORD`. На етапі 1 пароль хешується так само, як надалі (argon2).
- CI перевіряє, що схема відповідає міграціям: `prisma migrate diff` з `--exit-code` між міграціями й `schema.prisma`.

## Фронти

- `frontend/` — поточний застосунок. Переносяться `src/`, `public/`, `build/`, `e2e/`, `scripts/`, `index.html`, конфіги Vite, TypeScript, oxlint, Playwright і Lighthouse. Логіка не змінюється, усі тести мають проходити як і раніше.
- `frontend-AdminPanel/` на етапі 1 — порожня оболонка: сторінка входу-заглушка й перевірка, що `/api/health` адмінки відповідає. Справжній інтерфейс з'явиться на етапі 4.
- У розробці Vite проксіює `/api` у свій бекенд.
- У продакшені кожен фронт — Docker-образ з nginx. Він віддає статику й проксіює `/api/*` на свій бекенд (адреса задається змінною `API_UPSTREAM`). Для браузера застосунок і API живуть на одному домені, тому cookie refresh-токена працює з `SameSite=Lax` без CORS. Домен `onrender.com` входить у Public Suffix List, тож без спільного домену сусідні сервіси вважалися б різними сайтами.
- nginx у `frontend` повторює поточні правила `vercel.json`: `sw.js` без кешу, `/assets/*` з довгим кешем. Спершу шукається пререндерений HTML (`$uri`, `$uri/index.html`), а все інше повертає `index.html`.

## Docker

**Образи.** Кожен із чотирьох застосунків має багатоетапний `Dockerfile`, контекст збірки — корінь репозиторію (потрібні workspaces і `packages/`).
- Бекенди: етап `build` (`npm ci` для свого workspace і пакетів, `prisma generate`, `tsc`) і етап `runtime` на `node:24-slim` лише з продакшен-залежностями й `dist/`. Запускаються від користувача `node`, не від root.
- Фронти: етап `build` (`vite build`) і етап `runtime` на `nginx:alpine` з конфігом-шаблоном.

**Розробка: `docker compose up`.**

| Сервіс | Що це | Порт |
|---|---|---|
| `db` | Postgres 17, бази `fitpulse` і `fitpulse_test` | 5432 |
| `redis` | Redis 7 | 6379 |
| `migrate` | Разово запускає `prisma migrate deploy` і завершується | — |
| `api` | `backend` у режимі `tsx watch`, код змонтовано з диска | 3000 |
| `admin-api` | `backend-AdminPanel` так само | 3001 |
| `web` | Vite dev-сервер `frontend` | 5173 |
| `admin-web` | Vite dev-сервер `frontend-AdminPanel` | 5174 |

`api` і `admin-api` чекають, поки `db` і `redis` стануть здоровими, а `migrate` завершиться успішно.

## Продакшен на Render

`render.yaml` (Blueprint) описує:

| Сервіс Render | Тип | Звідки |
|---|---|---|
| `fitpulse-api` | Web Service, Docker | `backend/Dockerfile` |
| `fitpulse-admin-api` | Web Service, Docker | `backend-AdminPanel/Dockerfile` |
| `fitpulse-web` | Web Service, Docker (nginx) | `frontend/Dockerfile`, `API_UPSTREAM` = адреса `fitpulse-api` |
| `fitpulse-admin-web` | Web Service, Docker (nginx) | `frontend-AdminPanel/Dockerfile`, `API_UPSTREAM` = адреса `fitpulse-admin-api` |
| `fitpulse-redis` | Key Value (сумісний із Redis) | — |

- База: Postgres через `DATABASE_URL`. Рекомендовано Neon, бо його безкоштовна база не має терміну дії, а безкоштовна Postgres на Render видаляється через 30 днів. Перейти на Render Postgres можна, змінивши лише цю змінну.
- Міграції запускає сам контейнер `fitpulse-api` перед стартом сервера, коли задано `RUN_MIGRATIONS=true`: спершу `prisma migrate deploy`, потім `node dist/server.js`. `preDeployCommand` на безкоштовному тарифі Render недоступний. Адмін-API міграцій не запускає.
- Health check кожного бекенду — `/api/health`.
- Безкоштовні сервіси Render засинають після 15 хвилин без запитів, і перший запит після цього чекає близько хвилини. Для застосунку це прийнятно, бо тренування працює офлайн. Для стабільної роботи потрібен платний тариф.
- Секрети (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET`) задаються в панелі Render і не лежать у репозиторії.

## CI (GitHub Actions)

На кожен PR і push у `main`:
1. **frontend:** lint, unit-тести, збірка, бюджет розміру бандла, e2e (Playwright), Lighthouse. Усе як зараз, але в `frontend/`.
2. **backends:** lint і typecheck усіх workspaces, `prisma validate`, перевірка «схема = міграції», unit-тести (`npm test`) без бази й Redis, інтеграційні тести (`npm run test:integration`) на service-контейнерах Postgres 17 і Redis 7.
3. **docker:** збірка всіх чотирьох образів. Образ `backend` запускається, і CI чекає, поки `/api/health` відповість.

Деплой робить Render сам після злиття в `main` (auto-deploy з Blueprint). CI не деплоїть.

## Тести етапу 1

- Бекенди: `/api/health` відповідає 200 без бази; `/api/health/ready` відповідає 200, коли Postgres і Redis доступні, і 503, коли ні; невідомий маршрут повертає 404 у спільній формі помилки; невалідний конфіг зупиняє старт із зрозумілим повідомленням.
- База: міграція накочується на чисту базу; email у `User` унікальний без урахування регістру; видалення `User` каскадно видаляє його `Session`; сід створює адміна один раз і не дублює його під час повторного запуску.
- Фронт: усі наявні unit-, e2e- і Lighthouse-перевірки проходять після переїзду в `frontend/`.
- Docker: `docker compose up` піднімає всі сервіси, а `docker compose run --rm api npm test` проходить.

## Що не входить в етап 1

Реєстрація й вхід, синхронізація, інтерфейс адмінки, push, оплата, перенесення каталогу вправ у базу. Також не входить видалення конфігу Vercel: поточний фронт лишається на Vercel, доки Render-версія не запрацює. `vercel.json` переїжджає в `frontend/`, а в налаштуваннях проєкту Vercel Root Directory треба змінити на `frontend`. Після переходу на Render `vercel.json` видаляється окремим PR.

## Документація

`docs/backend.md` переписується під це рішення: стек, структура, Docker, Render, етапи. `docs/architecture.md` і `README.md` отримують нові шляхи й команди запуску.
