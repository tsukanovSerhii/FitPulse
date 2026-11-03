import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layout/MainLayout'
import { GuestOnly, RequireAuth } from './guards'
// Every page is its own chunk, so the entry holds only the shell and the user downloads what they open.
const page = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })))

const LandingPage = page(() => import('@/pages/landing/LandingPage'), 'LandingPage')
const LoginPage = page(() => import('@/pages/login/LoginPage'), 'LoginPage')
const RegisterPage = page(() => import('@/pages/register/RegisterPage'), 'RegisterPage')
const DashboardPage = page(() => import('@/pages/dashboard/DashboardPage'), 'DashboardPage')
const ExercisesPage = page(() => import('@/pages/exercises/ExercisesPage'), 'ExercisesPage')
const WorkoutPlansPage = page(() => import('@/pages/plans/WorkoutPlansPage'), 'WorkoutPlansPage')
const ActiveWorkoutPage = page(() => import('@/pages/workout/ActiveWorkoutPage'), 'ActiveWorkoutPage')
const ProgressPage = page(() => import('@/pages/progress/ProgressPage'), 'ProgressPage')
const JournalPage = page(() => import('@/pages/progress/JournalPage'), 'JournalPage')
const ProfilePage = page(() => import('@/pages/profile/ProfilePage'), 'ProfilePage')
const NotFoundPage = page(() => import('@/pages/not-found/NotFoundPage'), 'NotFoundPage')
const UiPreviewPage = page(() => import('@/pages/ui-kit/UiPreviewPage'), 'UiPreviewPage')

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="welcome" element={<LandingPage />} />
        <Route
          path="login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="plans" element={<WorkoutPlansPage />} />
          <Route path="workout" element={<ActiveWorkoutPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="progress/journal" element={<JournalPage />} />
          <Route path="profile" element={<ProfilePage />} />
          {import.meta.env.DEV && <Route path="dev/ui" element={<UiPreviewPage />} />}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
