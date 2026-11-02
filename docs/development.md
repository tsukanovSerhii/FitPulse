# Розробка

## Скрипти

| Команда | Дія |
|---|---|
| `npm run dev` | dev-сервер Vite |
| `npm run build` | перевірка типів і production-збірка |
| `npm run lint` | oxlint |
| `npm test` | юніт-тести Vitest |
| `npm run preview` | перегляд production-збірки |

Змінні оточення описані в [.env.example](../.env.example): `VITE_ADS_ENABLED` вмикає рекламу, `VITE_SITE_URL` задає домен для canonical і OG-тегів.

## Домовленості щодо коду

- TypeScript у строгому режимі, без `any`.
- Lint без попереджень (`--deny-warnings`).
- Коментарі лише там, де логіка неочевидна, і тільки англійською.
- Без емодзі в коді, інтерфейсі, комітах і документації.
- Тексти інтерфейсу українською.
- Нові кольори — лише через семантичні токени (див. [design-system.md](design-system.md)).
- Дані браузера — лише через `services/storage` (див. [storage.md](storage.md)).

## Git

- Одна тематична гілка на кожен раунд роботи, наприклад `feat/landing-polish`. Усередині — кілька окремих комітів.
- Коміти у форматі Conventional Commits: `feat(scope): ...`, `fix(...)`, `docs(...)`, `chore(...)`. Коротко й по суті; тіло лише за потреби.
- У `main` зміни потрапляють через pull request. Пуш у `main` запускає деплой на Vercel.

## Хуки Claude Code

Налаштовані глобально в `~/.claude/settings.json`, скрипти лежать у `~/.claude/hooks/`:

| Хук | Що робить |
|---|---|
| `lint-file.mjs` (PostToolUse) | після кожної правки файлу запускає oxlint для нього |
| `guard-git.mjs` (PreToolUse) | блокує force push, пуш у `main`/`master`, атрибуцію ШІ та емодзі в комітах |
| `verify-on-stop.mjs` (Stop) | якщо змінювався JS/TS, проганяє `tsc` і тести перед завершенням |

## CI

GitHub Actions ([ci.yml](../.github/workflows/ci.yml)) на кожен push і pull request у `main` запускає lint, тести й збірку на Node 24.

## Тести

Лежать у `tests/` і покривають бізнес-логіку: авторизацію й сесії, валідацію, тему, підсумок тренування й рекорди, пошук програм, тиждень на головній, вибір реклами, перевірку зображень.
