import { useTranslation } from 'react-i18next'
import { guestPeople, guestsOf, hasGuests } from '../lib/guests'
import type { MealSlot } from '../lib/planner'

/** "+ 4 guests · one guest has no nuts" on a meal card. Nothing when nobody is coming. */
export function GuestLine({ slot, className = '' }: { slot: Pick<MealSlot, 'guest_adults' | 'guest_children' | 'guest_note'>; className?: string }) {
  const { t } = useTranslation()
  const g = guestsOf(slot)
  if (!hasGuests(g)) return null
  return (
    <p className={`break-words text-[12.5px] font-semibold leading-snug text-saffron-ink ${className}`}>
      + {t('guests.line', { count: guestPeople(g) })}
      {g.note && <span className="font-normal text-ink-soft">{` · ${g.note}`}</span>}
    </p>
  )
}
