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
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { formatDate } from '@/utils/formatters'
import { STORAGE_KEYS, removeFromStorage } from '@/services/storage/localStorage'

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
      await dispatch(resetProfileAsync()).unwrap()
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <User className="w-7 h-7 text-purple-400" />
            Особистий профіль
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Керування антропометричними даними, фітнес-цілями та розрахунком норм
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
      <Card className="border-border/80">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-xl shadow-purple-600/20 bg-surface">
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
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-100">{profile.name}</h2>
              <Badge variant="primary" size="sm">
                {FITNESS_GOAL_LABELS[profile.fitnessGoal]}
              </Badge>
            </div>

            <p className="text-xs text-slate-400">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                У додатку з: {formatDate(profile.joinedDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                {ACTIVITY_LEVEL_LABELS[profile.activityLevel]}
              </span>
            </div>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
          <div className="p-3 bg-surface rounded-xl border border-border text-center">
            <span className="text-slate-400 text-xs block mb-1">Вік</span>
            <span className="text-lg font-bold text-slate-100">{profile.age} р.</span>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border text-center">
            <span className="text-slate-400 text-xs block mb-1">Зріст</span>
            <span className="text-lg font-bold text-slate-100">{profile.heightCm} см</span>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border text-center">
            <span className="text-slate-400 text-xs block mb-1">Поточна вага</span>
            <span className="text-lg font-bold text-purple-400 font-mono">
              {profile.weightKg} кг
            </span>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border text-center">
            <span className="text-slate-400 text-xs block mb-1 flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-indigo-400" />
              Цільова вага
            </span>
            <span className="text-lg font-bold text-indigo-400 font-mono">
              {profile.targetWeightKg} кг
            </span>
          </div>
        </div>
      </Card>

      {/* BMI and Nutrition Calculator */}
      <BMISummary profile={profile} />

      {/* Dangerous / Reset zone */}
      <Card className="border-rose-500/30 bg-rose-500/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-300">Скинути всі дані трекера</h4>
            <p className="text-xs text-slate-400 mt-0.5">
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
