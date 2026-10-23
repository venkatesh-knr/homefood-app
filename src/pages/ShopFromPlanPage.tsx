import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useHistorySlots } from '../lib/plannerQueries'
import { useRecipesForDishes } from '../lib/recipeQueries'
import { useShopCatalogue, useShoppingItems } from '../lib/shoppingQueries'
import { addPlanToList } from '../lib/shoppingMutations'
import { mealsFromSlots, planRange, planShopping, type PlanLine, type PlanPick, type PlanRange } from '../lib/shoppingPlan'
import { SECTIONS, SECTION_COLOR, formatAmount, type ShopSection } from '../lib/shopping'
import { toISODate } from '../lib/planner'
import { describeError } from '../lib/errors'
import { BackHeader } from '../components/BackHeader'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-4 text-[13.5px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`

/** "From this week's meals": the recipes of the planned home meals worked out into a preview the person can untick, then added to the list. */
export default function ShopFromPlanPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const familyCount = (members ?? []).filter((m) => m.kind === 'family').length
  const [range, setRange] = useState<PlanRange>('week')
  const [off, setOff] = useState<Set<string>>(new Set()) // main lines the person unticked
  const [on, setOn] = useState<Set<string>>(new Set()) // staples and unmatched lines the person ticked
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = toISODate(new Date())
  const r = planRange(range, today, household.week_start)
  const { data: slots, isLoading: slotsLoading } = useHistorySlots(household.id, r.from, r.to)
  const meals = useMemo(() => mealsFromSlots(slots ?? [], familyCount), [slots, familyCount])
  const { data: recipes, isLoading: recipesLoading } = useRecipesForDishes(meals.map((m) => m.dish.id))
  const { items: catalog } = useShopCatalogue(household.id)
  const { data: listItems } = useShoppingItems(household.id)
  const plan = useMemo(() => (recipes ? planShopping(meals, recipes, catalog, lang) : null), [meals, recipes, catalog, lang])
  const working = !r.empty && (slotsLoading || (meals.length > 0 && recipesLoading))

  const locale = lang === 'ta' ? 'ta-IN' : 'en-IN'
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const label = (iso: string) => dayFmt.format(new Date(`${iso}T00:00:00`))

  const groups = useMemo(() => SECTIONS.map((section) => ({ section, lines: (plan?.lines ?? []).filter((l) => l.item.section === section) })).filter((g) => g.lines.length > 0), [plan])
  const ticked = (plan?.lines ?? []).filter((l) => !off.has(l.key)).length + (plan?.staples ?? []).filter((l) => on.has(l.key)).length + (plan?.unmatched ?? []).filter((u) => on.has(`u:${u.name}`)).length

  function pickRange(next: PlanRange) {
    setRange(next)
    setOff(new Set())
    setOn(new Set())
  }
  const flip = (set: Set<string>, key: string) => {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  }

  async function onAdd() {
    if (!plan || ticked === 0 || busy) return
    const fromLine = (l: PlanLine): PlanPick => ({ name: l.item.name_en, name_ta: l.item.name_ta, section: l.item.section, amount: l.amount, unit: l.unit, dishes: l.dishes })
    const picks: PlanPick[] = [
      ...plan.lines.filter((l) => !off.has(l.key)).map(fromLine),
      ...plan.staples.filter((l) => on.has(l.key)).map(fromLine),
      ...plan.unmatched.filter((u) => on.has(`u:${u.name}`)).map((u) => ({ name: u.name, name_ta: null, section: 'other' as ShopSection, amount: null, unit: null, dishes: u.dishes })),
    ]
    setBusy(true)
    setError(null)
    try {
      const n = await addPlanToList({ householdId: household.id, profileId: profile.id, items: listItems ?? [], picks })
      navigate('/shopping', { state: { added: n }, replace: true })
    } catch (err) {
      setError(describeError(err, t))
      setBusy(false)
    }
  }

  const nameOf = (l: PlanLine) => (lang === 'ta' && l.item.name_ta ? l.item.name_ta : l.item.name_en)
  const otherName = (l: PlanLine) => (lang === 'ta' ? l.item.name_en : l.item.name_ta)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5">
      <BackHeader title={t('shopping.planTitle')} to="/shopping" />

      <div role="radiogroup" aria-label={t('shopping.planTitle')} className="flex flex-wrap gap-2">
        {(['week', 'next7'] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={range === k} onClick={() => pickRange(k)} className={chip(range === k)}>
            {t(k === 'week' ? 'shopping.rangeWeek' : 'shopping.rangeNext')}
          </button>
        ))}
      </div>

      {r.empty ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-[14px] text-ink-soft">{t('shopping.planNothingLeft')}</p>
      ) : working ? (
        <p role="status" className="py-6 text-center text-muted">{t('shopping.planWorking')}</p>
      ) : !plan || plan.mealCount === 0 ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-[14px] text-ink-soft">{t('shopping.planEmpty')}</p>
      ) : (
        <>
          <div className="flex flex-col gap-1 rounded-2xl border border-saffron/40 bg-saffron-tint px-3.5 py-3 text-[13.5px]">
            <span className="font-semibold">{t('shopping.planInfo', { from: label(r.from), to: label(r.to), count: plan.mealCount })}</span>
            <span className="text-ink-soft">{t('shopping.planHint')}</span>
          </div>

          {groups.map((g) => (
            <section key={g.section} className="flex flex-col gap-1.5" aria-label={t(`shopping.section.${g.section}`)}>
              <div className="flex items-center gap-2 pt-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SECTION_COLOR[g.section] }} aria-hidden="true" />
                <h2 className="font-display text-[16px] font-semibold">{t(`shopping.section.${g.section}`)}</h2>
              </div>
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                {g.lines.map((l, i) => {
                  const isOn = !off.has(l.key)
                  const amount = formatAmount(l.amount, l.unit, lang)
                  return (
                    <button
                      key={l.key}
                      type="button"
                      role="checkbox"
                      aria-checked={isOn}
                      aria-label={t('shopping.include', { name: nameOf(l) })}
                      onClick={() => setOff(flip(off, l.key))}
                      className={`flex min-h-[56px] w-full items-center gap-3 px-3.5 py-2 text-left ${i > 0 ? 'border-t border-line' : ''}`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] ${isOn ? 'bg-leaf text-on-solid' : 'border-2 border-line-strong bg-surface'}`}>
                        {isOn && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
                        )}
                      </span>
                      <span className={`flex min-w-0 flex-1 flex-col ${isOn ? '' : 'text-muted'}`}>
                        <span className="break-words text-[15px] font-medium">
                          {nameOf(l)}
                          {otherName(l) && <span lang={lang === 'ta' ? 'en' : 'ta'} className="ml-1.5 text-[12.5px] font-normal text-muted">{otherName(l)}</span>}
                        </span>
                        <span className="text-[12px] text-muted">{l.dishes.join(', ')}</span>
                      </span>
                      <span className={`shrink-0 text-[14px] font-semibold ${isOn ? '' : 'text-muted'}`}>{l.approx ? t('shopping.about', { amount }) : amount}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}

          {plan.staples.length > 0 && (
            <section className="flex flex-col gap-1.5" aria-label={t('shopping.staplesTitle')}>
              <div className="flex items-baseline justify-between pt-1">
                <h2 className="font-display text-[16px] font-semibold">{t('shopping.staplesTitle')}</h2>
                <span className="text-[12px] text-muted">{t('shopping.staplesHint')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-2xl bg-sand p-3">
                {plan.staples.map((l) => (
                  <button key={l.key} type="button" aria-pressed={on.has(l.key)} onClick={() => setOn(flip(on, l.key))} className={chip(on.has(l.key))}>
                    {nameOf(l)} · {formatAmount(l.amount, l.unit, lang)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {plan.unmatched.length > 0 && (
            <section className="flex flex-col gap-1.5" aria-label={t('shopping.unmatchedTitle')}>
              <div className="flex items-baseline justify-between pt-1">
                <h2 className="font-display text-[16px] font-semibold">{t('shopping.unmatchedTitle')}</h2>
                <span className="text-[12px] text-muted">{t('shopping.unmatchedHint')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-2xl bg-sand p-3">
                {plan.unmatched.map((u) => (
                  <button key={u.name} type="button" aria-pressed={on.has(`u:${u.name}`)} onClick={() => setOn(flip(on, `u:${u.name}`))} className={chip(on.has(`u:${u.name}`))}>
                    {u.name}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {error && <p role="alert" className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}

      <div className="sticky bottom-16 -mx-5 mt-auto border-t border-line bg-cream px-5 pb-3 pt-3">
        <button type="button" onClick={onAdd} disabled={busy || ticked === 0 || !plan || plan.mealCount === 0} className="mx-auto flex min-h-[52px] w-full max-w-md items-center justify-center rounded-2xl bg-ink px-4 text-[15.5px] font-semibold text-cream disabled:opacity-50">
          {ticked === 0 ? t('shopping.addNone') : t('shopping.addCount', { count: ticked })}
        </button>
      </div>
    </main>
  )
}
