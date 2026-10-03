import { useTranslation } from 'react-i18next'
import type { NutrientKey, Totals } from '../lib/nutrition'

const ROWS: { key: NutrientKey; color: string; unit: string; limit?: boolean }[] = [
  { key: 'protein_g', color: '#2F7A3E', unit: 'g' },
  { key: 'carbs_g', color: '#E08A00', unit: 'g' },
  { key: 'fat_g', color: '#E8742A', unit: 'g' },
  { key: 'fibre_g', color: '#3B4A9C', unit: 'g' },
  { key: 'sugar_g', color: '#9A5BA8', unit: 'g', limit: true },
  { key: 'sodium_mg', color: '#B3261E', unit: 'mg', limit: true },
]

const round = (v: number) => Math.round(v)

/** Average per day against the target. Sugar and sodium are limits, so going over them turns the bar red. */
export function TargetBars({ average, target, percent, compact = false }: { average: Totals; target: Totals; percent: Totals; compact?: boolean }) {
  const { t } = useTranslation()
  const rows = compact ? ROWS.filter((r) => r.key === 'protein_g' || r.key === 'fibre_g') : ROWS
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => {
        const over = r.limit && percent[r.key] > 100
        return (
          <div key={r.key} className="grid grid-cols-[72px_1fr_96px] items-center gap-2.5 text-[13px]">
            <span>{t(`nutrition.n.${r.key}`)}</span>
            <span className="h-2 overflow-hidden rounded-full bg-sand">
              <span className="block h-full rounded-full" style={{ width: `${Math.min(100, percent[r.key])}%`, background: over ? '#B3261E' : r.color }} />
            </span>
            <span className={`text-right text-[12.5px] ${over ? 'font-semibold text-alert' : 'text-ink-soft'}`}>
              {round(average[r.key])} / {round(target[r.key])} {r.unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}
