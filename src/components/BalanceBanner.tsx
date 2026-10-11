import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isDemoActive } from '../demo/demoState'
import { notesSignature, weekBalance, type BalanceLimits } from '../lib/balance'
import { dishDisplayName } from '../lib/dishes'
import { weekdayShort, type MealType } from '../lib/planner'
import type { SlotWithDetails } from '../lib/plannerQueries'

const KEY = (weekStart: string) => `homefood.balance.${weekStart}`

function readDismissed(weekStart: string): string | null {
  try {
    return localStorage.getItem(KEY(weekStart))
  } catch {
    return null
  }
}

/** A gentle, dismissible note for the Planner and Admin when the week looks unbalanced. It comes back only if what it says changes. */
export function BalanceBanner({ slots, weekStart, today, meals, limits, checkVegetables }: { slots: SlotWithDetails[]; weekStart: string; today: string; meals: MealType[]; limits: BalanceLimits; checkVegetables: boolean }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const notes = useMemo(() => weekBalance(slots, limits, { weekStart, today, meals, checkVegetables }), [slots, limits, weekStart, today, meals, checkVegetables])
  const signature = notesSignature(notes)
  const [dismissed, setDismissed] = useState<Record<string, string>>({})
  const shownDismissal = dismissed[weekStart] ?? (isDemoActive() ? null : readDismissed(weekStart))

  if (notes.length === 0 || shownDismissal === signature) return null

  const listFormat = new Intl.ListFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { style: 'long', type: 'conjunction' })

  function dismiss() {
    setDismissed((d) => ({ ...d, [weekStart]: signature }))
    if (isDemoActive()) return
    try {
      localStorage.setItem(KEY(weekStart), signature)
    } catch {
      /* ignore: it simply shows again next visit */
    }
  }

  const lines = notes.map((n) => {
    switch (n.kind) {
      case 'sameMain':
        return { key: `m-${n.dish.id}`, text: t('balance.sameMain', { dish: dishDisplayName(n.dish, n.dish.dish_names, lang), count: n.count }) }
      case 'fried':
        return { key: 'fried', text: t('balance.fried', { count: n.count }) }
      case 'noVegetable':
        return { key: 'veg', text: t('balance.noVegetable', { count: n.dates.length, days: listFormat.format(n.dates.map((d) => weekdayShort(d, lang))) }) }
      case 'eatingOut':
        return { key: 'out', text: t('balance.eatingOut', { count: n.count }) }
    }
  })

  return (
    <section role="note" aria-label={t('balance.title')} className="flex flex-col gap-1.5 rounded-2xl border border-saffron/40 bg-saffron-tint py-2.5 pl-3.5 pr-1.5 print:hidden">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-semibold text-saffron-ink">{t('balance.title')}</h2>
        <button type="button" onClick={dismiss} className="min-h-[44px] shrink-0 rounded-xl px-3 text-[13px] font-semibold text-saffron-ink">
          {t('balance.dismiss')}
        </button>
      </div>
      <ul className="-mt-2 flex list-disc flex-col gap-0.5 pb-1.5 pl-4 pr-2.5 text-[13.5px] leading-snug text-ink">
        {lines.map((l) => (
          <li key={l.key}>{l.text}</li>
        ))}
      </ul>
    </section>
  )
}
