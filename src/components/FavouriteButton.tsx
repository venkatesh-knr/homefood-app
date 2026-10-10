import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useFavourites } from '../lib/favouriteQueries'
import { setFavourite } from '../lib/favouriteMutations'
import { HeartIcon } from './icons'

/** A heart that adds or removes a dish from the home's favourites. Sits beside a row, never inside its tap target. */
export function FavouriteButton({ dishId, size = 22 }: { dishId: string; size?: number }) {
  const { t } = useTranslation()
  const { household } = useHome()
  const { data: favourites } = useFavourites(household.id)
  const [busy, setBusy] = useState(false)
  const on = favourites?.has(dishId) ?? false
  const label = on ? t('dishes.favouriteRemove') : t('dishes.favouriteAdd')

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          await setFavourite(household.id, dishId, !on)
        } catch {
          // the heart simply stays as it was; nothing else on screen depends on it
        } finally {
          setBusy(false)
        }
      }}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${on ? 'text-alert' : 'text-muted'}`}
    >
      <HeartIcon size={size} filled={on} />
    </button>
  )
}
