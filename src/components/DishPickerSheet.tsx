import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCuisines, useDishes } from '../lib/dishQueries'
import { assignableCuisines, cuisineLabel as cuisineLabelOf, dishDisplayName, matchesQuery } from '../lib/dishes'
import type { DishWithNames } from '../lib/dishQueries'
import { DishRow } from './DishRow'

/** Full-screen overlay for picking a dish (main or side) inside the slot editor — search + cuisine chips, tap to pick.
 * Restricted to dishes whose course matches (a 'both' dish, e.g. a side that also works as a light main, shows for
 * either) so picking a side doesn't list the whole catalogue again, mains included. */
export function DishPickerSheet({
  householdId,
  title,
  course,
  excludeIds = [],
  onPick,
  onClose,
}: {
  householdId: string
  title: string
  course: 'main' | 'side'
  excludeIds?: string[]
  onPick: (dish: DishWithNames) => void
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { data: cuisines } = useCuisines()
  const { data: dishes } = useDishes(householdId)
  const [query, setQuery] = useState('')
  const [cuisineId, setCuisineId] = useState<'all' | string>('all')

  const leafCuisines = useMemo(() => assignableCuisines(cuisines ?? []), [cuisines])
  const cuisineById = useMemo(() => new Map((cuisines ?? []).map((c) => [c.id, c])), [cuisines])

  const visible = useMemo(() => {
    return (dishes ?? [])
      .filter((d) => !excludeIds.includes(d.id))
      .filter((d) => d.course === 'both' || d.course === course)
      .filter((d) => cuisineId === 'all' || d.cuisine_id === cuisineId)
      .filter((d) => {
        const name = dishDisplayName(d, d.dish_names, lang)
        const nameTa = d.dish_names.find((n) => n.language === 'ta')?.name
        return matchesQuery(name, nameTa, query)
      })
      .sort((a, b) => dishDisplayName(a, a.dish_names, lang).localeCompare(dishDisplayName(b, b.dish_names, lang)))
  }, [dishes, excludeIds, course, cuisineId, query, lang])

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('dishes.searchPlaceholder')}
            className="h-[44px] flex-1 border-none bg-transparent text-[15px] outline-none"
            autoFocus
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={cuisineId === 'all'}
            onClick={() => setCuisineId('all')}
            className={`h-8 rounded-full px-3 text-[13px] font-semibold ${cuisineId === 'all' ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-white'}`}
          >
            {t('dishes.cuisineAll')}
          </button>
          {leafCuisines.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cuisineId === c.id}
              onClick={() => setCuisineId(c.id)}
              className={`h-8 rounded-full px-3 text-[13px] font-semibold ${cuisineId === c.id ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-white'}`}
            >
              {cuisineLabelOf(c, lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
        {visible.length === 0 ? (
          <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('dishes.empty')}</p>
        ) : (
          visible.map((d, i) => {
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
                photoPath={d.photo_path}
                onSelect={() => onPick(d)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
