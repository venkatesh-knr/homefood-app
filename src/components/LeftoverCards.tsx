import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Dialog } from './Dialog'
import { useHome } from '../lib/homeContext'
import { describeError } from '../lib/errors'
import { useHistorySlots, type SlotWithDetails } from '../lib/plannerQueries'
import { useLeftovers } from '../lib/leftoverQueries'
import { markLeftoverGone, pruneLeftovers, saveMealLeftovers, putLeftoverInMeal } from '../lib/leftoverMutations'
import { zonedParts } from '../lib/prep'
import {
  AMOUNT_PEOPLE, KEPT_IN, LEFTOVER_AMOUNTS, activeLeftovers, leftoverName, leftoverPromptDue, mealsForLeftover, lastDayFor, lastDayWhen,
  type KeptIn, type Leftover, type LeftoverAmount,
} from '../lib/leftovers'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`

/** The use-by as words: "Use by today dinner", "Use by tomorrow dinner", "Use by Sun 25 Oct dinner". */
function lastDayText(useBy: string, today: string, lang: 'en' | 'ta', t: TFunction): string {
  const when = lastDayWhen(useBy, today)
  if (when === 'today') return t('leftovers.useByToday')
  if (when === 'tomorrow') return t('leftovers.useByTomorrow')
  return t('leftovers.useByDate', { date: new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${useBy}T00:00:00`)) })
}

/** "Anything left over?" on a home meal's card, once the meal's time has come: tick the dishes, how much, and where it is kept. */
export function LeftoverPrompt({ slot }: { slot: SlotWithDetails }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const { data: all } = useLeftovers(household.id)
  const [open, setOpen] = useState(false)
  const [picks, setPicks] = useState<Record<string, LeftoverAmount>>({})
  const [keptIn, setKeptIn] = useState<KeptIn>('fridge')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clock = zonedParts(new Date(), household.timezone)
  const mine = (all ?? []).filter((l) => l.from_slot_id === slot.id && l.status !== 'gone')
  const dishes = useMemo(
    () => [
      ...(slot.main_dish ? [slot.main_dish] : []),
      ...[...slot.meal_slot_sides].sort((a, b) => a.position - b.position).map((s) => s.dish),
    ],
    [slot],
  )

  if (!all || !leftoverPromptDue(slot, clock) || dishes.length === 0) return null

  function openPanel() {
    setPicks(Object.fromEntries(mine.map((l) => [l.dish_id, l.amount])))
    setKeptIn(mine[0]?.kept_in ?? 'fridge')
    setError(null)
    setOpen(true)
  }

  async function onSave() {
    setBusy(true)
    setError(null)
    try {
      await saveMealLeftovers({
        householdId: household.id, profileId: profile.id, slotId: slot.id, cookedOn: slot.date, keptIn,
        picks: Object.entries(picks).map(([dish_id, amount]) => ({ dish_id, amount })), existing: all ?? [],
      })
      setOpen(false)
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  const summary = mine.map((l) => `${leftoverName(l.dish, lang)} (${t(`leftovers.amount.${l.amount}`)})`).join(', ')
  const useBy = lastDayFor(slot.date, keptIn)

  if (!open) {
    return (
      <button type="button" onClick={openPanel} className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 px-3 py-1.5 text-center text-[13.5px] leading-snug font-semibold text-saffron-ink">
        <svg className="shrink-0" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 7h14l-1.3 12.2a1.5 1.5 0 0 1-1.5 1.3H7.8a1.5 1.5 0 0 1-1.5-1.3L5 7zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        {mine.length > 0 ? t('leftovers.recorded', { names: summary }) : t('leftovers.ask')}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-saffron/40 bg-saffron-tint p-3.5">
      <h3 className="font-display text-[16px] font-semibold">{t('leftovers.whatsLeft')}</h3>
      <div className="flex flex-col">
        {dishes.map((d, i) => {
          const on = picks[d.id] !== undefined
          const name = leftoverName(d, lang)
          return (
            <div key={d.id} className={`flex flex-col gap-2 py-2 ${i > 0 ? 'border-t border-line' : ''}`}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => setPicks((p) => { const next = { ...p }; if (on) delete next[d.id]; else next[d.id] = 'some'; return next })}
                className="flex min-h-[44px] items-center gap-3 text-left"
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] ${on ? 'bg-leaf text-on-solid' : 'border-2 border-line-strong bg-surface'}`}>
                  {on && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1 break-words text-[15px] font-semibold">{name}</span>
              </button>
              {on && (
                <div role="radiogroup" aria-label={t('leftovers.howMuch', { name })} className="flex flex-wrap gap-1.5 pl-9">
                  {LEFTOVER_AMOUNTS.map((a) => (
                    <button key={a} type="button" role="radio" aria-checked={picks[d.id] === a} onClick={() => setPicks((p) => ({ ...p, [d.id]: a }))} className={chip(picks[d.id] === a)}>
                      {t(`leftovers.amount.${a}`)} · {AMOUNT_PEOPLE[a]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold text-ink-soft">{t('leftovers.keptIn')}</span>
        <div role="radiogroup" aria-label={t('leftovers.keptIn')} className="flex flex-wrap gap-1.5">
          {KEPT_IN.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={keptIn === k} onClick={() => setKeptIn(k)} className={chip(keptIn === k)}>
              {t(`leftovers.kept.${k}`)}
            </button>
          ))}
        </div>
        <p className="text-[12.5px] text-ink-soft">{lastDayText(useBy, clock.date, lang, t)} · {t(`leftovers.keptHint.${keptIn}`)}</p>
      </div>

      {error && <p role="alert" className="text-[13px] text-alert">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-semibold">{t('common.cancel')}</button>
        <button type="button" disabled={busy || (Object.keys(picks).length === 0 && mine.length === 0)} onClick={onSave} className="min-h-[48px] flex-1 rounded-xl bg-ink px-3 text-[14.5px] leading-snug font-semibold text-cream disabled:opacity-50">
          {t('leftovers.save')}
        </button>
      </div>
    </div>
  )
}

/** Today: "Leftovers to use · N", soonest use-by first. Nothing shows when there are none (or before migration 0038). */
export function LeftoversCard() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { household } = useHome()
  const { data: all } = useLeftovers(household.id, { live: true })
  const [using, setUsing] = useState<Leftover | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const clock = zonedParts(new Date(), household.timezone)
  const list = useMemo(() => activeLeftovers(all ?? [], clock.date), [all, clock.date])

  // Old rows (used, gone, or a week past their use-by) have no use any more: tidy them away, quietly.
  useEffect(() => {
    if (all && all.length > 0) void pruneLeftovers(household.id, all, clock.date)
  }, [all, household.id, clock.date])

  if (list.length === 0) return null

  async function gone(l: Leftover) {
    setBusy(l.id)
    setError(null)
    try {
      await markLeftoverGone(household.id, l.id)
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-label={t('leftovers.cardTitle', { count: list.length })} className="flex flex-col gap-1 rounded-[20px] border-[1.5px] border-saffron bg-surface p-3.5">
      <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-saffron-ink">
        <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 7h14l-1.3 12.2a1.5 1.5 0 0 1-1.5 1.3H7.8a1.5 1.5 0 0 1-1.5-1.3L5 7zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        {t('leftovers.cardTitle', { count: list.length })}
      </h2>
      {list.map((l, i) => {
        const due = lastDayWhen(l.use_by, clock.date) === 'today'
        const name = leftoverName(l.dish, lang)
        return (
          <div key={l.id} className={`flex flex-col gap-2 py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}>
            <div className="flex flex-col gap-0.5">
              <span className="break-words text-[15.5px] font-semibold">{name} · {t(`leftovers.amount.${l.amount}`)}</span>
              <span className={`text-[12.5px] ${due ? 'font-semibold text-saffron-ink' : 'text-muted'}`}>
                {lastDayText(l.use_by, clock.date, lang, t)} · {t(`leftovers.kept.${l.kept_in}`)}
                {l.cooked_on < clock.date && ` · ${t('leftovers.from', { day: new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long' }).format(new Date(`${l.cooked_on}T00:00:00`)) })}`}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setUsing(l)} className="min-h-[44px] flex-1 rounded-xl bg-ink px-3 text-[13.5px] leading-snug font-semibold text-cream">{t('leftovers.useInMeal')}</button>
              <button type="button" disabled={busy === l.id} onClick={() => void gone(l)} aria-label={t('leftovers.goneNamed', { name })} className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[13.5px] font-semibold disabled:opacity-60">{t('leftovers.gone')}</button>
            </div>
          </div>
        )
      })}
      {error && <p role="alert" className="text-[13px] text-alert">{error}</p>}
      {using && <UseLeftoverSheet leftover={using} onClose={() => setUsing(null)} />}
    </section>
  )
}

/** "Use in a meal": the home meals between now and the use-by day that have a free side spot. Anyone in the home can pick one. */
function UseLeftoverSheet({ leftover, onClose }: { leftover: Leftover; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { household } = useHome()
  const clock = zonedParts(new Date(), household.timezone)
  const { data: slots, isLoading } = useHistorySlots(household.id, clock.date, leftover.use_by)
  const meals = mealsForLeftover(leftover, (slots ?? []) as unknown as Parameters<typeof mealsForLeftover>[1], clock)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const name = leftoverName(leftover.dish, lang)
  const fmt = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long' })
  const dayWord = (date: string) => (date === clock.date ? t('leftovers.today') : lastDayWhen(date, clock.date) === 'tomorrow' ? t('leftovers.tomorrow') : fmt.format(new Date(`${date}T00:00:00`)))
  const dishOf = (id: string) => {
    const s = (slots ?? []).find((x) => x.id === id)
    return s?.main_dish ? (s.main_dish.dish_names.find((n) => n.language === lang)?.name ?? s.main_dish.name) : ''
  }

  async function use(slotId: string) {
    setBusy(slotId)
    setError(null)
    try {
      await putLeftoverInMeal(household.id, leftover.id, slotId)
      onClose()
    } catch (err) {
      setError(describeError(err, t))
      setBusy(null)
    }
  }

  return (
    <Dialog title={t('leftovers.useTitle', { name })} onClose={onClose}>
      <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 break-words font-display text-[19px] font-bold leading-tight">{t('leftovers.useTitle', { name })}</h2>
          <button type="button" onClick={onClose} className="min-h-[44px] shrink-0 rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-semibold">{t('common.cancel')}</button>
        </div>
        <p className="text-[13px] text-ink-soft">{t('leftovers.useHint')}</p>
        {isLoading ? (
          <p className="py-4 text-center text-muted">{t('common.loading')}</p>
        ) : meals.length === 0 ? (
          <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('leftovers.noMeals')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {meals.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-2.5">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{dayWord(m.date)} · {t(`meal.${m.meal}`)}</span>
                  <span className="break-words text-[15px] font-semibold">{dishOf(m.id)}</span>
                </span>
                <button type="button" disabled={busy !== null} onClick={() => void use(m.id)} className="min-h-[44px] shrink-0 rounded-xl bg-ink px-4 text-[13.5px] font-semibold text-cream disabled:opacity-60">{t('leftovers.useHere')}</button>
              </div>
            ))}
          </div>
        )}
        {error && <p role="alert" className="text-[13px] text-alert">{error}</p>}
      </div>
    </Dialog>
  )
}
