import { InstagramIcon, YouTubeIcon } from '../components/icons'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAllergies, useMembers } from '../lib/queries'
import { useWeekPlan, useWeekSlots } from '../lib/plannerQueries'
import { clearSlot, getOrCreateWeekPlan, saveSlot, type SlotInput } from '../lib/plannerMutations'
import { describeError } from '../lib/errors'
import { mealAllergyConflicts, OUTSIDE_MEAL_SIZES, weekStartOf, toISODate, type MealSource, type MealType } from '../lib/planner'
import { OUTSIDE_MEAL_ESTIMATES } from '../lib/nutrition'
import { cuisineLabel, dishDisplayName } from '../lib/dishes'
import { useCuisines } from '../lib/dishQueries'
import type { DishWithNames } from '../lib/dishQueries'
import { avatarColor, joinNames } from '../lib/people'
import { Button, FullPageMessage } from '../components/ui'
import { DishThumb } from '../components/DishRow'
import { useDishPhotoPath } from '../lib/dishPhotos'
import { DishPickerSheet } from '../components/DishPickerSheet'
import { FirstVisitTip } from '../components/FirstVisitTip'
import { useLeftovers } from '../lib/leftoverQueries'
import { useDietPreferences } from '../lib/dietQueries'
import { mealClashes } from '../lib/diets'
import { useDishTagCorrections } from '../lib/dishTagQueries'
import { effectiveTags } from '../lib/dishTags'
import { leftoverName, leftoversForDate, withLeftoverTag } from '../lib/leftovers'

const SOURCES: MealSource[] = ['home', 'dine_out', 'order_in']

export default function SlotEditorPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { date, meal } = useParams<{ date: string; meal: MealType }>()
  const { profile, household } = useHome()
  const isAdmin = profile.role === 'admin'
  const photoFor = useDishPhotoPath()
  const { data: cuisines } = useCuisines()

  const weekStart = toISODate(weekStartOf(new Date(`${date}T00:00:00`), household.week_start))
  const { data: weekPlan, isLoading: isWeekPlanLoading } = useWeekPlan(household.id, weekStart)
  const { data: slots, isLoading: isSlotsLoading } = useWeekSlots(household.id, weekStart)
  const { data: members } = useMembers(household.id)
  const familyMembers = (members ?? []).filter((m) => m.kind === 'family')
  const hasHelper = (members ?? []).some((m) => m.kind === 'helper')
  const memberIds = (members ?? []).map((m) => m.id)
  const { data: allergyRows } = useAllergies(memberIds)
  const { data: leftoverList } = useLeftovers(household.id)
  const { data: dietPrefs } = useDietPreferences(household.id)
  const { data: tagFixes } = useDishTagCorrections(household.id)

  // Wait for the meals and the members before filling the form, or the "new slot" default fires on empty data and
  // locks in permanently once initialised flips true.
  const isLoading = isWeekPlanLoading || isSlotsLoading || members === undefined

  const existing = slots?.find((s) => s.date === date && s.meal === meal)

  const [values, setValues] = useState<SlotInput>({
    source: 'home',
    place_name: '',
    main_dish_id: null,
    side_dish_ids: [],
    leftover_by_dish: {},
    cook_profile_ids: [],
    eater_profile_ids: [],
    note: '',
    outside_size: '',
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
        leftover_by_dish: Object.fromEntries(existing.meal_slot_sides.filter((s) => s.is_leftover && s.leftover_id).map((s) => [s.dish.id, s.leftover_id as string])),
        cook_profile_ids: existing.meal_slot_cooks.map((c) => c.profile_id),
        eater_profile_ids: existing.meal_slot_eaters.map((e) => e.profile_id),
        note: existing.note ?? '',
        outside_size: existing.outside_meal_size ?? '',
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
    .map((m) => ({ id: m.id, name: m.display_name, allergens: (allergyRows ?? []).filter((a) => a.profile_id === m.id).map((a) => a.allergen) }))
  const mealAllergens = [...(mainDish?.allergens ?? []), ...sideDishes.flatMap((d) => d.allergens)]
  const conflict = mealAllergyConflicts(mealAllergens, eaterAllergyInfo)
  const prefClashes = mealClashes(
    [...(mainDish ? [mainDish] : []), ...sideDishes].map((d) => ({ id: d.id, diet: d.diet, tags: effectiveTags(d.tags, tagFixes?.get(d.id)), name: dishDisplayName(d, d.dish_names, lang) })),
    eaterAllergyInfo.map((e) => ({ id: e.id, name: e.name })),
    dietPrefs ?? new Map(),
  )

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
  // Leftovers still good on this meal's day that are not in it yet (a leftover already in it shows as one of its sides)
  const usableLeftovers = leftoversForDate(leftoverList ?? [], date).filter((l) => !values.side_dish_ids.includes(l.dish_id))

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col">
      <div className="flex items-center justify-between px-2 pt-3">
        <button type="button" onClick={() => navigate('/week')} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-display text-[16px] font-semibold">{t('planner.editTitle', { day: dayLabel, meal: mealLabel })}</h1>
          <span className="text-[12px] text-muted">{dateLabel}</span>
        </div>
        <button type="button" onClick={onSave} disabled={busy} className="px-3 py-2.5 text-[15px] font-semibold text-saffron-ink">
          {busy ? t('planner.saving') : t('common.save')}
        </button>
      </div>

      <FirstVisitTip id="slotEditor" className="mx-4 mt-2.5" />

      <div className="px-4 pt-2.5">
        <div role="radiogroup" aria-label={t('planner.mainDish')} className="grid grid-cols-3 gap-1 rounded-2xl bg-sand p-1">
          {SOURCES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={values.source === s}
              onClick={() => setValues((v) => ({ ...v, source: s }))}
              className={`min-h-10 rounded-[11px] text-[14px] ${values.source === s ? 'bg-surface font-semibold shadow-sm' : 'font-medium text-ink-soft'}`}
            >
              {t(`planner.source.${s === 'home' ? 'home' : s === 'dine_out' ? 'dineOut' : 'orderIn'}`)}
            </button>
          ))}
        </div>
      </div>

      {values.source === 'home' ? (
        <div className="flex flex-col">
          <SectionLabel>{t('planner.mainDish')}</SectionLabel>
          <div className="mx-4 flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3.5">
            {mainDish ? (
              <>
                <DishThumb name={dishName(mainDish)} tone={0} photoPath={photoFor(mainDish)} size={56} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[16px] font-semibold">{dishName(mainDish)}</span>
                  {mainDish.dish_names.find((n) => n.language === (lang === 'ta' ? 'en' : 'ta')) && (
                    <span lang="ta" className="font-tamil text-[12.5px] text-muted">{mainDish.dish_names.find((n) => n.language === (lang === 'ta' ? 'en' : 'ta'))?.name}</span>
                  )}
                  <span className="text-[12.5px] text-muted">
                    {[
                      (() => {
                        const c = cuisines?.find((x) => x.id === mainDish.cuisine_id)
                        return c ? cuisineLabel(c, lang) : null
                      })(),
                      mainDish.diet === 'veg' ? t('dishes.filters.dietVeg') : mainDish.diet === 'egg' ? t('dishes.filters.dietEgg') : t('dishes.filters.dietNonVeg'),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
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
                <button type="button" onClick={() => setPicking('main')} className="rounded-lg bg-alert px-3 py-1.5 text-[13px] font-semibold text-on-solid">
                  {t('planner.allergy.pickAnother')}
                </button>
              </div>
            </div>
          )}

          {prefClashes.length > 0 && (
            <div role="note" className="mx-4 mt-2.5 flex flex-col gap-1 rounded-2xl bg-saffron-tint px-3.5 py-3 text-[13.5px] text-saffron-ink">
              <span className="font-semibold">{t('diets.clashTitle')}</span>
              {prefClashes.slice(0, 5).map((c) => (
                <span key={`${c.person}-${c.dish}-${c.kind}`} className="break-words">
                  {t(`diets.clash.${c.kind === 'diet' ? (dietPrefs?.get(eaterAllergyInfo.find((e) => e.name === c.person)?.id ?? '')?.diet === 'veg' ? 'diet_veg' : 'diet_egg') : c.kind}`, { person: c.person, dish: c.dish })}
                </span>
              ))}
            </div>
          )}

          <SectionLabel>{t('planner.sidesLabel')}</SectionLabel>
          <div className="flex flex-wrap gap-2 px-4">
            {sideDishes.map((d) => (
              <span key={d.id} className="flex items-center gap-1.5 rounded-full border border-line bg-surface py-2 pl-3.5 pr-1.5 text-[14px]">
                {withLeftoverTag(dishName(d), Boolean(values.leftover_by_dish?.[d.id]), t('leftovers.tag'))}
                <button
                  type="button"
                  aria-label={dishName(d)}
                  onClick={() => {
                    setSideDishes((ds) => ds.filter((x) => x.id !== d.id))
                    setValues((v) => {
                      const { [d.id]: _removed, ...rest } = v.leftover_by_dish ?? {}
                      return { ...v, side_dish_ids: v.side_dish_ids.filter((x) => x !== d.id), leftover_by_dish: rest }
                    })
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted"
                >
                  ×
                </button>
              </span>
            ))}
            {sideDishes.length < 3 && (
              <button type="button" onClick={() => setPicking('side')} className="flex min-h-[38px] items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-saffron-ink/60 px-3.5 text-[14px] font-semibold text-saffron-ink">
                <span aria-hidden="true">+</span>
                {t('planner.addSide')}
              </button>
            )}
          </div>

          {usableLeftovers.length > 0 && (
            <>
              <SectionLabel>{t('leftovers.editorTitle')}</SectionLabel>
              <div className="flex flex-wrap gap-2 px-4">
                {usableLeftovers.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    disabled={sideDishes.length >= 3}
                    aria-label={t('leftovers.editorAdd', { name: leftoverName(l.dish, lang) })}
                    onClick={() => {
                      if (!l.dish) return
                      setSideDishes((ds) => [...ds, l.dish as unknown as DishWithNames])
                      setValues((v) => ({ ...v, side_dish_ids: [...v.side_dish_ids, l.dish_id], leftover_by_dish: { ...(v.leftover_by_dish ?? {}), [l.dish_id]: l.id } }))
                    }}
                    className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-saffron/50 bg-saffron-tint px-3.5 text-[14px] font-semibold text-saffron-ink disabled:opacity-50"
                  >
                    <span aria-hidden="true">+</span>
                    {leftoverName(l.dish, lang)}
                  </button>
                ))}
              </div>
              <p className="px-4 pt-1.5 text-[12.5px] leading-relaxed text-muted">{t('leftovers.editorHint')}</p>
            </>
          )}

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
                  className={`flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1.5 pr-3.5 text-[14px] ${on ? 'border-saffron bg-saffron-tint' : 'border-line bg-surface'}`}
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
          {isAdmin && !hasHelper && <p className="px-4 pt-1.5 text-[12.5px] leading-relaxed text-muted">{t('planner.addHelperHint')}</p>}

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
                  className={`flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1.5 pr-3.5 text-[14px] ${on ? 'border-saffron bg-saffron-tint' : 'border-line bg-surface'}`}
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
              className="h-12 w-full rounded-2xl border border-line-strong bg-surface px-3.5 text-[15px]"
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
                  aria-label={t('dishes.detail.youtube')}
                  title={t('dishes.detail.youtube')}
                  className="flex h-[46px] flex-1 items-center justify-center rounded-2xl border border-line bg-surface"
                >
                  <YouTubeIcon size={26} />
                </a>
                <a
                  href={`https://www.instagram.com/explore/tags/${encodeURIComponent(searchTerm.replace(/\s+/g, ''))}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('dishes.detail.instagram')}
                  title={t('dishes.detail.instagram')}
                  className="flex h-[46px] flex-1 items-center justify-center rounded-2xl border border-line bg-surface"
                >
                  <InstagramIcon size={24} />
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
            className="h-12 rounded-2xl border border-line-strong bg-surface px-3.5 text-[15px]"
          />
          <p className="px-1 text-[13px] text-muted">{t('planner.outHint')}</p>

          <span id="outside-size" className="px-1 pt-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            {t('planner.outsideSize.label')}
          </span>
          <div role="radiogroup" aria-labelledby="outside-size" className="grid grid-cols-4 ta:grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
            {(['', ...OUTSIDE_MEAL_SIZES] as const).map((size) => (
              <button
                key={size || 'none'}
                type="button"
                role="radio"
                aria-checked={(values.outside_size ?? '') === size}
                onClick={() => setValues((v) => ({ ...v, outside_size: size }))}
                className={`min-h-[44px] rounded-[11px] px-1 text-[13.5px] ${(values.outside_size ?? '') === size ? 'bg-surface font-semibold shadow-sm' : 'font-medium text-ink-soft'}`}
              >
                {t(`planner.outsideSize.${size || 'none'}`)}
              </button>
            ))}
          </div>
          <p className="px-1 text-[12.5px] text-muted" aria-live="polite">
            {values.outside_size ? t('planner.outsideSize.about', { kcal: OUTSIDE_MEAL_ESTIMATES[values.outside_size].kcal }) : t('planner.outsideSize.hint')}
          </p>
        </div>
      )}

      {error && <p className="mx-4 mt-3 rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}

      <div className="sticky bottom-16 z-10 mt-auto flex gap-2.5 border-t border-line bg-cream px-4 py-4">
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
          meal={meal}
          eaters={eaterAllergyInfo}
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
