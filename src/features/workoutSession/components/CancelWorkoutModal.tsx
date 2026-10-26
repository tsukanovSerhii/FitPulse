import React from 'react'
import { AlertTriangle, ArrowLeft, XCircle } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'

export interface CancelWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmCancel: () => void
}

export const CancelWorkoutModal: React.FC<CancelWorkoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" title="Скасування тренування">
      <div className="space-y-4 py-2">
        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-bold text-white">Ви впевнені, що бажаєте зупинити сесію?</p>
            <p className="text-rose-200/90">
              Поточні записані підходи та таймер буде скинуто. Дані цього тренування не потраплять в аналітику прогресу.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Продовжити тренування
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onConfirmCancel}
            icon={<XCircle className="w-4 h-4" />}
          >
            Так, скасувати
          </Button>
        </div>
      </div>
    </Modal>
  )
}
