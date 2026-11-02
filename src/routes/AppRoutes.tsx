import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { GuestOnly, RequireAuth } from '@/features/auth/components/RouteGuards'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// The landing page ships in the main bundle; app pages load on demand after login.
const page = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })))

const DashboardPage = page(() => import('@/pages/DashboardPage'), 'DashboardPage')
const ExercisesPage = page(() => import('@/pages/ExercisesPage'), 'ExercisesPage')
const WorkoutPlansPage = page(() => import('@/pages/WorkoutPlansPage'), 'WorkoutPlansPage')
const ActiveWorkoutPage = page(() => import('@/pages/ActiveWorkoutPage'), 'ActiveWorkoutPage')
const ProgressPage = page(() => import('@/pages/ProgressPage'), 'ProgressPage')
const ProfilePage = page(() => import('@/pages/ProfilePage'), 'ProfilePage')
const NotFoundPage = page(() => import('@/pages/NotFoundPage'), 'NotFoundPage')
const UiPreviewPage = page(() => import('@/pages/dev/UiPreviewPage'), 'UiPreviewPage')

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
          <Route path="profile" element={<ProfilePage />} />
          {import.meta.env.DEV && <Route path="dev/ui" element={<UiPreviewPage />} />}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
