import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useDishNutrition } from '../lib/nutritionQueries'
import { useHistorySlots } from '../lib/plannerQueries'
import { ADULT_REFERENCE, familyNotes, percentOf, type NutrientKey } from '../lib/nutrition'
import { ageBand, joinNames } from '../lib/people'
import { toISODate } from '../lib/planner'

const BARS: { key: NutrientKey; color: string; unit: string }[] = [
  { key: 'protein_g', color: '#2F7A3E', unit: 'g' },
  { key: 'carbs_g', color: '#E08A00', unit: 'g' },
  { key: 'fat_g', color: '#E8742A', unit: 'g' },
  { key: 'fibre_g', color: '#3B4A9C', unit: 'g' },
  { key: 'sodium_mg', color: '#B3261E', unit: 'mg' },
]

const num = (v: number) => (Math.round(v * 10) / 10).toString()

/** "Nutrition per serving" on Dish Detail (DishDetail.png): an estimate, shown against an adult's day. */
export function NutritionPanel({ dishId }: { dishId: string }) {
  const { t } = useTranslation()
  const { data: row } = useDishNutrition(dishId)
  if (!row) return null
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold">{t('nutrition.perServing')}</h2>
        {row.is_estimate && <span className="rounded-md bg-sand px-2 py-0.5 text-[11px] font-semibold text-ink-soft">{t('nutrition.estimate')}</span>}
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-[30px] font-bold">{Math.round(row.kcal)}</span>
          <span className="text-[13px] text-ink-soft">{t('nutrition.kcalOfDay', { percent: percentOf(row.kcal, ADULT_REFERENCE.kcal) })}</span>
        </div>
        <p className="-mt-2 text-[12.5px] text-muted">{row.serving}</p>
        <div className="flex flex-col gap-2">
          {BARS.map((b) => (
            <div key={b.key} className="grid grid-cols-[70px_1fr_64px] items-center gap-2.5 text-[13px]">
              <span>{t(`nutrition.n.${b.key}`)}</span>
              <span className="h-2 overflow-hidden rounded-full bg-sand">
                <span className="block h-full rounded-full" style={{ width: `${Math.min(100, percentOf(row[b.key], ADULT_REFERENCE[b.key]))}%`, background: b.color }} />
              </span>
              <span className="text-right font-semibold">
                {num(row[b.key])} {b.unit}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11.5px] leading-relaxed text-muted">{t('nutrition.barsNote')}</p>
      </div>
    </section>
  )
}

/** "For your family": a few notes from the dish's tags and who lives here, plus how often it has been cooked this month. */
export function FamilyNotesPanel({ dishId, tags }: { dishId: string; tags: string[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ta' ? 'ta-IN' : 'en-IN'
  const { household } = useHome()
  const { data: members } = useMembers(household.id)
  const now = new Date()
  const today = toISODate(now)
  const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  const { data: slots } = useHistorySlots(household.id, monthStart, today)

  const people = (members ?? []).filter((m) => m.kind === 'family').map((m) => ({ name: m.display_name, band: ageBand(m.birth_year) }))
  const notes = familyNotes(tags, people)
  const cooked = (slots ?? []).filter((s) => s.source === 'home' && s.main_dish_id === dishId).sort((a, b) => (a.date < b.date ? 1 : -1))
  const last = cooked[0]
  const lastCooks = last ? last.meal_slot_cooks.map((c) => members?.find((m) => m.id === c.profile_id)?.display_name).filter(Boolean) : []

  if (notes.length === 0 && cooked.length === 0) return null
  const dot = { good: '#2F7A3E', care: '#E08A00', info: '#6E6259' }
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-display text-[17px] font-semibold">{t('nutrition.forFamily')}</h2>
      <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-white">
        {notes.map((n) => (
          <div key={n.key} className="flex items-start gap-3 px-4 py-3 text-[14px]">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dot[n.kind] }} aria-hidden="true" />
            <span>{t(`nutrition.note.${n.key}`, { names: joinNames(n.names) })}</span>
          </div>
        ))}
        {cooked.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 text-[14px]">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dot.info }} aria-hidden="true" />
            <span>
              {t(cooked.length === 1 ? 'nutrition.cookedOne' : 'nutrition.cookedOther', {
                count: cooked.length,
                month: new Intl.DateTimeFormat(locale, { month: 'long' }).format(now),
                last: new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${last!.date}T00:00:00`)),
                by: lastCooks.length > 0 ? t('nutrition.by', { names: joinNames(lastCooks as string[]) }) : '',
              })}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
