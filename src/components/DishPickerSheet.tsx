import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCuisines, useDishes, useDishPhotoOverrides } from '../lib/dishQueries'
import {
  DEFAULT_DISH_FILTERS,
  assignableCuisines,
  cuisineLabel as cuisineLabelOf,
  dishDisplayName,
  matchesQuery,
  passesFilters,
  type DishFilters,
} from '../lib/dishes'
import { mealAllergyConflicts, type MealType } from '../lib/planner'
import type { DishWithNames } from '../lib/dishQueries'
import { DishRow } from './DishRow'

type Eater = { name: string; allergens: string[] }

/** Full-screen overlay for picking a dish (main or side) inside the slot editor, same filters as the Dishes tab
 * (cuisine, diet, meal, "safe for everyone eating") except course, which is fixed by what's being picked — a 'both'
 * dish shows for either. Meal starts on the slot's own meal (as in DishPicker.png) and can be widened to any meal.
 * Allergy badges and the safe-only filter are judged against who is actually eating this meal, not the whole home. */
export function DishPickerSheet({
  householdId,
  title,
  course,
  meal,
  eaters,
  excludeIds = [],
  onPick,
  onClose,
}: {
  householdId: string
  title: string
  course: 'main' | 'side'
  meal: MealType
  eaters: Eater[]
  excludeIds?: string[]
  onPick: (dish: DishWithNames) => void
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { data: cuisines } = useCuisines()
  const { data: dishes } = useDishes(householdId)
  const { data: overrides } = useDishPhotoOverrides(householdId)
  const [filters, setFilters] = useState<DishFilters>({ ...DEFAULT_DISH_FILTERS, course, mealType: meal })

  const leafCuisines = useMemo(() => assignableCuisines(cuisines ?? []), [cuisines])
  const cuisineById = useMemo(() => new Map((cuisines ?? []).map((c) => [c.id, c])), [cuisines])
  const overrideByDish = useMemo(() => new Map((overrides ?? []).map((o) => [o.dish_id, o.photo_path])), [overrides])
  const eaterAllergens = useMemo(() => [...new Set(eaters.flatMap((e) => e.allergens))], [eaters])

  const visible = useMemo(() => {
    return (dishes ?? [])
      .filter((d) => !excludeIds.includes(d.id))
      .filter((d) => passesFilters(d, filters, householdId, eaterAllergens))
      .filter((d) => {
        const name = dishDisplayName(d, d.dish_names, lang)
        const nameTa = d.dish_names.find((n) => n.language === 'ta')?.name
        return matchesQuery(name, nameTa, filters.query)
      })
      .sort((a, b) => dishDisplayName(a, a.dish_names, lang).localeCompare(dishDisplayName(b, b.dish_names, lang)))
  }, [dishes, excludeIds, filters, householdId, eaterAllergens, lang])

  const selectClass = 'h-8 rounded-[10px] border border-line bg-white px-2.5 text-[13px]'

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex flex-col bg-cream">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button type="button" onClick={onClose} aria-label={t('common.cancel')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <span className="font-display text-[17px] font-semibold">{title}</span>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-line-strong bg-white px-3.5 py-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E6259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder={t('dishes.searchPlaceholder')}
            className="h-[44px] flex-1 border-none bg-transparent text-[15px] outline-none"
            autoFocus
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', ...leafCuisines.map((c) => c.id), 'mine'] as const).map((id) => {
            const on = filters.cuisineId === id
            const label = id === 'all' ? t('dishes.cuisineAll') : id === 'mine' ? t('dishes.myDishes') : cuisineLabelOf(cuisineById.get(id)!, lang)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilters((f) => ({ ...f, cuisineId: id }))}
                className={`h-8 rounded-full px-3 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-white'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label={t('dishes.filters.dietAny')}
            value={filters.diet}
            onChange={(e) => setFilters((f) => ({ ...f, diet: e.target.value as DishFilters['diet'] }))}
            className={selectClass}
          >
            <option value="any">{t('dishes.filters.dietAny')}</option>
            <option value="veg">{t('dishes.filters.dietVeg')}</option>
            <option value="egg">{t('dishes.filters.dietEgg')}</option>
            <option value="non_veg">{t('dishes.filters.dietNonVeg')}</option>
          </select>
          <select
            aria-label={t('dishes.filters.mealAny')}
            value={filters.mealType}
            onChange={(e) => setFilters((f) => ({ ...f, mealType: e.target.value as DishFilters['mealType'] }))}
            className={selectClass}
          >
            <option value="any">{t('dishes.filters.mealAny')}</option>
            <option value="breakfast">{t('meal.breakfast')}</option>
            <option value="lunch">{t('meal.lunch')}</option>
            <option value="snacks">{t('meal.snacks')}</option>
            <option value="dinner">{t('meal.dinner')}</option>
          </select>
          <button
            type="button"
            aria-pressed={filters.safeOnly}
            onClick={() => setFilters((f) => ({ ...f, safeOnly: !f.safeOnly }))}
            className={`h-8 rounded-[10px] border px-2.5 text-[13px] ${filters.safeOnly ? 'border-leaf bg-leaf-tint text-leaf' : 'border-line bg-white'}`}
          >
            {t('dishes.filters.safeOnly')}
          </button>
        </div>
        <span className="font-display text-[15px] font-semibold">
          {t(visible.length === 1 ? 'dishes.countOne' : 'dishes.countOther', { count: visible.length })}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">
            <p>{t('dishes.empty')}</p>
            {filters.mealType !== 'any' && (
              <button type="button" onClick={() => setFilters((f) => ({ ...f, mealType: 'any' }))} className="font-semibold text-saffron-ink underline">
                {t('dishes.showAnyMeal')}
              </button>
            )}
          </div>
        ) : (
          visible.map((d, i) => {
            const cuisine = cuisineById.get(d.cuisine_id ?? '')
            const conflict = mealAllergyConflicts(d.allergens, eaters)
            const note =
              conflict.names.length > 0
                ? { text: t('planner.allergy.headline', { list: conflict.allergens.join(', '), names: conflict.names.join(', ') }), kind: 'allergy' as const }
                : undefined
            return (
              <DishRow
                key={d.id}
                dishId={d.id}
                name={dishDisplayName(d, d.dish_names, lang)}
                secondaryName={d.dish_names.find((n) => n.language === (lang === 'ta' ? 'en' : 'ta'))?.name}
                cuisineLabel={cuisine ? cuisineLabelOf(cuisine, lang) : ''}
                diet={d.diet}
                tone={i}
                photoPath={overrideByDish.get(d.id) ?? d.photo_path}
                note={note}
                onSelect={() => onPick(d)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
