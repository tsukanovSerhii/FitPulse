import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExercisesPage } from '@/pages/ExercisesPage'
import { WorkoutPlansPage } from '@/pages/WorkoutPlansPage'
import { ActiveWorkoutPage } from '@/pages/ActiveWorkoutPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="plans" element={<WorkoutPlansPage />} />
        <Route path="workout" element={<ActiveWorkoutPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
