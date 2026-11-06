import { useRef } from 'react'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/store/hooks'
import { Button, confirmAction } from '@/shared/ui'
import { downloadFile } from '@/shared/lib/download'
import { BackupError, createBackup, historyToCsv, parseBackup, restoreBackup } from '../lib/backup'

const today = () => new Date().toISOString().slice(0, 10)

export function BackupSection() {
  const history = useAppSelector((state) => state.progress.history)
  const inputRef = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    downloadFile(`fitpulse-backup-${today()}.json`, JSON.stringify(createBackup(), null, 2), 'application/json')
    toast.success('Резервну копію збережено')
  }

  const exportCsv = () => {
    downloadFile(`fitpulse-journal-${today()}.csv`, historyToCsv(history), 'text/csv;charset=utf-8')
  }

  const importFile = async (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = ''
    if (!file) return
    try {
      const backup = parseBackup(await file.text())
      const confirmed = await confirmAction({
        title: 'Відновити з резервної копії?',
        description: `${backup.exportedAt ? `Копія від ${new Date(backup.exportedAt).toLocaleDateString('uk-UA')}. ` : ''}Поточні дані акаунта буде замінено.`,
        confirmLabel: 'Відновити',
        destructive: true,
      })
      if (!confirmed) return
      restoreBackup(backup)
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof BackupError ? error.message : 'Не вдалося прочитати файл')
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p className="text-sm font-semibold text-fg">Резервна копія</p>
        <p className="text-xs text-fg-subtle">Поки дані зберігаються лише в браузері, копія захищає їх від очищення.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" icon={<Download />} onClick={exportJson}>
          JSON
        </Button>
        <Button variant="outline" size="sm" icon={<FileSpreadsheet />} onClick={exportCsv} disabled={history.length === 0}>
          Журнал CSV
        </Button>
        <Button variant="ghost" size="sm" icon={<Upload />} onClick={() => inputRef.current?.click()}>
          Відновити
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => importFile(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}
