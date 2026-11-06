const STATS = [
  { value: '18+', label: 'вправ з покроковою технікою' },
  { value: '4', label: 'кроки техніки з демонстрацією' },
  { value: '1', label: 'кнопка, щоб записати підхід' },
  { value: '0 ₴', label: 'щоб почати тренуватися' },
]

export function StatsBand() {
  return (
    <section aria-label="FitPulse у цифрах" className="border-y border-line bg-surface">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-2 px-5 py-10 sm:px-8 lg:py-14 ${i % 2 === 0 ? 'border-r border-line' : ''} ${i < 2 ? 'border-b border-line lg:border-b-0' : ''} ${i === 1 ? 'lg:border-r' : ''}`}
          >
            <dt className="order-2 text-sm text-fg-muted sm:text-base">{stat.label}</dt>
            <dd className="order-1 font-display text-6xl leading-none text-fg sm:text-7xl">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
