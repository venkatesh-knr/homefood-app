import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useHistorySlots, type SlotDish, type SlotWithDetails } from '../lib/plannerQueries'
import { rangeBounds, shiftAnchor, summariseHistory, topEntries, type HistoryRangeKind } from '../lib/history'
import { MEAL_TYPES, toISODate, type MealType } from '../lib/planner'
import { Card, Pill } from '../components/ui'
import { DishThumb } from '../components/DishRow'
import { useDishPhotoPath } from '../lib/dishPhotos'

const MEAL_BAND: Record<MealType, string> = { breakfast: '#F2B705', lunch: '#2F7A3E', snacks: '#E8742A', dinner: '#3B4A9C' }
const KINDS: HistoryRangeKind[] = ['week', 'month', 'year']
const today = toISODate(new Date())

function dishNames(d: SlotDish, lang: 'en' | 'ta'): { shown: string; all: string[] } {
  const all = [d.name, ...d.dish_names.map((n) => n.name)]
  return { shown: d.dish_names.find((n) => n.language === lang)?.name ?? d.name, all }
}

export default function HistoryPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { household } = useHome()
  const { data: members } = useMembers(household.id)
  const photoFor = useDishPhotoPath()

  const [kind, setKind] = useState<HistoryRangeKind>('month')
  const [anchor, setAnchor] = useState(today)
  const [query, setQuery] = useState('')

  const bounds = rangeBounds(kind, anchor)
  // Only meals up to today are history; a still-open current period just ends today.
  const to = bounds.to < today ? bounds.to : today
  const { data, isLoading } = useHistorySlots(household.id, bounds.from, to)
  const canGoNext = rangeBounds(kind, shiftAnchor(kind, anchor, 1)).from <= today

  const locale = lang === 'ta' ? 'ta-IN' : 'en-IN'
  const dayFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  const parse = (iso: string) => new Date(`${iso}T00:00:00`)
  const rangeLabel =
    kind === 'week'
      ? `${dayFmt.format(parse(bounds.from))} – ${dayFmt.format(parse(bounds.to))}`
      : kind === 'month'
        ? new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(parse(bounds.from))
        : String(parse(bounds.from).getFullYear())

  const memberName = useMemo(() => new Map((members ?? []).map((m) => [m.id, m.display_name])), [members])

  // A slot only counts once it actually has something in it.
  const slots = useMemo(() => (data ?? []).filter((s) => s.main_dish || s.place_name), [data])
  const summary = useMemo(() => summariseHistory(slots.map((s) => ({ source: s.source, main_dish_id: s.main_dish_id, meal_slot_cooks: s.meal_slot_cooks }))), [slots])

  const dishById = useMemo(() => {
    const map = new Map<string, SlotDish>()
    for (const s of slots) if (s.main_dish) map.set(s.main_dish.id, s.main_dish)
    return map
  }, [slots])
  const topDishes = topEntries(summary.dishCounts, 3)
  const topCooks = topEntries(summary.cookCounts, 3)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...slots].sort((a, b) => (a.date === b.date ? MEAL_TYPES.indexOf(a.meal) - MEAL_TYPES.indexOf(b.meal) : a.date < b.date ? 1 : -1))
    if (!q) return sorted
    return sorted.filter((s) => {
      const names = [...(s.main_dish ? dishNames(s.main_dish, lang).all : []), ...s.meal_slot_sides.flatMap((x) => dishNames(x.dish, lang).all), s.place_name ?? '']
      return names.some((n) => n.toLowerCase().includes(q))
    })
  }, [slots, query, lang])

  const byDate = useMemo(() => {
    const groups: { date: string; items: SlotWithDetails[] }[] = []
    for (const s of shown) {
      const last = groups[groups.length - 1]
      if (last && last.date === s.date) last.items.push(s)
      else groups.push({ date: s.date, items: [s] })
    }
    return groups
  }, [shown])

  const arrow = 'flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white disabled:opacity-40'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
      <div className="flex items-center gap-2 pt-3">
        <button type="button" onClick={() => navigate('/home')} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex flex-col">
          <span className="font-display text-[18px] font-semibold">{t('history.title')}</span>
          <span className="text-[12px] text-muted">{t('history.subtitle')}</span>
        </div>
      </div>

      <div role="radiogroup" aria-label={t('history.title')} className="grid grid-cols-3 gap-1 rounded-2xl bg-sand p-1">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => {
              setKind(k)
              setAnchor(today)
            }}
            className={`h-10 rounded-xl text-[14px] font-semibold ${kind === k ? 'bg-white shadow-sm' : 'text-ink-soft'}`}
          >
            {t(`history.${k}`)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" className={arrow} aria-label={t('history.previous')} onClick={() => setAnchor((a) => shiftAnchor(kind, a, -1))}>
          ‹
        </button>
        <span className="font-display text-[16px] font-semibold">{rangeLabel}</span>
        <button type="button" className={arrow} aria-label={t('history.next')} disabled={!canGoNext} onClick={() => setAnchor((a) => shiftAnchor(kind, a, 1))}>
          ›
        </button>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-muted">{t('common.loading')}</p>
      ) : slots.length === 0 ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('history.empty')}</p>
      ) : (
        <>
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[26px] font-bold">{t(summary.total === 1 ? 'history.mealsOne' : 'history.mealsOther', { count: summary.total })}</span>
              <span className="text-[12px] text-muted">{t('history.upToToday')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{t('planner.source.home')} · {summary.bySource.home}</Pill>
              <Pill>{t('planner.source.dineOut')} · {summary.bySource.dine_out}</Pill>
              <Pill>{t('planner.source.orderIn')} · {summary.bySource.order_in}</Pill>
            </div>
            {topDishes.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t('history.topDishes')}</span>
                {topDishes.map(([id, n]) => (
                  <div key={id} className="flex justify-between text-[14px]">
                    <span>{dishById.get(id) ? dishNames(dishById.get(id)!, lang).shown : ''}</span>
                    <span className="text-muted">{t('history.times', { count: n })}</span>
                  </div>
                ))}
              </div>
            )}
            {topCooks.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t('history.whoCooked')}</span>
                {topCooks.map(([id, n]) => (
                  <div key={id} className="flex justify-between text-[14px]">
                    <span>{memberName.get(id) ?? ''}</span>
                    <span className="text-muted">{t('history.times', { count: n })}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('history.searchPlaceholder')}
            className="h-12 rounded-2xl border border-line-strong bg-white px-3.5 text-[15px]"
          />

          {byDate.length === 0 ? (
            <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('history.emptySearch')}</p>
          ) : (
            byDate.map((g) => (
              <section key={g.date} className="flex flex-col gap-1.5">
                <h2 className="pt-1 font-display text-[14px] font-semibold text-ink-soft">
                  {new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(parse(g.date))}
                </h2>
                {g.items.map((s) => {
                  const main = s.main_dish ? dishNames(s.main_dish, lang).shown : s.place_name
                  const sides = s.meal_slot_sides.sort((a, b) => a.position - b.position).map((x) => dishNames(x.dish, lang).shown)
                  const cooks = s.meal_slot_cooks.map((c) => memberName.get(c.profile_id)).filter(Boolean)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => navigate(`/week/${s.date}/${s.meal}`)}
                      className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3 text-left"
                    >
                      {s.main_dish ? (
                        <DishThumb name={main ?? ''} tone={s.meal.length} photoPath={photoFor(s.main_dish)} size={44} ring={MEAL_BAND[s.meal]} />
                      ) : (
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: MEAL_BAND[s.meal] }} aria-hidden="true" />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t(`meal.${s.meal}`)}</span>
                        <span className="text-[15px] font-semibold">{main}</span>
                        {sides.length > 0 && <span className="text-[13px] text-muted">+ {sides.join(', ')}</span>}
                        {cooks.length > 0 && <span className="text-[12.5px] text-ink-soft">{t('history.cookedBy', { names: cooks.join(' + ') })}</span>}
                      </span>
                      {s.source !== 'home' && <Pill>{t(s.source === 'dine_out' ? 'planner.source.dineOut' : 'planner.source.orderIn')}</Pill>}
                    </button>
                  )
                })}
              </section>
            ))
          )}
        </>
      )}
    </main>
  )
}
