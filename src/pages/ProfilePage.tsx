import React, { useEffect, useState } from 'react'
import { User, Edit, RotateCcw, Calendar, Target, Activity } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  fetchProfile,
  updateProfileAsync,
  resetProfileAsync,
} from '@/features/profile/model/profileSlice'
import type { UserProfile } from '@/features/profile/model/types'
import { FITNESS_GOAL_LABELS, ACTIVITY_LEVEL_LABELS } from '@/features/profile/model/types'
import { BMISummary } from '@/features/profile/components/BMISummary'
import { ProfileEditModal } from '@/features/profile/components/ProfileEditModal'
import { Card, PageHeader } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { formatDate } from '@/utils/formatters'
import { STORAGE_KEYS, removeFromStorage, saveToStorage } from '@/services/storage/localStorage'
import { SEO } from '@/components/common/SEO'

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const profile = useAppSelector((state) => state.profile.profile)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    
    dispatch(fetchProfile())
  }, [dispatch])

  const handleUpdateProfile = async (updated: UserProfile) => {
    await dispatch(updateProfileAsync(updated)).unwrap()
  }

  const handleResetAllData = async () => {
    if (
      window.confirm(
        'Ви впевнені, що бажаєте скинути всі дані додатку (вправи, плани, журнал та профіль) до стандартних значень?',
      )
    ) {
      Object.values(STORAGE_KEYS).forEach((k) => removeFromStorage(k))
      // Гарантуємо очищення історії та персональних рекордів при скиданні
      saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, [])
      saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, {})
      await dispatch(resetProfileAsync()).unwrap()
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <SEO title="Особистий профіль" description="Антропометрія, цільова вага, рівень навантажень та норми калоражу." />
      <PageHeader
        index={5}
        eyebrow="Атлет"
        title="Профіль"
        description="Антропометрія, цільова вага, рівень навантажень та норми калоражу"
        actions={
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)} icon={<Edit />}>
            Редагувати
          </Button>
        }
      />

      {/* Main Profile Info Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 border-accent/40 shadow-2xl bg-bg">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-fg-muted">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent border-2 border-surface flex items-center justify-center text-xs text-on-accent font-black">
              ✓
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-fg">{profile.name}</h2>
              <Badge variant="primary" dot size="sm">
                {FITNESS_GOAL_LABELS[profile.fitnessGoal]}
              </Badge>
            </div>

            <p className="text-xs font-semibold text-fg-muted">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-fg-muted font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                У додатку з: {formatDate(profile.joinedDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-accent" />
                {ACTIVITY_LEVEL_LABELS[profile.activityLevel]}
              </span>
            </div>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-line">
          <div className="p-4 bg-surface-2 rounded-lg border border-line text-center">
            <span className="text-fg-muted text-xs font-bold uppercase tracking-wider block mb-1">Вік</span>
            <span className="text-xl font-display font-black text-fg">{profile.age} р.</span>
          </div>

          <div className="p-4 bg-surface-2 rounded-lg border border-line text-center">
            <span className="text-fg-muted text-xs font-bold uppercase tracking-wider block mb-1">Зріст</span>
            <span className="text-xl font-display font-black text-fg">{profile.heightCm} см</span>
          </div>

          <div className="p-4 bg-surface-2 rounded-lg border border-line text-center">
            <span className="text-fg-muted text-xs font-bold uppercase tracking-wider block mb-1">Поточна вага</span>
            <span className="text-xl font-display font-black text-fg">
              {profile.weightKg} кг
            </span>
          </div>

          <div className="p-4 bg-surface-2 rounded-lg border border-line text-center">
            <span className="text-fg-muted text-xs font-bold uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
              <Target className="w-3.5 h-3.5 text-accent" />
              Цільова
            </span>
            <span className="text-xl font-display font-black text-accent">
              {profile.targetWeightKg} кг
            </span>
          </div>
        </div>
      </Card>

      {/* BMI and Nutrition Calculator */}
      <BMISummary profile={profile} />

      {/* Reset zone */}
      <Card className="border-danger/30 bg-danger-soft p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-danger">Скинути всі дані трекера</h4>
            <p className="text-xs text-fg-muted mt-1 font-medium">
              Повертає початкові вправи, стандартні плани тренувань та очищає історію занять.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleResetAllData}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Скинути до стандартних
          </Button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />
    </div>
  )
}
