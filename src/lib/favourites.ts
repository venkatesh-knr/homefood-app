// Pure helpers for favourite and frequently used dishes. Framework-free so they are unit-tested without a database.

/** Favourites first, then the dishes this home plans most, then alphabetical. */
export function orderDishes<T extends { id: string }>(
  dishes: T[],
  favouriteIds: Set<string>,
  usage: Map<string, number>,
  nameOf: (dish: T) => string,
): T[] {
  return [...dishes].sort((a, b) => {
    const fa = favouriteIds.has(a.id) ? 1 : 0
    const fb = favouriteIds.has(b.id) ? 1 : 0
    if (fa !== fb) return fb - fa
    const ua = usage.get(a.id) ?? 0
    const ub = usage.get(b.id) ?? 0
    if (ua !== ub) return ub - ua
    return nameOf(a).localeCompare(nameOf(b))
  })
}

/** How many times each dish was planned, counting a main dish and every side, from rows like the ones the meal_slots query returns. */
export function countUsage(slots: { main_dish_id: string | null; meal_slot_sides: { dish_id: string; is_leftover?: boolean }[] }[]): Map<string, number> {
  const counts = new Map<string, number>()
  const bump = (id: string | null) => {
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  for (const s of slots) {
    bump(s.main_dish_id)
    // a leftover is not planned again: it does not make a dish more of a favourite
    for (const side of s.meal_slot_sides) if (!side.is_leftover) bump(side.dish_id)
  }
  return counts
}
