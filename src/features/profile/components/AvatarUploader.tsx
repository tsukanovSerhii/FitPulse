import { useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/hooks'
import { Avatar } from '@/components/layout/Avatar'
import { Button, IconButton } from '@/components/ui'
import { setAvatar } from '@/features/auth/model/authSlice'
import type { AuthUser } from '@/features/auth/model/types'
import { toSquareDataUrl, validateImageFile } from '@/utils/image'

export function AvatarUploader({ user, name }: { user: AuthUser; name: string }) {
  const dispatch = useAppDispatch()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const problem = validateImageFile(file)
    if (problem) {
      toast.error(problem)
      return
    }
    setBusy(true)
    try {
      dispatch(setAvatar(user.id, await toSquareDataUrl(file)))
      toast.success('Фото оновлено')
    } catch {
      toast.error('Не вдалося обробити зображення')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative cursor-pointer rounded-full"
        aria-label="Змінити фото профілю"
      >
        <Avatar src={user.avatarUrl} name={name} className="size-20" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-overlay text-on-photo opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-5" aria-hidden="true" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" isLoading={busy} onClick={() => inputRef.current?.click()}>
          {user.avatarUrl ? 'Змінити' : 'Додати фото'}
        </Button>
        {user.avatarUrl && (
          <IconButton size="sm" label="Видалити фото" icon={<Trash2 />} onClick={() => dispatch(setAvatar(user.id, undefined))} />
        )}
      </div>
    </div>
  )
}
