import { useEffect, useState, type ReactNode } from 'react'
import { LogOut, Pencil, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge, Button, Card, IconButton, PageHeader, Stat, ThemeToggle, confirmAction } from '@/shared/ui'
import { BMISummary, ProfileEditModal, ProfileSkeleton, fetchProfile, resetProfileAsync, updateProfileAsync, type UserProfile, ACTIVITY_LEVEL_LABELS, FITNESS_GOAL_LABELS, AvatarUploader } from '@/features/profile'
import { PLAN_NAMES } from '@/features/subscription'
import { logout, syncAccount } from '@/features/auth'
import { removeFromStorage, saveToStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'
import { formatDate, formatNumber } from '@/shared/lib/formatters'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-sans text-xs font-bold tracking-[0.16em] text-fg-muted">{title}</h2>
      {children}
    </section>
  )
}

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { profile, status } = useAppSelector((state) => state.profile)
  const isLoading = status === 'idle' || status === 'loading'
  const user = useAppSelector((state) => state.auth.user)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  const handleUpdateProfile = async (updated: UserProfile) => {
    await dispatch(updateProfileAsync(updated)).unwrap()
    if (user) dispatch(syncAccount(user.id, { name: updated.name, email: updated.email }))
  }

  const handleLogout = async () => {
    const ok = await confirmAction({ title: 'Вийти з акаунта?', confirmLabel: 'Вийти' })
    if (!ok) return
    dispatch(logout())
    navigate('/welcome')
  }

  const handleResetAllData = async () => {
    const confirmed = await confirmAction({
      title: 'Скинути всі дані?',
      description: 'Вправи, програми, журнал і профіль повернуться до стандартних значень.',
      confirmLabel: 'Скинути',
      destructive: true,
    })
    if (!confirmed) return
    const keepKeys: string[] = [STORAGE_KEYS.ACCOUNTS, STORAGE_KEYS.SESSION, STORAGE_KEYS.THEME]
    Object.values(STORAGE_KEYS)
      .filter((k) => !keepKeys.includes(k))
      .forEach((k) => removeFromStorage(k))
    saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, [])
    saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, {})
    await dispatch(resetProfileAsync()).unwrap()
    window.location.reload()
  }

  const weightDelta = Number((profile.targetWeightKg - profile.weightKg).toFixed(1))

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SEO title="Профіль" description="Антропометрія, ціль, ІМТ і налаштування." />

      <PageHeader
        compact
        title="Профіль"
        actions={
          <>
            <IconButton label="Редагувати профіль" icon={<Pencil />} onClick={() => setIsEditModalOpen(true)} className="border border-line sm:hidden" />
            <Button variant="outline" className="hidden sm:inline-flex" onClick={() => setIsEditModalOpen(true)} icon={<Pencil />}>
              Редагувати
            </Button>
          </>
        }
      />

      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <>
          <Card padding="none">
            <div className="flex items-center gap-4 p-5 sm:p-6">
              {user ? <AvatarUploader user={user} name={profile.name} /> : <Avatar name={profile.name} className="size-20" />}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-lg font-semibold text-fg">{profile.name}</p>
                <p className="truncate text-sm text-fg-subtle">{profile.email}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="primary" size="sm">
                    {FITNESS_GOAL_LABELS[profile.fitnessGoal]}
                  </Badge>
                  <span className="text-xs text-fg-subtle">з {formatDate(profile.joinedDate)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4 [&>*]:border-line [&>*]:p-4 sm:[&>*]:p-5 [&>*:nth-child(odd)]:border-r sm:[&>*:not(:last-child)]:border-r [&>*:nth-child(-n+2)]:border-b sm:[&>*:nth-child(-n+2)]:border-b-0">
              <Stat label="Вік" value={profile.age} unit="р." />
              <Stat label="Зріст" value={profile.heightCm} unit="см" />
              <Stat label="Вага" value={formatNumber(profile.weightKg, 1)} unit="кг" />
              <Stat
                label="Ціль"
                value={formatNumber(profile.targetWeightKg, 1)}
                unit="кг"
                accent
                hint={weightDelta === 0 ? 'досягнуто' : `${weightDelta > 0 ? '+' : ''}${formatNumber(weightDelta, 1)} кг`}
              />
            </div>
          </Card>

          <Section title="Індекс маси тіла">
            <Card>
              <BMISummary profile={profile} />
            </Card>
          </Section>
        </>
      )}

      <Section title="Налаштування">
        <Card padding="none" className="divide-y divide-line">
          <div className="flex items-center justify-between gap-4 p-4 sm:px-6">
            <span className="text-sm text-fg">Тема</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between gap-4 p-4 sm:px-6">
            <span className="text-sm text-fg">Активність</span>
            <span className="text-right text-sm text-fg-muted">{ACTIVITY_LEVEL_LABELS[profile.activityLevel]}</span>
          </div>
        </Card>
      </Section>

      <Section title="Акаунт">
        <Card padding="none" className="divide-y divide-line">
          <div className="flex items-center justify-between gap-4 p-4 sm:px-6">
            <div>
              <p className="text-sm text-fg">Тариф</p>
              <p className="text-xs text-fg-subtle">Pro і «Тренер» з'являться незабаром</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="primary">{PLAN_NAMES[user?.plan ?? 'free']}</Badge>
              <Link to="/welcome#pricing" className="text-sm font-semibold text-accent hover:text-accent-hover">
                Тарифи
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 p-4 sm:px-6">
            <span className="text-sm text-fg">{user?.email ?? profile.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut />}>
              Вийти
            </Button>
          </div>
        </Card>
      </Section>

      <Section title="Дані">
        <div className="flex flex-col gap-3 rounded-lg border border-danger/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold text-fg">Скинути всі дані</p>
            <p className="text-xs text-fg-subtle">Стандартні вправи й програми, порожній журнал.</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleResetAllData} icon={<RotateCcw />}>
            Скинути
          </Button>
        </div>
      </Section>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />
    </div>
  )
}
