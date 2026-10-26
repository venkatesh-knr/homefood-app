import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useDishes } from '../lib/dishQueries'
import { dishDisplayName } from '../lib/dishes'
import type { MissingDish } from '../lib/nutrition'

/** "Not counted": the dishes that were eaten but have no nutrition numbers, each with a way to add them. Nothing when every dish has an estimate. */
export function MissingEstimates({ dishes }: { dishes: MissingDish[] }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { household, profile } = useHome()
  const { data: all } = useDishes(household.id)
  if (dishes.length === 0) return null
  // a home's own dish can be edited by whoever added it or the Admin; anyone else just opens it
  const canEdit = (id: string) => {
    const d = all?.find((x) => x.id === id)
    return Boolean(d && d.household_id === household.id && (profile.role === 'admin' || d.created_by === profile.id))
  }
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4" aria-labelledby="not-counted">
      <h2 id="not-counted" className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t('nutrition.missingTitle')}</h2>
      <p className="text-[13px] text-ink-soft">{t('nutrition.missingHint')}</p>
      <ul className="flex flex-col">
        {dishes.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 border-t border-line py-1 first:border-t-0">
            <span className="min-w-0 break-words text-[14.5px] font-medium">
              {dishDisplayName(d, d.dish_names as never, lang)}
              <span className="ml-2 text-[12px] font-normal text-muted">{t('nutrition.missingMeals', { count: d.meals })}</span>
            </span>
            <button type="button" onClick={() => navigate(canEdit(d.id) ? `/dishes/${d.id}/edit` : `/dishes/${d.id}`)} className="min-h-11 shrink-0 rounded-xl border border-line-strong px-3 text-[13.5px] font-semibold text-saffron-ink">
              {canEdit(d.id) ? t('nutrition.missingAdd') : t('nutrition.missingOpen')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
