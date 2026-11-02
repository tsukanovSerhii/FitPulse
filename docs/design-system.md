# Дизайн-система

Напрям «Athletic Editorial»: темна або світла нейтральна база, один теплий золотий акцент, великі стиснуті заголовки.

## Токени

Описані в [src/index.css](../src/index.css) у три шари:

1. **Примітиви**: конкретні кольори.
2. **Семантичні змінні**: `--bg`, `--surface`, `--surface-2`, `--line`, `--line-strong`, `--fg`, `--fg-muted`, `--fg-subtle`, `--accent`, `--accent-hover`, `--accent-soft`, `--on-accent`, `--success`, `--danger`, `--warning`, `--info` і їхні `-soft` варіанти.
3. **Утиліти Tailwind** через `@theme inline`: `bg-surface`, `text-fg-muted`, `border-line` тощо.

Компоненти використовують лише семантичні класи. Тема перемикається зміною змінних, код компонентів не змінюється.

## Кольорові ролі

| Роль | Клас | Де |
|---|---|---|
| Дія | суцільний `bg-accent` + `text-on-accent` | лише кнопки й посилання-кнопки |
| Поточне | контур `border-accent`, текст `text-accent` | сьогоднішній день, поточний підхід |
| Виконано | `bg-success-soft`, `text-success`, іконка галочки | завершені дні, підходи, вправи |
| Заплановано | `border-line-strong`, `text-fg` | дні з тренуванням |
| Неактивне | `border-line`, `text-fg-subtle` | дні відпочинку, майбутні підходи |

Суцільна золота заливка завжди означає «натисни». Стани не використовують її, щоб не плутатися з кнопками. Готові класи — у [statusStyles.ts](../src/components/ui/statusStyles.ts): `statusStyles.done`, `.current`, `.planned`, `.idle` і `progressFill(complete)` для смуг прогресу.

Контраст тексту відповідає WCAG AA в обох темах.

## Типографіка

| Шрифт | Роль |
|---|---|
| Oswald | заголовки, великі цифри на лендингу |
| Manrope | основний текст і інтерфейс |
| JetBrains Mono | вага, повтори, таймери, номери |

Для чисел у таблицях використовується клас `tabular`.

## Компоненти (`src/components/ui`)

Button, IconButton, Card, Badge, Checkbox, Input, Select, Textarea, Field, SearchInput, NumberStepper, SegmentedControl, Modal, ThemeToggle, SectionLabel, Stat, ProgressBar, ProgressRing, Skeleton, EmptyState, PageHeader, Divider, `confirmAction()`.

Принципи:

- без сторонніх UI-бібліотек: усе написано вручну;
- Modal рендериться через портал і тримає фокус усередині;
- SegmentedControl керується стрілками (roving tabindex);
- підтвердження й сповіщення показуються тостами `sonner`, а не `alert`/`confirm`;
- кожне поле має `label` і `placeholder`.

Усі компоненти в обох темах можна переглянути на `/dev/ui` у dev-режимі.

## Рух

Анімації короткі (150–300 мс) і вимикаються при `prefers-reduced-motion`.
