# 🏋️‍♂️ FitPulse — Трекер та Планувальник Тренувань

> **Сучасний веб-додаток для силових тренувань, планування сплітів та біомеханіки вправ**  
> Стек: **React 19**, **Redux Toolkit 2**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **React Router v7**, **Lucide Icons**

[![Live Demo](https://img.shields.io/badge/🔥_Live_Demo-fit--pulse--beta--opal.vercel.app-38bdf8?style=for-the-badge&logo=vercel&labelColor=090d16)](https://fit-pulse-beta-opal.vercel.app)
[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge&logo=github-actions&labelColor=090d16)](https://github.com/tsukanovSerhii/FitPulse/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript&labelColor=090d16)](https://www.typescriptlang.org)

---

## 📌 Про проект

**FitPulse** — повнофункціональний, мінімалістичний додаток для силових тренувань у залі та вдома. Створено для практичного щоденного використання атлетами, які цінують чіткість, правильну біомеханіку та відсутність зайвого візуального шуму.

FitPulse дозволяє:
- Планувати щотижневі тренувальні розклади та спліти (Push/Pull/Legs, Full Body тощо).
- Вести інтерактивні сесії в реальному часі: секундомір, фіксація ваги, повторень і таймер відпочинку зі звуковими сигналами.
- Вивчати правильну техніку вправ через фотографічний плеєр рухів з реальними кадрами атлета та 3D-анімацію кінематичного манекена.
- Аналізувати навантаження, відстежувати тоннаж і фіксувати особисті рекорди (PRs).
- Розраховувати ІМТ та добову норму калорій за формулою Міффліна-Сан Жеора.

---

## 🌐 Живе демо

🔗 **[https://fit-pulse-beta-opal.vercel.app](https://fit-pulse-beta-opal.vercel.app)**

> Автоматично деплоїться з гілки `main` через **GitHub Actions → Vercel**. Кожен пуш у `main` запускає CI-пайплайн (lint → build → deploy).

---

## ✨ Основні можливості

### 1. Каталог вправ та Інтерактивна Анатомія
- Детальна база вправ на всі групи м'язів (*груди, спина, ноги, плечі, біцепс, трицепс, прес, кардіо, сідниці, гомілки*).
- **Інтерактивна векторна карта м'язів (MuscleMap)**: анатомічний силует (спереду та ззаду) з динамічним підсвічуванням первинних м'язів та м'язів-синергістів з відсотковим розподілом навантаження.
- **Плеєр фаз руху (ExerciseMotionPlayer)**: покрокова фотографічна та анімована демонстрація виконання вправи по фазах (*Вихідне положення, Опускання / Ексцентрика, Пікове скорочення, Підйом / Концентрика*), індикатор дихання (*Вдих / Видих / Затримка*), рекомендований темп (`3-0-1-0`) і тренерські підказки.
- **Двоступенева система рекомендацій**: типові помилки (❌), безпека суглобів для новачків (🔰) та прийоми прогресивного перевантаження для досвідчених атлетів (⚡).
- Фільтрація за групою м'язів, рівнем складності та обладнанням; повнотекстовий пошук.
- Додавання кастомних вправ, збереження улюблених (Favorites).

### 2. Планувальник тренувань
- Створення та редагування тижневих програм (Пн–Нд).
- Готові шаблони за замовчуванням (*"Push / Pull / Legs"*, *"Full Body для початківців"*).
- Налаштування підходів, повторень, ваги, часу відпочинку та нотаток до кожної вправи.
- Позначення активної програми для швидкого старту.

### 3. Активне тренування в реальному часі
- Секундомір загальної тривалості.
- Покрокова навігація по запланованих вправах.
- Фіксація фактичних повторень та ваги для кожного підходу.
- **Автоматичний таймер відпочинку**: відлік назад, прогрес-бар, кнопки `−30с` / `+30с`, **іконка-перемикач звукового сигналу** (Web Audio API) та прямий `▶ Старт / ⏸ Пауза` без автозапуску при налаштуванні часу.
- **Безпечне завершення / скасування тренування** через підтверджувальний модальний діалог.

### 4. Аналітика та особисті рекорди
- Зведена статистика: кількість тренувань, загальний тоннаж, час у залі.
- Автоматичне фіксування **PRs** у кожній вправі.
- Детальний журнал історії з видаленням окремих записів.

### 5. Профіль та здоров'я
- Антропометричні дані: вік, стать, зріст, поточна та цільова вага, рівень активності.
- Калькулятор **ІМТ / BMI** з категоріями ВООЗ.
- Розрахунок добової норми калорій (BMR & TDEE) за метою (*набір маси, схуднення, підтримка*).

### 6. Теми оформлення
- Темна (Dark) та світла (Light) тема з плавним перемиканням і збереженням стану.

### 7. Дизайн-система
- Стримана, висококонтрастна темна естетика (`#090D16`), преміальні поверхні (`#121622`) і спокійний атлетичний акцент **Electric Sky (`#38BDF8`)**.
- Типографіка: **Unbounded** для заголовків та метрик, **Manrope** для інтерфейсу.
- Повна адаптивність: мобайл, планшет, десктоп.

### 8. SEO та семантика
- Динамічне оновлення `<title>`, мета-тегів і Open Graph для кожної сторінки.
- Schema.org JSON-LD (`WebApplication`, `ExerciseAction`) для rich snippets у Google.

---

## 🏛 Архітектура та структура проекту

```text
FitPulse/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions: lint → build на кожен PR та push у main
├── public/
│   ├── _redirects               # SPA-роутинг для Netlify
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/                     # Redux Store
│   │   ├── store.ts
│   │   └── hooks.ts
│   ├── components/              # Загальні UI-компоненти
│   │   ├── common/
│   │   │   ├── AthleteRig.tsx         # Кінематичний 3D-манекен атлета (SVG суглоби)
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ExerciseMotionPlayer.tsx # Плеєр фаз вправи (фото + анімація)
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── MuscleMap.tsx          # Анатомічна SVG-карта м'язів
│   │   │   └── Select.tsx
│   │   └── layout/
│   │       ├── Footer.tsx
│   │       ├── MainLayout.tsx
│   │       └── Navbar.tsx             # Таймер активного тренування, перемикач теми
│   ├── features/
│   │   ├── exercises/           # Каталог вправ
│   │   ├── workoutPlan/         # Планувальник
│   │   ├── workoutSession/      # Активна сесія
│   │   ├── progress/            # Аналітика та PRs
│   │   ├── profile/             # Профіль + ІМТ
│   │   └── theme/               # Dark / Light тема
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ExercisesPage.tsx
│   │   ├── WorkoutPlansPage.tsx
│   │   ├── ActiveWorkoutPage.tsx
│   │   ├── ProgressPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── services/
│   │   ├── mockData/            # Початкові набори даних
│   │   └── storage/             # localStorage-прошарок
│   ├── utils/
│   │   ├── audio.ts             # Web Audio API — сигнал таймера відпочинку
│   │   ├── bmi.ts
│   │   ├── formatters.ts
│   │   └── seo.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vercel.json                  # SPA-редиректи для Vercel
└── vite.config.ts
```

---

## ⚡ Управління станом: Redux Toolkit

6 слайсів на `createSlice` + async thunks через `createAsyncThunk`:

| Слайс | Ключові thunks / reducers |
|:---|:---|
| `exercisesSlice` | `fetchExercises`, `addCustomExercise`, `toggleFavorite`, `setFilter` |
| `workoutPlanSlice` | `fetchPlans`, `savePlanAsync`, `deletePlanAsync`, `setActivePlanAsync`, `addExerciseToDay` |
| `workoutSessionSlice` | `startWorkout`, `finishWorkout`, `cancelWorkout`, `completeSet`, `startRestTimer`, `toggleRestTimer`, `addRestSeconds`, `skipRestTimer` |
| `progressSlice` | `fetchProgress`, `logWorkoutAsync`, `deleteWorkoutLogAsync` |
| `profileSlice` | `fetchProfile`, `updateProfileAsync`, `resetProfileAsync` |
| `themeSlice` | Dark / Light перемикання DOM-класу `light` |

---

## 🚀 Локальний запуск

### Передумови
**Node.js** ≥ 18

```bash
# 1. Встановити залежності
npm install

# 2. Запустити dev-сервер
npm run dev
# → http://localhost:5173

# 3. Перевірка лінтером
npm run lint

# 4. Продакшн-збірка
npm run build
```

---

## 🌐 Деплой

### Vercel (поточний хостинг)

1. Підключіть репозиторій до [Vercel](https://vercel.com).
2. Vercel автоматично визначить Vite-пресет.
3. Налаштування збірки:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Файл `vercel.json` забезпечує коректну обробку SPA-маршрутів при прямих переходах.

### Netlify (альтернатива)

1. **Build command**: `npm run build`
2. **Publish directory**: `dist`
3. Файл `public/_redirects` вирішує 404 при прямих посиланнях.

---

## 🔄 CI/CD: GitHub Actions

Кожен `push` у `main` або `pull request` автоматично запускає пайплайн:

```yaml
# .github/workflows/ci.yml
lint → build
```

Після успішного проходження CI, Vercel автоматично публікує нову версію на:  
🔗 **https://fit-pulse-beta-opal.vercel.app**

---

## 🏆 Стандарти якості

| Критерій | Статус | Деталі |
|:---|:---:|:---|
| **Vite + React 19** | ✅ | Найновіший стек, строгий TypeScript, no `any` |
| **Redux Toolkit 2** | ✅ | 6 слайсів, 10+ async thunks з `pending/fulfilled/rejected` |
| **0 Lint Errors** | ✅ | `npm run lint` та `npm run build` — 0 помилок, 0 попереджень |
| **Біомеханіка** | ✅ | Кінематичний манекен, фотофази руху, карта м'язів |
| **CI/CD** | ✅ | GitHub Actions → Vercel авто-деплой |
| **Адаптивність** | ✅ | Mobile-first, Tailwind CSS v4 |
| **SEO** | ✅ | Open Graph, Twitter Card, Schema.org JSON-LD |
