import { useMemo } from 'react'
import { useHome } from './homeContext'
import { useDishPhotoOverrides } from './dishQueries'

/** Which picture to show for a dish: this home's own replacement if it set one, else the catalogue's stock photo. */
export function useDishPhotoPath(): (dish: { id: string; photo_path?: string | null } | null | undefined) => string | null {
  const { household } = useHome()
  const { data: overrides } = useDishPhotoOverrides(household.id)
  const overrideByDish = useMemo(() => new Map((overrides ?? []).map((o) => [o.dish_id, o.photo_path])), [overrides])
  return (dish) => (dish ? (overrideByDish.get(dish.id) ?? dish.photo_path ?? null) : null)
}
