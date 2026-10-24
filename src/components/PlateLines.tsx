import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { plateDishes } from '../lib/plates'
import type { SlotWithDetails } from '../lib/plannerQueries'

/** One line per diet plate of a meal: "Diet plate · Amma + Appa" and what is on it. Nothing when the meal has no plate. */
export function PlateLines({ slot, className = '' }: { slot: Pick<SlotWithDetails, 'plates' | 'meal_slot_sides'>; className?: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { household } = useHome()
  const { data: members } = useMembers(household.id)
  const plates = slot.plates ?? []
  if (plates.length === 0) return null
  const nameOf = (id: string) => (members ?? []).find((m) => m.id === id)?.display_name ?? ''
  const dishName = (d: { name: string; dish_names: { language: string; name: string }[] }) => d.dish_names.find((n) => n.language === lang)?.name ?? d.name
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {plates.map((p) => {
        const dishes = plateDishes(slot, p).map(dishName)
        return (
          <p key={p.id} className="break-words text-[12.5px] leading-snug text-dinner-ink">
            <span className="font-semibold">{t('plates.line', { names: p.eater_ids.map(nameOf).filter(Boolean).join(' + ') })}</span>
            {dishes.length > 0 && `: ${dishes.join(', ')}`}
          </p>
        )
      })}
    </div>
  )
}
