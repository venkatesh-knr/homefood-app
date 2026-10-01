import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useAllergies, useMembers } from '../lib/queries'
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
import { DishRow } from '../components/DishRow'

export default function DishesPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { household } = useHome()
  const { data: cuisines } = useCuisines()
  const { data: dishes } = useDishes(household.id)
  const { data: overrides } = useDishPhotoOverrides(household.id)
  const { data: members } = useMembers(household.id)
  const memberIds = useMemo(() => (members ?? []).map((m) => m.id), [members])
  const { data: allergyRows } = useAllergies(memberIds)
  const photoInput = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState<DishFilters>(DEFAULT_DISH_FILTERS)

  const leafCuisines = useMemo(() => assignableCuisines(cuisines ?? []), [cuisines])
  const householdAllergens = useMemo(() => [...new Set((allergyRows ?? []).map((a) => a.allergen))], [allergyRows])
  const overrideByDish = useMemo(() => new Map((overrides ?? []).map((o) => [o.dish_id, o.photo_path])), [overrides])
  const memberById = useMemo(() => new Map((members ?? []).map((m) => [m.id, m.display_name])), [members])
  const cuisineById = useMemo(() => new Map((cuisines ?? []).map((c) => [c.id, c])), [cuisines])

  const visible = useMemo(() => {
    return (dishes ?? [])
      .filter((d) => passesFilters(d, filters, household.id, householdAllergens))
      .filter((d) => {
        const name = dishDisplayName(d, d.dish_names, lang)
        const nameTa = d.dish_names.find((n) => n.language === 'ta')?.name
        return matchesQuery(name, nameTa, filters.query)
      })
      .sort((a, b) => dishDisplayName(a, a.dish_names, lang).localeCompare(dishDisplayName(b, b.dish_names, lang)))
  }, [dishes, filters, household.id, householdAllergens, lang])

  function onSnapPhoto(file: File | undefined) {
    if (!file) return
    navigate('/dishes/new', { state: { initialPhoto: file } })
  }

  return (
    <main className="flex flex-col gap-3 px-5 pb-8">
      <div className="flex items-center gap-2.5 rounded-2xl border border-line-strong bg-white px-3.5 py-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          type="search"
          value={filters.query}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          placeholder={t('dishes.searchPlaceholder')}
          className="h-[46px] flex-1 border-none bg-transparent text-[15px] outline-none"
        />
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => navigate('/dishes/new')}
          className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 text-[14px] font-semibold text-saffron-ink"
        >
          <span aria-hidden="true">+</span>
          {t('dishes.addNew')}
        </button>
        <button
          type="button"
          onClick={() => photoInput.current?.click()}
          className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 text-[14px] font-semibold text-saffron-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v12H4z" />
            <circle cx="12" cy="14" r="4" />
          </svg>
          {t('dishes.snap')}
        </button>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onSnapPhoto(e.target.files?.[0])}
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
              className={`h-9 rounded-full px-3.5 text-[13.5px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-white text-ink'}`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filters.course}
          onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value as DishFilters['course'] }))}
          className="h-8 rounded-[10px] border border-line bg-white px-2.5 text-[13px]"
        >
          <option value="any">{t('dishes.filters.courseAny')}</option>
          <option value="main">{t('dishes.filters.courseMain')}</option>
          <option value="side">{t('dishes.filters.courseSide')}</option>
        </select>
        <select
          value={filters.diet}
          onChange={(e) => setFilters((f) => ({ ...f, diet: e.target.value as DishFilters['diet'] }))}
          className="h-8 rounded-[10px] border border-line bg-white px-2.5 text-[13px]"
        >
          <option value="any">{t('dishes.filters.dietAny')}</option>
          <option value="veg">{t('dishes.filters.dietVeg')}</option>
          <option value="egg">{t('dishes.filters.dietEgg')}</option>
          <option value="non_veg">{t('dishes.filters.dietNonVeg')}</option>
        </select>
        <select
          value={filters.mealType}
          onChange={(e) => setFilters((f) => ({ ...f, mealType: e.target.value as DishFilters['mealType'] }))}
          className="h-8 rounded-[10px] border border-line bg-white px-2.5 text-[13px]"
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

      <div className="flex items-baseline justify-between pt-1">
        <span className="font-display text-[15px] font-semibold">
          {t(visible.length === 1 ? 'dishes.countOne' : 'dishes.countOther', { count: visible.length })}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('dishes.empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((d, i) => {
            const conflict = d.allergens.filter((a) => householdAllergens.includes(a))
            const note =
              conflict.length > 0
                ? { text: t('dishes.rowAllergyNote', { list: conflict.join(', ') }), kind: 'allergy' as const }
                : d.household_id === household.id
                  ? { text: t('dishes.rowAddedBy', { name: memberById.get(d.created_by ?? '') ?? '' }), kind: 'mine' as const }
                  : undefined
            const cuisine = cuisineById.get(d.cuisine_id ?? '')
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
              />
            )
          })}
        </div>
      )}

      <p className="pt-1 text-center text-[12px] text-muted">{t('dishes.dietMarkHint')}</p>
    </main>
  )
}
