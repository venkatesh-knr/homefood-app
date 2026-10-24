import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar } from './ui'
import { DishPickerSheet } from './DishPickerSheet'
import { useDishes, type DishWithNames } from '../lib/dishQueries'
import { dishDisplayName } from '../lib/dishes'
import { PLAN_KEYS, fitsAll, planFits, type PlanKey } from '../lib/dietPlans'
import { mealAllergyConflicts, type MealType } from '../lib/planner'
import { avatarColor, joinNames } from '../lib/people'

/** One plate being edited: who is on it, its own main dish and sides, and which of the family meal's sides it shares. */
export type PlateDraft = { key: string; person_ids: string[]; main: DishWithNames | null; sides: DishWithNames[]; shared: number[] }
export type PlateEater = { id: string; name: string; allergens: string[]; kind: 'family' | 'helper'; index: number }

/** In the meal editor, under Who is eating: a diet plate (up to two) for people whose plan the family meal does not suit. */
export function DietPlateEditor({ householdId, meal, eaters, familyMain, familySides, plates, onChange, plansOf, familyCount }: {
  householdId: string
  meal: MealType
  /** The family members marked as eating this meal. */
  eaters: PlateEater[]
  familyMain: DishWithNames | null
  familySides: DishWithNames[]
  plates: PlateDraft[]
  onChange: (next: PlateDraft[]) => void
  plansOf: (profileId: string) => PlanKey[]
  familyCount: number
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { data: dishes } = useDishes(householdId)
  const [pick, setPick] = useState<{ key: string; kind: 'main' | 'side'; plans: PlanKey[]; people: PlateEater[] } | null>(null)
  const name = (d: DishWithNames) => dishDisplayName(d, d.dish_names, lang)
  const onPlate = new Set(plates.flatMap((p) => p.person_ids))
  const familyFor = Math.max(0, eaters.length - onPlate.size)

  const update = (key: string, patch: Partial<PlateDraft>) => onChange(plates.map((p) => (p.key === key ? { ...p, ...patch } : p)))
  const addPlate = () => onChange([...plates, { key: `plate-${Date.now()}`, person_ids: [], main: null, sides: [], shared: [] }])

  return (
    <>
      <div className="mx-4 mt-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t('plates.title')}</span>
          <span className="text-[12.5px] leading-snug text-muted">{t('plates.hint')}</span>
        </div>
        <button type="button" role="switch" aria-checked={plates.length > 0} aria-label={t('plates.title')} onClick={() => (plates.length > 0 ? onChange([]) : addPlate())} className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors before:absolute before:-inset-2 before:content-[''] ${plates.length > 0 ? 'bg-leaf' : 'bg-line-strong'}`}>
          <span className="absolute top-[3px] h-[26px] w-[26px] rounded-full bg-surface shadow transition-[left]" style={{ left: plates.length > 0 ? 23 : 3 }} />
        </button>
      </div>

      {plates.length > 0 && (
        <div className="mx-4 mt-3 flex flex-col gap-3">
          <div className="rounded-2xl border border-line bg-surface px-3.5 py-3">
            <p className="text-[14px] font-semibold">{t('plates.familyFor', { count: familyFor })}</p>
            <p className="text-[12.5px] leading-snug text-muted">{t('plates.amounts', { count: familyFor })}</p>
          </div>

          {plates.map((p, i) => {
            const people = eaters.filter((e) => p.person_ids.includes(e.id))
            const plans = [...new Set(people.flatMap((e) => plansOf(e.id)))].sort((a, b) => PLAN_KEYS.indexOf(a) - PLAN_KEYS.indexOf(b))
            const planNames = plans.map((x) => t(`plans.name.${x}`)).join(' + ')
            const free = eaters.filter((e) => !onPlate.has(e.id) || p.person_ids.includes(e.id))
            const peopleAllergens = people.flatMap((e) => e.allergens)
            const suggestions = (dishes ?? [])
              .filter((d) => (d.course === 'main' || d.course === 'both') && d.meal_types.includes(meal) && d.id !== familyMain?.id)
              .filter((d) => plans.length === 0 || fitsAll(plans, d))
              .filter((d) => !d.allergens.some((a) => peopleAllergens.includes(a)))
              .sort((a, b) => name(a).localeCompare(name(b)))
              .slice(0, 6)
            const sharedDishes = familySides.filter((_, k) => p.shared.includes(k + 1))
            const allergy = mealAllergyConflicts([...(p.main?.allergens ?? []), ...p.sides.flatMap((d) => d.allergens), ...sharedDishes.flatMap((d) => d.allergens)], people.map((e) => ({ name: e.name, allergens: e.allergens })))
            const familyDoesntFit = familyMain && plans.length > 0 && !fitsAll(plans, familyMain)
            return (
              <div key={p.key} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-meal-dinner bg-surface p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-[15px] font-semibold">{plates.length > 1 ? t('plates.plateN', { n: i + 1 }) : t('plates.plateFor', { count: people.length })}</span>
                  <button type="button" onClick={() => onChange(plates.filter((x) => x.key !== p.key))} className="min-h-[44px] px-1 text-[13px] font-semibold text-alert">{t('plates.removePlate')}</button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span id={`plate-who-${p.key}`} className="text-[12.5px] font-semibold text-ink-soft">{t('plates.who')}</span>
                  <div role="group" aria-labelledby={`plate-who-${p.key}`} className="flex flex-wrap gap-1.5">
                    {free.map((e) => {
                      const on = p.person_ids.includes(e.id)
                      return (
                        <button key={e.id} type="button" aria-pressed={on} onClick={() => update(p.key, { person_ids: on ? p.person_ids.filter((x) => x !== e.id) : [...p.person_ids, e.id] })} className={`flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1.5 pr-3.5 text-[14px] ${on ? 'border-meal-dinner bg-dinner-tint text-dinner-ink' : 'border-line bg-surface'}`}>
                          <Avatar name={e.name} color={avatarColor(e.index, e.kind)} size={32} />
                          {e.name}
                        </button>
                      )
                    })}
                  </div>
                  {people.length === 0 && <p className="text-[12.5px] text-muted">{t('plates.noPeople')}</p>}
                  {planNames && <p className="text-[12.5px] font-semibold text-dinner-ink">{planNames}</p>}
                </div>

                {people.length > 0 && familyDoesntFit && familyMain && <p className="text-[12.5px] text-ink-soft">{t('plates.doesntFit', { dish: name(familyMain) })}</p>}

                <div className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-semibold text-ink-soft">{t('plates.mainLabel')}</span>
                  {p.main ? (
                    <div className="flex items-center gap-2 rounded-xl bg-sand px-3 py-2">
                      <span className="min-w-0 flex-1 break-words text-[15px] font-semibold">{name(p.main)}</span>
                      <button type="button" onClick={() => setPick({ key: p.key, kind: 'main', plans, people })} className="min-h-[44px] px-2 text-[13px] font-semibold text-saffron-ink underline">{t('plates.changeMain')}</button>
                      <button type="button" onClick={() => update(p.key, { main: null })} aria-label={t('plates.removeMain')} className="flex h-11 w-11 items-center justify-center text-muted">×</button>
                    </div>
                  ) : people.length > 0 ? (
                    <>
                      <p className="text-[12.5px] text-muted">{plans.length === 0 ? t('plates.noPlan') : suggestions.length > 0 ? t('plates.fits', { plans: planNames }) : t('plates.noFit')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((d) => (
                          <button key={d.id} type="button" onClick={() => update(p.key, { main: d })} className="min-h-[44px] rounded-xl border-[1.5px] border-dinner-ink/40 bg-dinner-tint px-3 text-[13.5px] font-semibold text-dinner-ink">{name(d)}</button>
                        ))}
                      </div>
                      <button type="button" onClick={() => setPick({ key: p.key, kind: 'main', plans, people })} className="min-h-[44px] self-start text-[13.5px] font-semibold text-saffron-ink underline">{plans.length > 0 ? t('plates.more') : t('plates.moreAny')}</button>
                    </>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-semibold text-ink-soft">{t('plates.sidesLabel')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.sides.map((d) => (
                      <span key={d.id} className="flex items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pl-3.5 pr-1 text-[14px]">
                        {name(d)}
                        <button type="button" aria-label={name(d)} onClick={() => update(p.key, { sides: p.sides.filter((x) => x.id !== d.id) })} className="flex h-9 w-9 items-center justify-center rounded-full text-muted">×</button>
                      </span>
                    ))}
                    {p.sides.length < 2 && (
                      <button type="button" onClick={() => setPick({ key: p.key, kind: 'side', plans, people })} className="flex min-h-[44px] items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-saffron-ink/60 px-3.5 text-[14px] font-semibold text-saffron-ink">
                        <span aria-hidden="true">+</span>
                        {t('plates.addSide')}
                      </button>
                    )}
                  </div>
                </div>

                {familySides.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12.5px] font-semibold text-ink-soft">{t('plates.shared')}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {familySides.map((d, k) => {
                        const pos = k + 1
                        const on = p.shared.includes(pos)
                        const fits = plans.length === 0 || planFits(plans[0]!, d)
                        return (
                          <button key={d.id} type="button" aria-pressed={on} aria-label={t('plates.sharedOn', { name: name(d) })} onClick={() => update(p.key, { shared: on ? p.shared.filter((x) => x !== pos) : [...p.shared, pos] })} className={`min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-meal-dinner bg-dinner-tint text-dinner-ink' : 'border border-line-strong bg-surface text-ink'} ${fits ? '' : 'opacity-70'}`}>
                            {on ? '✓ ' : ''}{name(d)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {allergy.names.length > 0 && (
                  <p role="alert" className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] font-semibold text-alert">{t('plates.allergy', { names: joinNames(allergy.names), list: allergy.allergens.join(', ') })}</p>
                )}
              </div>
            )
          })}

          {plates.length < 2 && familyCount > 0 && (
            <button type="button" onClick={addPlate} className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron/60 px-4 text-[14px] font-semibold text-saffron-ink">
              <span aria-hidden="true">+</span>
              {t('plates.addPlate')}
            </button>
          )}
        </div>
      )}

      {pick && (
        <DishPickerSheet
          householdId={householdId}
          title={pick.kind === 'main' ? t('plates.pickMainTitle') : t('plates.pickSideTitle')}
          course={pick.kind}
          meal={meal}
          eaters={pick.people.map((e) => ({ id: e.id, name: e.name, allergens: e.allergens }))}
          fitPlans={pick.plans}
          onPick={(d) => {
            const target = plates.find((p) => p.key === pick.key)
            if (target) update(pick.key, pick.kind === 'main' ? { main: d } : { sides: [...target.sides.filter((x) => x.id !== d.id), d].slice(0, 2) })
            setPick(null)
          }}
          onClose={() => setPick(null)}
        />
      )}
    </>
  )
}

