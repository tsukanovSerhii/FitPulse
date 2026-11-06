import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layout/MainLayout'
import { GuestOnly, RequireAuth, RequireOnboarding } from './guards'
// Every page is its own chunk, so the entry holds only the shell and the user downloads what they open.
const page = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })))

const LandingPage = page(() => import('@/pages/landing/LandingPage'), 'LandingPage')
const LoginPage = page(() => import('@/pages/login/LoginPage'), 'LoginPage')
const RegisterPage = page(() => import('@/pages/register/RegisterPage'), 'RegisterPage')
const ForgotPasswordPage = page(() => import('@/pages/forgot-password/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = page(() => import('@/pages/reset-password/ResetPasswordPage'), 'ResetPasswordPage')
const PrivacyPage = page(() => import('@/pages/legal/PrivacyPage'), 'PrivacyPage')
const TermsPage = page(() => import('@/pages/legal/TermsPage'), 'TermsPage')
const CatalogPage = page(() => import('@/pages/public/CatalogPage'), 'CatalogPage')
const PublicExercisePage = page(() => import('@/pages/public/PublicExercisePage'), 'PublicExercisePage')
const PublicProgramPage = page(() => import('@/pages/public/PublicProgramPage'), 'PublicProgramPage')
const DashboardPage = page(() => import('@/pages/dashboard/DashboardPage'), 'DashboardPage')
const ExercisesPage = page(() => import('@/pages/exercises/ExercisesPage'), 'ExercisesPage')
const WorkoutPlansPage = page(() => import('@/pages/plans/WorkoutPlansPage'), 'WorkoutPlansPage')
const ActiveWorkoutPage = page(() => import('@/pages/workout/ActiveWorkoutPage'), 'ActiveWorkoutPage')
const ProgressPage = page(() => import('@/pages/progress/ProgressPage'), 'ProgressPage')
const JournalPage = page(() => import('@/pages/progress/JournalPage'), 'JournalPage')
const BodyPage = page(() => import('@/pages/progress/BodyPage'), 'BodyPage')
const ExerciseHistoryPage = page(() => import('@/pages/progress/ExerciseHistoryPage'), 'ExerciseHistoryPage')
const OnboardingPage = page(() => import('@/pages/onboarding/OnboardingPage'), 'OnboardingPage')
const ProfilePage = page(() => import('@/pages/profile/ProfilePage'), 'ProfilePage')
const NotFoundPage = page(() => import('@/pages/not-found/NotFoundPage'), 'NotFoundPage')
const UiPreviewPage = page(() => import('@/pages/ui-kit/UiPreviewPage'), 'UiPreviewPage')

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="welcome" element={<LandingPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="exercise/:slug" element={<PublicExercisePage />} />
        <Route path="program/:slug" element={<PublicProgramPage />} />
        <Route
          path="login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="forgot-password"
          element={
            <GuestOnly>
              <ForgotPasswordPage />
            </GuestOnly>
          }
        />
        {/* Open from the email link also when signed in on this device */}
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          path="register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />

        <Route
          path="onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <MainLayout />
              </RequireOnboarding>
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="plans" element={<WorkoutPlansPage />} />
          <Route path="workout" element={<ActiveWorkoutPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="progress/journal" element={<JournalPage />} />
          <Route path="progress/exercise/:exerciseId" element={<ExerciseHistoryPage />} />
          <Route path="progress/body" element={<BodyPage />} />
          <Route path="profile" element={<ProfilePage />} />
          {import.meta.env.DEV && <Route path="dev/ui" element={<UiPreviewPage />} />}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
