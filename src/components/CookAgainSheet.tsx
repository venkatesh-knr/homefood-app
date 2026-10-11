import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Dialog } from './Dialog'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useHistorySlots, usePlannerTurns } from '../lib/plannerQueries'
import { planDishInFreeSlot } from '../lib/plannerMutations'
import { addSuggestion } from '../lib/discussionMutations'
import { cookAgainDays, COOK_AGAIN_DAYS, defaultCookAgainMeal, type CookAgainDay } from '../lib/cookAgain'
import { activeMealTypes, addDays, toISODate, turnCoversDate, type MealType } from '../lib/planner'
import { describeError } from '../lib/errors'

/** "Cook this again": pick one of the next 14 days for a dish. The Planner (or Admin) can put it in a free meal; it never replaces a planned one.
 * Everyone else can suggest it for a meal that is already planned, and the Planner decides. */
export function CookAgainSheet({
  dish,
  meal: fixedMeal,
  sideDishIds = [],
  onClose,
}: {
  dish: { id: string; name: string; meal_types: MealType[] }
  /** The meal of the past meal being repeated; without it the dish's own meals are offered. */
  meal?: MealType
  sideDishIds?: string[]
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { profile, household } = useHome()
  const today = toISODate(new Date())
  const meals = activeMealTypes(household.snacks_enabled)
  const choices = fixedMeal ? [fixedMeal] : dish.meal_types.filter((m) => meals.includes(m))
  const [meal, setMeal] = useState<MealType>(fixedMeal ?? defaultCookAgainMeal(dish.meal_types, meals))
  const { data: slots, isLoading } = useHistorySlots(household.id, today, addDays(today, COOK_AGAIN_DAYS - 1))
  const { data: turns } = usePlannerTurns(household.id)
  const { data: members } = useMembers(household.id)
  const [busy, setBusy] = useState<string | null>(null)
  const [result, setResult] = useState<{ kind: 'planned' | 'suggested' | 'taken' | 'error'; date?: string; meal?: MealType; text?: string } | null>(null)

  const isAdmin = profile.role === 'admin'
  const canPlan = (date: string) => isAdmin || (turns ?? []).some((tn) => tn.profile_id === profile.id && turnCoversDate(tn, date))
  const days = useMemo(() => cookAgainDays(slots ?? [], { today, meal, canPlan }), [slots, today, meal, turns, profile.id, isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps
  const mayPlanSomeday = isAdmin || days.some((d) => canPlan(d.date))

  const locale = lang === 'ta' ? 'ta-IN' : 'en-IN'
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const label = (date: string) => dayFmt.format(new Date(`${date}T00:00:00`))
  const dishLabel = (d: CookAgainDay) => {
    const s = d.slot
    if (!s) return ''
    if (s.main_dish) return s.main_dish.dish_names.find((n) => n.language === lang)?.name ?? s.main_dish.name
    return s.place_name ?? ''
  }

  async function act(d: CookAgainDay) {
    setBusy(d.date)
    setResult(null)
    try {
      if (d.action === 'plan') {
        const planned = await planDishInFreeSlot({
          householdId: household.id,
          weekStartsOn: household.week_start,
          date: d.date,
          meal,
          dishId: dish.id,
          sideDishIds,
          eaterProfileIds: (members ?? []).filter((m) => m.kind === 'family').map((m) => m.id),
        })
        setResult(planned ? { kind: 'planned', date: d.date, meal } : { kind: 'taken' })
      } else if (d.action === 'suggest' && d.slot) {
        await addSuggestion(d.slot.id, profile.id, { dishId: dish.id })
        setResult({ kind: 'suggested', date: d.date, meal })
      }
    } catch (err) {
      setResult({ kind: 'error', text: describeError(err, t) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog title={t('cookAgain.title', { dish: dish.name })} onClose={onClose}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-display text-[19px] font-bold leading-tight">{t('cookAgain.title', { dish: dish.name })}</h2>
          <p className="text-[13px] leading-snug text-ink-soft">
            {mayPlanSomeday ? t('cookAgain.hintPlanner', { meal: t(`meal.${meal}`) }) : t('cookAgain.hintMember', { dish: dish.name, meal: t(`meal.${meal}`) })}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label={t('cookAgain.close')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {choices.length > 1 && (
        <div role="radiogroup" aria-label={t('cookAgain.meal')} className="mx-5 mt-3 flex flex-wrap gap-1.5">
          {choices.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={meal === m}
              onClick={() => {
                setMeal(m)
                setResult(null)
              }}
              className={`min-h-[44px] rounded-full border px-4 text-[14px] font-semibold ${meal === m ? 'border-ink bg-ink text-cream' : 'border-line-strong bg-surface'}`}
            >
              {t(`meal.${m}`)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-1 flex-col gap-1.5 overflow-y-auto px-5 pb-2">
        {isLoading ? (
          <p className="py-6 text-center text-muted">{t('common.loading')}</p>
        ) : (
          days.map((d) => {
            const actionable = d.action !== 'none'
            return (
              <div key={d.date} className={`flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border px-3.5 py-2 ${actionable ? 'border-line-strong bg-surface' : 'border-line bg-sand/50 text-muted'}`}>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[14.5px] font-semibold">{label(d.date)}</span>
                  <span className="truncate text-[12.5px]">{d.state === 'free' ? (d.action === 'plan' ? t('cookAgain.free') : t('cookAgain.freeNotYours')) : t('cookAgain.planned', { dish: dishLabel(d) })}</span>
                </span>
                {actionable && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void act(d)}
                    className="min-h-[44px] shrink-0 rounded-xl bg-ink px-3.5 text-[13.5px] font-semibold text-cream disabled:opacity-50"
                  >
                    {t(d.action === 'plan' ? 'cookAgain.plan' : 'cookAgain.suggest')}
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="min-h-[44px] px-5 pb-4 pt-1" role="status">
        {result?.kind === 'planned' && result.date && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-leaf-tint px-3.5 py-2.5 text-[13.5px] text-leaf">
            <span>{t('cookAgain.plannedDone', { day: label(result.date), meal: t(`meal.${result.meal}`) })}</span>
            <button type="button" onClick={() => navigate(`/week/${result.date}/${result.meal}`)} className="min-h-[44px] shrink-0 px-1 font-semibold underline">
              {t('cookAgain.open')}
            </button>
          </div>
        )}
        {result?.kind === 'suggested' && result.date && (
          <p className="rounded-2xl bg-leaf-tint px-3.5 py-2.5 text-[13.5px] text-leaf">{t('cookAgain.suggestedDone', { day: label(result.date), meal: t(`meal.${result.meal}`) })}</p>
        )}
        {result?.kind === 'taken' && <p className="rounded-2xl bg-sand px-3.5 py-2.5 text-[13.5px] text-ink-soft">{t('cookAgain.taken')}</p>}
        {result?.kind === 'error' && <p className="rounded-2xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{result.text}</p>}
      </div>
    </Dialog>
  )
}
