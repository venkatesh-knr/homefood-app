import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toggle } from './ui'
import { useHome } from '../lib/homeContext'
import { useCanEditPrep } from '../lib/useCanPlan'
import { describeError } from '../lib/errors'
import { DIET_TAGS, FILTER_TAGS, correctionOf, effectiveTags } from '../lib/dishTags'
import { useDishTagCorrections } from '../lib/dishTagQueries'
import { setDishTag } from '../lib/dishTagMutations'

/** Dish detail: the diet tags of a dish (worked out from its ingredients and nutrition), with the home's own corrections. Everyone sees them;
 * the Admin, or whoever is the Planner today, can correct them for the home. Guidance, not a verdict. */
export function DishTagsSection({ dishId, catalogueTags }: { dishId: string; catalogueTags: string[] }) {
  const { t } = useTranslation()
  const { profile, household } = useHome()
  const canEdit = useCanEditPrep()
  const { data: all } = useDishTagCorrections(household.id)
  const corrections = all?.get(dishId)
  const tags = effectiveTags(catalogueTags, corrections)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Nothing worked out for this dish (a dish the home added itself) and nobody to correct it: nothing to show.
  if (!editing && tags.filter((x) => DIET_TAGS.includes(x)).length === 0 && !canEdit) return null

  async function toggle(tag: string, present: boolean) {
    setBusy(tag)
    setError(null)
    try {
      await setDishTag({ householdId: household.id, dishId, tag, present, catalogueHas: catalogueTags.includes(tag), by: profile.id })
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(null)
    }
  }

  const shown = DIET_TAGS.filter((x) => tags.includes(x))
  return (
    <section aria-label={t('dishTags.title')} className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[17px] font-semibold">{t('dishTags.title')}</h2>
        {canEdit && (
          <button type="button" onClick={() => setEditing((e) => !e)} aria-expanded={editing} className="min-h-[44px] px-1 text-[13.5px] font-semibold text-saffron-ink underline">
            {editing ? t('shopping.done') : t('dishTags.correct')}
          </button>
        )}
      </div>
      <div className="rounded-2xl border border-line bg-surface p-3.5">
        {!editing ? (
          shown.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {shown.map((x) => (
                <span key={x} className={`rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${(FILTER_TAGS as readonly string[]).includes(x) ? 'bg-leaf-tint text-leaf' : 'bg-sand text-ink-soft'}`}>
                  {t(`dishTags.tag.${x}`)}
                  {correctionOf(corrections, x) !== undefined && <span aria-label={t('dishTags.changed')}> *</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13.5px] text-muted">{t('dishTags.none')}</p>
          )
        ) : (
          <div className="flex flex-col">
            {DIET_TAGS.map((x, i) => (
              <div key={x} className={`flex min-h-[48px] items-center justify-between gap-3 py-1 ${i > 0 ? 'border-t border-line' : ''}`}>
                <span className="min-w-0 break-words text-[14.5px]">
                  {t(`dishTags.tag.${x}`)}
                  {correctionOf(corrections, x) !== undefined && <span className="ml-1.5 text-[12px] text-saffron-ink">{t('dishTags.changed')}</span>}
                </span>
                <span className={busy === x ? 'opacity-60' : ''}>
                  <Toggle checked={tags.includes(x)} onChange={(on) => void toggle(x, on)} label={t(`dishTags.tag.${x}`)} />
                </span>
              </div>
            ))}
          </div>
        )}
        {error && <p role="alert" className="pt-2 text-[13px] text-alert">{error}</p>}
      </div>
      <p className="px-1 text-[12px] leading-relaxed text-muted">{t(editing ? 'dishTags.editHint' : 'dishTags.hint')}</p>
    </section>
  )
}
