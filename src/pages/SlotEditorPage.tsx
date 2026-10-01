import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAllergies, useMembers } from '../lib/queries'
import { useWeekPlan, useWeekSlots } from '../lib/plannerQueries'
import { clearSlot, getOrCreateWeekPlan, saveSlot, type SlotInput } from '../lib/plannerMutations'
import { describeError } from '../lib/errors'
import { mealAllergyConflicts, weekStartOf, toISODate, type MealSource, type MealType } from '../lib/planner'
import { dishDisplayName } from '../lib/dishes'
import type { DishWithNames } from '../lib/dishQueries'
import { avatarColor, joinNames } from '../lib/people'
import { Button, FullPageMessage } from '../components/ui'
import { DishThumb } from '../components/DishRow'
import { DishPickerSheet } from '../components/DishPickerSheet'

const SOURCES: MealSource[] = ['home', 'dine_out', 'order_in']

export default function SlotEditorPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { date, meal } = useParams<{ date: string; meal: MealType }>()
  const { household } = useHome()

  const weekStart = toISODate(weekStartOf(new Date(`${date}T00:00:00`)))
  const { data: weekPlan, isLoading: isWeekPlanLoading } = useWeekPlan(household.id, weekStart)
  const { data: slots, isLoading: isSlotsLoading } = useWeekSlots(weekPlan?.id)
  const { data: members } = useMembers(household.id)
  const familyMembers = (members ?? []).filter((m) => m.kind === 'family')
  const memberIds = (members ?? []).map((m) => m.id)
  const { data: allergyRows } = useAllergies(memberIds)

  // useWeekSlots is disabled (and reports isLoading: false) until weekPlan resolves, so on a
  // fresh page load — a direct link, a reload, PWA relaunch — isSlotsLoading alone goes false
  // before the real data ever arrives. Wait for weekPlan and members too, or the "new slot"
  // default below fires on empty data and locks in permanently once initialised flips true.
  const isLoading = isWeekPlanLoading || (Boolean(weekPlan) && isSlotsLoading) || members === undefined

  const existing = slots?.find((s) => s.date === date && s.meal === meal)

  const [values, setValues] = useState<SlotInput>({
    source: 'home',
    place_name: '',
    main_dish_id: null,
    side_dish_ids: [],
    cook_profile_ids: [],
    eater_profile_ids: [],
    note: '',
  })
  const [mainDish, setMainDish] = useState<DishWithNames | null>(null)
  const [sideDishes, setSideDishes] = useState<DishWithNames[]>([])
  const [picking, setPicking] = useState<'main' | 'side' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    if (initialised) return
    if (existing) {
      setValues({
        source: existing.source,
        place_name: existing.place_name ?? '',
        main_dish_id: existing.main_dish_id,
        side_dish_ids: existing.meal_slot_sides.sort((a, b) => a.position - b.position).map((s) => s.dish.id),
        cook_profile_ids: existing.meal_slot_cooks.map((c) => c.profile_id),
        eater_profile_ids: existing.meal_slot_eaters.map((e) => e.profile_id),
        note: existing.note ?? '',
      })
      if (existing.main_dish) setMainDish(existing.main_dish as unknown as DishWithNames)
      setSideDishes(existing.meal_slot_sides.sort((a, b) => a.position - b.position).map((s) => s.dish) as unknown as DishWithNames[])
      setInitialised(true)
    } else if (!isLoading) {
      // New slot: default to everyone eating (helper excluded — never counted, per CLAUDE.md decisions).
      setValues((v) => ({ ...v, eater_profile_ids: familyMembers.map((m) => m.id) }))
      setInitialised(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, isLoading])

  if (!date || !meal || isLoading || !initialised) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('common.loading')}</p>
      </FullPageMessage>
    )
  }

  const dayLabel = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long' }).format(new Date(`${date}T00:00:00`))
  const dateLabel = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${date}T00:00:00`))
  const mealLabel = t(`meal.${meal}`)

  const eaterAllergyInfo = familyMembers
    .filter((m) => values.eater_profile_ids.includes(m.id))
    .map((m) => ({ name: m.display_name, allergens: (allergyRows ?? []).filter((a) => a.profile_id === m.id).map((a) => a.allergen) }))
  const mealAllergens = [...(mainDish?.allergens ?? []), ...sideDishes.flatMap((d) => d.allergens)]
  const conflict = mealAllergyConflicts(mealAllergens, eaterAllergyInfo)

  function dishName(d: DishWithNames) {
    return dishDisplayName(d, d.dish_names, lang)
  }

  async function onSave() {
    setBusy(true)
    setError(null)
    try {
      const id = weekPlan?.id ?? (await getOrCreateWeekPlan(household.id, weekStart))
      await saveSlot(id, household.id, date!, meal!, values)
      navigate('/week', { replace: true })
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  async function onClear() {
    if (!existing) {
      navigate('/week', { replace: true })
      return
    }
    setBusy(true)
    try {
      await clearSlot(existing.id, existing.week_plan_id, household.id)
      navigate('/week', { replace: true })
    } catch (err) {
      setError(describeError(err, t))
      setBusy(false)
    }
  }

  function toggleCook(id: string) {
    setValues((v) => ({ ...v, cook_profile_ids: v.cook_profile_ids.includes(id) ? v.cook_profile_ids.filter((x) => x !== id) : [...v.cook_profile_ids, id] }))
  }
  function toggleEater(id: string) {
    setValues((v) => ({ ...v, eater_profile_ids: v.eater_profile_ids.includes(id) ? v.eater_profile_ids.filter((x) => x !== id) : [...v.eater_profile_ids, id] }))
  }

  const searchTerm = mainDish ? dishName(mainDish) : ''

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col">
      <div className="flex items-center justify-between px-2 pt-3">
        <button type="button" onClick={() => navigate('/week')} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-display text-[16px] font-semibold">{t('planner.editTitle', { day: dayLabel, meal: mealLabel })}</span>
          <span className="text-[12px] text-muted">{dateLabel}</span>
        </div>
        <button type="button" onClick={onSave} disabled={busy} className="px-3 py-2.5 text-[15px] font-semibold text-saffron-ink">
          {busy ? t('planner.saving') : t('common.save')}
        </button>
      </div>

      <div className="px-4 pt-2.5">
        <div role="radiogroup" aria-label={t('planner.mainDish')} className="grid grid-cols-3 gap-1 rounded-2xl bg-sand p-1">
          {SOURCES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={values.source === s}
              onClick={() => setValues((v) => ({ ...v, source: s }))}
              className={`h-10 rounded-[11px] text-[14px] ${values.source === s ? 'bg-white font-semibold shadow-sm' : 'font-medium text-ink-soft'}`}
            >
              {t(`planner.source.${s === 'home' ? 'home' : s === 'dine_out' ? 'dineOut' : 'orderIn'}`)}
            </button>
          ))}
        </div>
      </div>

      {values.source === 'home' ? (
        <div className="flex flex-col">
          <SectionLabel>{t('planner.mainDish')}</SectionLabel>
          <div className="mx-4 flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3.5">
            {mainDish ? (
              <>
                <DishThumb name={dishName(mainDish)} tone={0} photoPath={null} size={56} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[16px] font-semibold">{dishName(mainDish)}</span>
                  <span className="text-[12.5px] text-muted">
                    {mainDish.diet === 'veg' ? t('dishes.filters.dietVeg') : mainDish.diet === 'egg' ? t('dishes.filters.dietEgg') : t('dishes.filters.dietNonVeg')}
                  </span>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => setPicking('main')} className="flex-1 text-left text-[15px] text-muted">
                {t('planner.emptySlot')}
              </button>
            )}
            <button type="button" onClick={() => setPicking('main')} className="rounded-[10px] border-[1.5px] border-line-strong px-3 py-2 text-[13.5px] font-semibold">
              {t('planner.changeDish')}
            </button>
          </div>

          {conflict.names.length > 0 && (
            <div className="mx-4 mt-2.5 flex flex-col gap-2 rounded-2xl bg-alert-tint px-3.5 py-3 text-[13.5px] text-alert">
              <span className="flex items-center gap-2 font-semibold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l10 18H2L12 3z" />
                  <path d="M12 10v5M12 18v.5" />
                </svg>
                {t('planner.allergy.headline', { list: conflict.allergens.join(', '), names: joinNames(conflict.names) })}
              </span>
              <span>{t('planner.allergy.body')}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPicking('main')} className="rounded-lg bg-alert px-3 py-1.5 text-[13px] font-semibold text-white">
                  {t('planner.allergy.pickAnother')}
                </button>
              </div>
            </div>
          )}

          <SectionLabel>{t('planner.sidesLabel')}</SectionLabel>
          <div className="flex flex-wrap gap-2 px-4">
            {sideDishes.map((d) => (
              <span key={d.id} className="flex items-center gap-1.5 rounded-full border border-line bg-white py-2 pl-3.5 pr-1.5 text-[14px]">
                {dishName(d)}
                <button
                  type="button"
                  aria-label={dishName(d)}
                  onClick={() => {
                    setSideDishes((ds) => ds.filter((x) => x.id !== d.id))
                    setValues((v) => ({ ...v, side_dish_ids: v.side_dish_ids.filter((x) => x !== d.id) }))
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted"
                >
                  ×
                </button>
              </span>
            ))}
            {sideDishes.length < 3 && (
              <button type="button" onClick={() => setPicking('side')} className="flex h-[38px] items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-saffron-ink/60 px-3.5 text-[14px] font-semibold text-saffron-ink">
                <span aria-hidden="true">+</span>
                {t('planner.addSide')}
              </button>
            )}
          </div>

          <SectionLabel>{t('planner.cooksLabel')}</SectionLabel>
          <div className="flex flex-wrap gap-2 px-4">
            {(members ?? []).map((m, i) => {
              const on = values.cook_profile_ids.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCook(m.id)}
                  className={`flex h-11 items-center gap-2 rounded-full border py-0 pl-1.5 pr-3.5 text-[14px] ${on ? 'border-saffron bg-saffron-tint' : 'border-line bg-white'}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: avatarColor(i, m.kind) }}>
                    {m.display_name.trim()[0]?.toUpperCase()}
                  </span>
                  {m.display_name}
                  {on && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A4B00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          <SectionLabel>{t('planner.eatingLabel')}</SectionLabel>
          <div className="mx-4 flex flex-wrap gap-2">
            {familyMembers.map((m, i) => {
              const on = values.eater_profile_ids.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleEater(m.id)}
                  className={`flex h-11 items-center gap-2 rounded-full border py-0 pl-1.5 pr-3.5 text-[14px] ${on ? 'border-saffron bg-saffron-tint' : 'border-line bg-white'}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: avatarColor(i, m.kind) }}>
                    {m.display_name.trim()[0]?.toUpperCase()}
                  </span>
                  {m.display_name}
                </button>
              )
            })}
          </div>
          <p className="px-4 pt-1.5 text-[12.5px] text-muted">
            {values.eater_profile_ids.length === familyMembers.length
              ? t('planner.eatingAll', { count: familyMembers.length })
              : t('planner.eatingSome', { count: values.eater_profile_ids.length })}
            {' · '}
            {t('planner.eatingSummary', { count: values.eater_profile_ids.length })}
          </p>

          <SectionLabel htmlFor="note">{t('planner.noteLabel')}</SectionLabel>
          <div className="px-4">
            <input
              id="note"
              value={values.note}
              onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
              placeholder={t('planner.notePlaceholder')}
              className="h-12 w-full rounded-2xl border border-line-strong bg-white px-3.5 text-[15px]"
            />
          </div>

          {mainDish && (
            <>
              <SectionLabel>{t('planner.newToThisDish')}</SectionLabel>
              <div className="flex gap-2.5 px-4 pb-2">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + ' recipe')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[46px] flex-1 items-center justify-center rounded-2xl border border-line bg-white text-[13.5px] font-semibold"
                >
                  {t('dishes.detail.youtube')}
                </a>
                <a
                  href={`https://www.instagram.com/explore/tags/${encodeURIComponent(searchTerm.replace(/\s+/g, ''))}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[46px] flex-1 items-center justify-center rounded-2xl border border-line bg-white text-[13.5px] font-semibold"
                >
                  {t('dishes.detail.instagram')}
                </a>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-4 pt-5">
          <label htmlFor="place" className="px-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
            {values.source === 'dine_out' ? t('planner.dineOutPrompt') : t('planner.orderInPrompt')}
          </label>
          <input
            id="place"
            value={values.place_name}
            onChange={(e) => setValues((v) => ({ ...v, place_name: e.target.value }))}
            placeholder={values.source === 'dine_out' ? t('planner.dineOutPlaceholder') : t('planner.orderInPlaceholder')}
            className="h-12 rounded-2xl border border-line-strong bg-white px-3.5 text-[15px]"
          />
          <p className="px-1 text-[13px] text-muted">{t('planner.outHint')}</p>
        </div>
      )}

      {error && <p className="mx-4 mt-3 rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}

      <div className="mt-auto flex gap-2.5 border-t border-line px-4 py-4">
        <button type="button" onClick={onClear} disabled={busy} className="px-2 text-[15px] font-semibold text-alert">
          {t('planner.clearMeal')}
        </button>
        <Button className="flex-1" disabled={busy} onClick={onSave}>
          {busy ? t('planner.saving') : t('planner.saveMeal', { meal: mealLabel.toLowerCase() })}
        </Button>
      </div>

      {picking && (
        <DishPickerSheet
          householdId={household.id}
          title={picking === 'main' ? t('planner.changeMainTitle') : t('planner.addSideTitle')}
          course={picking}
          excludeIds={picking === 'side' ? [...sideDishes.map((d) => d.id), ...(mainDish ? [mainDish.id] : [])] : []}
          onClose={() => setPicking(null)}
          onPick={(dish) => {
            if (picking === 'main') {
              setMainDish(dish)
              setValues((v) => ({ ...v, main_dish_id: dish.id }))
            } else {
              setSideDishes((ds) => [...ds, dish])
              setValues((v) => ({ ...v, side_dish_ids: [...v.side_dish_ids, dish.id] }))
            }
            setPicking(null)
          }}
        />
      )}
    </main>
  )
}

function SectionLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  const className = 'block px-5 pb-2 pt-5 text-[12px] font-semibold uppercase tracking-wide text-muted'
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <span className={className}>{children}</span>
  )
}
