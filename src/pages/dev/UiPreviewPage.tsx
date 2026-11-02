import { useState } from 'react'
import { Dumbbell, Flame, Plus, Settings, Timer } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  IconButton,
  Input,
  Modal,
  PageHeader,
  ProgressBar,
  ProgressRing,
  SectionLabel,
  SegmentedControl,
  Select,
  Skeleton,
  Stat,
  Textarea,
  ThemeToggle,
} from '@/shared/ui'

export function UiPreviewPage() {
  const [tab, setTab] = useState<'all' | 'chest' | 'back' | 'legs'>('all')
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-12 pb-16">
      <PageHeader
        index={0}
        eyebrow="Design system"
        title={<>Компоненти<br />інтерфейсу</>}
        description="Вітрина примітивів. Перемкніть тему, щоб перевірити контраст і стани."
        actions={<ThemeToggle />}
      />

      <section className="space-y-6">
        <SectionLabel index={1} rule>
          Кнопки
        </SectionLabel>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Plus />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="lg">Почати тренування</Button>
          <Button size="sm" variant="outline">
            Small
          </Button>
          <IconButton label="Налаштування" icon={<Settings />} />
          <IconButton label="Активна" icon={<Flame />} active />
        </div>
      </section>

      <section className="space-y-6">
        <SectionLabel index={2} rule>
          Бейджі та перемикачі
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary" dot>
            Accent
          </Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge>Neutral</Badge>
          <Badge size="sm">Small</Badge>
        </div>
        <div className="flex flex-wrap items-end gap-8">
          <SegmentedControl
            label="Група м'язів"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'all', label: 'Усі' },
              { value: 'chest', label: 'Груди' },
              { value: 'back', label: 'Спина' },
              { value: 'legs', label: 'Ноги' },
            ]}
          />
          <SegmentedControl
            label="Група м'язів (підкреслення)"
            appearance="underline"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'all', label: 'Усі' },
              { value: 'chest', label: 'Груди' },
              { value: 'back', label: 'Спина' },
              { value: 'legs', label: 'Ноги' },
            ]}
          />
        </div>
      </section>

      <section className="space-y-6">
        <SectionLabel index={3} rule>
          Метрики
        </SectionLabel>
        <Card padding="none" className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x [&>*]:p-6">
          <Stat label="Тоннаж тижня" value="12 480" unit="кг" hint="+8% до минулого" accent size="lg" />
          <Stat label="Тренувань" value="4" unit="/ 5" icon={<Dumbbell />} />
          <Stat label="Час у залі" value="5:20" unit="год" icon={<Timer />} />
          <Stat label="Серія" value="12" unit="днів" icon={<Flame />} />
        </Card>
        <div className="flex flex-wrap items-center gap-10">
          <ProgressRing value={68} label="Відпочинок">
            <span className="font-mono text-3xl font-semibold tabular text-fg">1:24</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-fg-subtle">відпочинок</span>
          </ProgressRing>
          <div className="w-64 space-y-3">
            <ProgressBar value={72} label="Прогрес тижня" />
            <ProgressBar value={40} label="Успіх" tone="success" />
            <ProgressBar value={15} label="Небезпека" tone="danger" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionLabel index={4} rule>
          Форми
        </SectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Вага" type="number" placeholder="80" helperText="Робоча вага в кг" />
          <Input label="Повтори" placeholder="Напр. 10" type="number" defaultValue={0} error="Мінімум 1 повтор" />
          <Select
            label="Рівень"
            options={[
              { value: 'beginner', label: 'Новачок' },
              { value: 'advanced', label: 'Досвідчений' },
            ]}
          />
          <Textarea label="Нотатки" placeholder="Як пройшло тренування?" className="sm:col-span-3" />
        </div>
      </section>

      <section className="space-y-6">
        <SectionLabel index={5} rule>
          Стани
        </SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <EmptyState
            icon={<Dumbbell />}
            title="Немає тренувань"
            description="Створіть першу програму, щоб почати."
            action={<Button icon={<Plus />}>Нова програма</Button>}
          />
          <Card className="space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Divider className="my-4" />
            <Button variant="outline" onClick={() => setOpen(true)}>
              Відкрити діалог
            </Button>
          </Card>
        </div>
      </section>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        eyebrow="/ 02 Груди"
        title="Жим лежачи"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={() => setOpen(false)}>Додати</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-fg-muted">Фокус залишається всередині діалогу, Esc закриває.</p>
          <Input label="Підходи" placeholder="Напр. 4" type="number" defaultValue={4} />
        </div>
      </Modal>
    </div>
  )
}
