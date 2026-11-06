# Onboarding and Real Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A 5-step onboarding after sign-up fills the profile, weekly goal, equipment, joint limits and first program; demo data disappears for new and existing accounts.

**Architecture:** Pure logic in `features/onboarding/lib` (recommendation, demo detection, answer mapping); the page in `pages/onboarding` dispatches existing thunks of the profile, body, progress, exercises and workoutPlan features; a `RequireOnboarding` guard in `app/router` wraps the signed-in layout. Demo cleanup lives in the plans and progress `api/` modules.

**Tech Stack:** React 19, Redux Toolkit, React Router 7, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-07-onboarding-real-data-design.md`

## Global Constraints

- Ranges: age 14–90, height 120–230 cm, weight and target 30–250 kg, days 2–6.
- Goal map: `muscle_gain→muscle`, `fat_loss→fatLoss`, `strength→strength`, `endurance|general_health→general`.
- Experience map: `none→beginner`, `underYear→beginner`, `overYear→intermediate`; activity: 2 → `light`, 3–4 → `moderate`, 5–6 → `active`.
- Home equipment: `['dumbbell', 'bodyweight', 'bands']`; gym: `[]` (everything).
- Demo ids: history `hist-1..3`; plans from the current `workoutPlan/api/seed.ts` with their `updatedAt`.
- New `UserProfile.onboardedAt?: string`; onboarding draft in `SESSION_KEYS.ONBOARDING_DRAFT = 'fitpulse_onboarding_draft_v1'`.
- Feature imports go through public entry points (`@/features/x`, `@/features/x/model`) — lint enforces it.

## Review Focus

1. A user who already edited their profile is never sent to onboarding — `needsOnboarding` test.
2. A demo plan the user edited survives cleanup — cleanup test.
3. Reloading mid-onboarding keeps answers — page test.
4. "Вдома" never recommends a gym-only program — recommend test.
5. The active plan pointing at a removed demo plan is cleared — cleanup test.

---

### Task 1: No demo data, cleanup for existing accounts
**Files:** `features/workoutPlan/api/plansApi.ts`, `features/workoutPlan/api/demo.ts` (new, ids + updatedAt), delete `features/workoutPlan/api/seed.ts`; `features/progress/api/progressApi.ts`, delete `features/progress/api/seed.ts`; tests in `plansApi.test.ts`, `progressApi.test.ts`.
- [ ] Tests: `a new account starts with no plans`, `unchanged demo plans are removed and edited ones kept`, `an active demo plan that was removed is cleared`, `a new account starts with an empty journal`, `demo workouts are removed and records recalculated`.
- [ ] Implement; fix other tests that relied on demo data; full suite green; commit `feat: start new accounts empty and remove demo workouts and programs`.

### Task 2: Onboarding logic
**Files:** `features/onboarding/{index.ts,model/types.ts,lib/recommend.ts,lib/demoProfile.ts,lib/answers.ts}` + tests. Profile keeps `INITIAL_PROFILE` as the placeholder for new accounts.
**Produces:** `OnboardingAnswers { gender; age; heightCm; weightKg; targetWeightKg; goal: FitnessGoal; experience: 'none'|'underYear'|'overYear'; days: 2..6; place: 'gym'|'home'; limits: Joint[] }`; `recommendTemplates(templates, answers): PlanTemplate[]` (3); `needsOnboarding(profile): boolean`; `profileFromAnswers(profile, answers, now): UserProfile` (sets `onboardedAt`), `equipmentFor(place): Equipment[]`, `activityFor(days): ActivityLevel`.
- [ ] Tests per spec; implement; commit `feat(onboarding): program recommendation and who needs onboarding`.

### Task 3: Onboarding page and guard
**Files:** `pages/onboarding/OnboardingPage.tsx` (+ test), `app/router/guards.tsx` (`RequireOnboarding`), `app/router/AppRoutes.tsx`, `pages/meta.ts`.
- Completion dispatches: `updateProfileAsync(profileFromAnswers…)`, `addBodyEntry({ date, weightKg })`, `setWeeklyGoal(days)`, `setMyEquipment`, `setMyLimits`, and for a chosen template `savePlanAsync(planFromTemplate(t, { days }))` + `setActivePlanAsync(id)`; then navigate `/`.
- [ ] Tests: `next is blocked without a weight`, `answers survive a reload`, `finishing saves profile, weight, goal, equipment, limits and the chosen plan`, `a user who has not finished onboarding is sent there from /`.
- [ ] Implement; commit `feat(onboarding): five-step questionnaire after sign-up`.

### Task 4: Dashboard first-workout state
**Files:** `features/dashboard/components/FirstWorkoutCard.tsx`, `pages/dashboard/DashboardPage.tsx` (+ test).
- [ ] Test: `with no workouts the dashboard invites the first one`; implement; commit `feat(dashboard): invite the first workout instead of demo history`.

### Task 5: E2E and docs
**Files:** `e2e/helpers.ts` (`signUp` finishes onboarding choosing the first program), new `e2e/onboarding.spec.ts`, README features note.
- [ ] E2E: `a new user answers the questionnaire and lands on the dashboard with the chosen program`; push; CI green; commit `test(e2e): sign-up goes through onboarding`.
