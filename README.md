# 🏋️‍♂️ FitPulse — Трекер та Планувальник Тренувань

> **Сучасний веб-додаток для силових тренувань, планування сплітів та біомеханіки вправ**  
> Стек: **React 19**, **Redux Toolkit 2**, **TypeScript (Strict Mode)**, **Vite**, **Tailwind CSS v4**, **React Router v7**, **Lucide Icons**, **Vitest**

[![Live Demo](https://img.shields.io/badge/🔥_Live_Demo-fit--pulse--beta--opal.vercel.app-38bdf8?style=for-the-badge&logo=vercel&labelColor=090d16)](https://fit-pulse-beta-opal.vercel.app)
[![Build & Tests](https://img.shields.io/badge/Build_%26_Tests-Passing-22c55e?style=for-the-badge&logo=github-actions&labelColor=090d16)](https://github.com/tsukanovSerhii/FitPulse/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-3178c6?style=for-the-badge&logo=typescript&labelColor=090d16)](https://www.typescriptlang.org)

---

## 📌 Про проект

**FitPulse** — повнофункціональний, мінімалістичний додаток для силових тренувань у залі та вдома. Створено для практичного щоденного використання атлетами, які цінують чіткість, правильну біомеханіку та відсутність зайвого візуального шуму.

FitPulse дозволяє:
- Планувати щотижневі тренувальні розклади та спліти (Push/Pull/Legs, Full Body тощо).
- Вести інтерактивні сесії в реальному часі: секундомір, фіксація ваги, повторень і таймер відпочинку зі звуковими сигналами.
- Зберігати активну сесію при випадковому перезавантаженні сторінки без втрати поточного прогресу підходів.
- Вивчати правильну техніку вправ через фотографічний плеєр рухів з реальними кадрами атлета та 3D-анімацію кінематичного манекена.
- Аналізувати навантаження, відстежувати тоннаж і фіксувати достовірні особисті рекорди (PRs) з автоматичним перерахунком при коригуванні чи видаленні тренувань.
- Розраховувати ІМТ та добову норму калорій за формулою Міффліна-Сан Жеора.

---

## 🌐 Живе демо

🔗 **[https://fit-pulse-beta-opal.vercel.app](https://fit-pulse-beta-opal.vercel.app)**

> Деплой на Vercel підключено через пряму GitHub-інтеграцію репозиторію. Перед цим кожен пуш у `main` проходить перевірку GitHub Actions CI (Linter → Automated Unit Tests → Strict Type Check & Build).

---

## ✨ Основні можливості

### 1. Каталог вправ та Інтерактивна Анатомія
- Детальна база вправ на всі групи м'язів (*груди, спина, ноги, плечі, біцепс, трицепс, прес, кардіо, сідниці, гомілки*).
- **Інтерактивна векторна карта м'язів (MuscleMap)**: анатомічний силует (спереду та ззаду) з динамічним підсвічуванням первинних м'язів та м'язів-синергістів з відсотковим розподілом навантаження.
- **Плеєр фаз руху (ExerciseMotionPlayer)**: покрокова фотографічна та анімована демонстрація виконання вправи по фазах (*Вихідне положення, Опускання / Ексцентрика, Пікове скорочення, Підйом / Концентрика*), індикатор дихання (*Вдих / Видих / Затримка*), рекомендований темп (`3-0-1-0`) і тренерські підказки.
- **Двоступенева система рекомендацій**: типові помилки (❌), безпека суглобів для новачків (🔰) та прийоми прогресивного перевантаження для досвідчених атлетів (⚡).
- Фільтрація за групою м'язів, рівнем складності та обладнанням; повнотекстовий пошук.
- Додавання кастомних вправ, збереження улюблених (Favorites).

### 2. Планувальник тренувань та надійний Persistence
- Створення, редагування та видалення тижневих програм (Пн–Нд).
- Готові шаблони за замовчуванням (*"Push / Pull / Legs"*, *"Full Body для початківців"*).
- Додавання, зміна порядку та налаштування вправ через ізольовані асинхронні Redux Thunks (`addExerciseToDay`, `removeExerciseFromDay`, `updatePlanExercise`) з глибокою серіалізацією даних — жодних помилок Immer draft proxies.
- Підтримка навмисно порожнього стану: видалення всіх програм зберігається у сховищі і не відновлює автоматично демонстраційні дані.

### 3. Активне тренування в реальному часі
- Секундомір загальної тривалості тренування.
- Покрокова навігація по запланованих вправах.
- **Збереження активної сесії**: навіть якщо випадково закрити чи перезавантажити вкладку, поточне тренування, час та зафіксовані підходи відновлюються зі сховища.
- **Валідація підходів**: гарантована фільтрація від'ємних значень або помилкових даних для ваги та повторень перед фіксацією тоннажу.
- **Автоматичний таймер відпочинку**: точний секундний таймер з коректним скиданням стану `isRunning=false` при досягненні нуля, кнопки швидкого додавання/віднімання часу, перемикач звукового сигналу (Web Audio API) та ручний `▶ Старт / ⏸ Пауза`.
- **Безпечне завершення та скасування**: захист від випадкового скидання сесії через підтверджувальний діалог.

### 4. Аналітика та достовірні особисті рекорди (PRs)
- Зведена статистика: кількість проведених тренувань, загальний піднятий тоннаж, час у залі.
- **Математично достовірні рекорди**: максимальна вага фіксується разом із фактичною кількістю повторень, виконаних саме з цією вагою (`repsAtMaxWeight`).
- **Синхронізація при видаленні**: при видаленні тренування з історії персональні рекорди автоматично перераховуються на основі залишкових сесій, видаляючи неактуальні значення.
- Очищення всієї історії залишає журнал та рекорди порожніми без повернення демо-даних.

### 5. Особистий профіль та здоров'я
- Антропометричні дані: вік, стать, зріст, поточна та цільова вага, рівень активності.
- Калькулятор **ІМТ / BMI** з категоріями ВООЗ та здоровим діапазоном.
- Розрахунок добової норми калорій (BMR & TDEE) за формулою Міффліна — Сан Жеора.
- Опція повного скидання даних додатку.

### 6. Теми оформлення
- Підтримка темної (Dark) та світлої (Light) тем з інтерактивною кнопкою в Navbar, плавними переходами та збереженням у localStorage.

### 7. Централізована ініціалізація даних
- Забезпечено пряме відкриття будь-якого внутрішнього URL (наприклад, `/workout`, `/plans`, `/exercises`) у новій вкладці з автоматичним завантаженням каталогу та синхронізацією обраного плану.

---

## 🏛 Архітектура та структура проекту

```text
FitPulse/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions: Lint → Vitest Tests → Build
├── tests/
│   └── businessLogic.test.ts    # Автоматизовані регресійні тести persistence та PRs
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
│   │       └── Navbar.tsx             # Меню, перемикач теми, статус тренування
│   ├── features/
│   │   ├── exercises/           # Каталог вправ
│   │   ├── workoutPlan/         # Планувальник програм
│   │   ├── workoutSession/      # Активна сесія тренування
│   │   ├── progress/            # Аналітика, журнал та PRs
│   │   ├── profile/             # Профіль та калькулятор ІМТ
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
│   │   └── storage/             # Безпечний localStorage-прошарок
│   ├── utils/
│   │   ├── audio.ts             # Web Audio API сигнал таймера
│   │   ├── bmi.ts
│   │   ├── formatters.ts
│   │   └── seo.ts
│   ├── App.tsx                  # DataInitializer + Router
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.app.json            # TypeScript Strict Mode
├── vercel.json                  # SPA-конфігурація для Vercel
└── vite.config.ts
```

---

## ⚡ Управління станом: Redux Toolkit

6 модульних слайсів на `createSlice` + async thunks через `createAsyncThunk`:

| Слайс | Ключові операції |
|:---|:---|
| `exercisesSlice` | `fetchExercises`, `addCustomExercise`, `toggleFavorite`, `setFilter` |
| `workoutPlanSlice` | `fetchPlans`, `savePlanAsync`, `deletePlanAsync`, `setActivePlanAsync`, `addExerciseToDay`, `removeExerciseFromDay`, `updatePlanExercise` |
| `workoutSessionSlice` | `startWorkout`, `finishWorkout`, `cancelWorkout`, `completeSet`, `tickRestTimer`, `toggleRestTimer`, `addRestSeconds`, `skipRestTimer` (з автозбереженням сесії) |
| `progressSlice` | `fetchProgress`, `logWorkoutAsync`, `deleteWorkoutLogAsync` (з автоматичним перерахунком PRs) |
| `profileSlice` | `fetchProfile`, `updateProfileAsync`, `resetProfileAsync` |
| `themeSlice` | Перемикання та збереження Dark/Light теми |

---

## 🚀 Локальний запуск та тестування

### Передумови
**Node.js** ≥ 20.19 або **Node.js** ≥ 22.12+ (LTS)

```bash
# 1. Встановити залежності
npm install

# 2. Запустити локальний dev-сервер
npm run dev
# → http://localhost:5173

# 3. Перевірка якості коду лінтером (0 warnings, 0 errors)
npm run lint

# 4. Запуск автоматизованих бізнес-тестів (Vitest)
npm run test

# 5. Type-Check у строгому режимі та Production Build
npm run build
```

---

## 🌐 Деплой

### Vercel (Production)
1. Підключіть репозиторій до [Vercel](https://vercel.com).
2. Налаштування збірки (визначаються автоматично):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Файл `vercel.json` забезпечує коректну обробку всіх маршрутів SPA при прямих переходах та перезавантаженні сторінок.

---

## 🔄 CI/CD Пайплайн (GitHub Actions)

Кожен `push` у гілку `main` або `pull request` автоматично запускає перевірки:

```text
GitHub Actions Workflow (.github/workflows/ci.yml):
├── 1. Code Quality: npm run lint
├── 2. Automated Tests: npm run test (Vitest)
└── 3. Type-Check & Production Build: npm run build (tsc strict + vite)
```

Після успішного проходження пайплайну оновлена версія автоматично розгортається на Vercel:  
🔗 **[https://fit-pulse-beta-opal.vercel.app](https://fit-pulse-beta-opal.vercel.app)**

---

## 🏆 Стандарти якості

| Критерій | Статус | Деталі |
|:---|:---:|:---|
| **Vite + React 19** | ✅ | Сучасна компонентна архітектура, React Router 7 |
| **TypeScript Strict** | ✅ | Повний строгий режим (`"strict": true`), 0 помилок типів |
| **Автоматизовані тести** | ✅ | 6 тестів бізнес-логіки та persistence (Vitest) |
| **Redux Toolkit 2** | ✅ | Чисті редьюсери, ізольовані async thunks, no draft leaks |
| **0 Lint Errors** | ✅ | Швидкий Oxlint проходить із 0 помилок та 0 попереджень |
| **Надійність даних** | ✅ | Підтримка порожніх станів, перерахунок рекордів, збереження сесії |
| **CI/CD** | ✅ | Повний GitHub Actions CI + Vercel автоматичний деплой |
| **Теми оформлення** | ✅ | Повноцінна підтримка світлої та темної тем через UI |
