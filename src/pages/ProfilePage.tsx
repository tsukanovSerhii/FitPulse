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
import { Card } from '@/components/ui'
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
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-t-d">
        <div>
          <h1 className="text-2xl sm:text-4xl font-heading font-black text-t-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            Особистий профіль
          </h1>
          <p className="text-xs sm:text-sm text-t-3 mt-1 font-medium">
            Антропометрія, цільова вага, рівень навантажень та норми калоражу
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            icon={<Edit className="w-4 h-4" />}
          >
            Редагувати профіль
          </Button>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-sky-500/40 shadow-2xl shadow-sky-500/10 bg-t-page">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sky-500 border-2 border-t-card flex items-center justify-center text-xs text-white font-black shadow-md shadow-sky-950/40">
              ✓
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-t-1">{profile.name}</h2>
              <Badge variant="primary" dot size="sm">
                {FITNESS_GOAL_LABELS[profile.fitnessGoal]}
              </Badge>
            </div>

            <p className="text-xs font-semibold text-slate-400">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-t-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                У додатку з: {formatDate(profile.joinedDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                {ACTIVITY_LEVEL_LABELS[profile.activityLevel]}
              </span>
            </div>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-t-d">
          <div className="p-4 bg-t-subtle rounded-2xl border border-t-d text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Вік</span>
            <span className="text-xl font-heading font-black text-t-1">{profile.age} р.</span>
          </div>

          <div className="p-4 bg-t-subtle rounded-2xl border border-t-d text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Зріст</span>
            <span className="text-xl font-heading font-black text-t-1">{profile.heightCm} см</span>
          </div>

          <div className="p-4 bg-t-subtle rounded-2xl border border-t-d text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Поточна вага</span>
            <span className="text-xl font-heading font-black text-t-1">
              {profile.weightKg} кг
            </span>
          </div>

          <div className="p-4 bg-t-subtle rounded-2xl border border-t-d text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              Цільова
            </span>
            <span className="text-xl font-heading font-black text-sky-300">
              {profile.targetWeightKg} кг
            </span>
          </div>
        </div>
      </Card>

      {/* BMI and Nutrition Calculator */}
      <BMISummary profile={profile} />

      {/* Reset zone */}
      <Card className="border-rose-500/30 bg-rose-500/5 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-300">Скинути всі дані трекера</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">
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
