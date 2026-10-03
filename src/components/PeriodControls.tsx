import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rangeBounds, shiftAnchor, type HistoryRangeKind } from '../lib/history'
import { toISODate } from '../lib/planner'

const today = toISODate(new Date())
const KINDS: HistoryRangeKind[] = ['week', 'month']

/** Week / month with prev-next, never reaching past today — shared by the nutrition screens. */
export function usePeriod(initial: HistoryRangeKind = 'week') {
  const { i18n } = useTranslation()
  const [kind, setKind] = useState<HistoryRangeKind>(initial)
  const [anchor, setAnchor] = useState(today)
  const bounds = rangeBounds(kind, anchor)
  const to = bounds.to < today ? bounds.to : today
  const canGoNext = rangeBounds(kind, shiftAnchor(kind, anchor, 1)).from <= today
  const locale = i18n.language === 'ta' ? 'ta-IN' : 'en-IN'
  const parse = (iso: string) => new Date(`${iso}T00:00:00`)
  const dayFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  const label =
    kind === 'week'
      ? `${dayFmt.format(parse(bounds.from))} – ${dayFmt.format(parse(bounds.to))}`
      : new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(parse(bounds.from))
  return { kind, setKind: (k: HistoryRangeKind) => { setKind(k); setAnchor(today) }, shift: (d: -1 | 1) => setAnchor((a) => shiftAnchor(kind, a, d)), bounds, to, label, canGoNext, today }
}

export function PeriodControls({ period }: { period: ReturnType<typeof usePeriod> }) {
  const { t } = useTranslation()
  const arrow = 'flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white disabled:opacity-40'
  return (
    <>
      <div role="radiogroup" aria-label={t('nutrition.period')} className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={period.kind === k}
            onClick={() => period.setKind(k)}
            className={`h-10 rounded-xl text-[14px] font-semibold ${period.kind === k ? 'bg-white shadow-sm' : 'text-ink-soft'}`}
          >
            {t(`history.${k}`)}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button type="button" className={arrow} aria-label={t('history.previous')} onClick={() => period.shift(-1)}>
          ‹
        </button>
        <span className="font-display text-[16px] font-semibold">{period.label}</span>
        <button type="button" className={arrow} aria-label={t('history.next')} disabled={!period.canGoNext} onClick={() => period.shift(1)}>
          ›
        </button>
      </div>
    </>
  )
}
