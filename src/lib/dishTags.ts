// Diet tags on dishes (migration 0040): the filter chips, the flags the plans and notes read, and a home's own corrections. Pure logic, no network.

/** The tags that show as filter chips in Dishes and the dish picker, in this order. */
export const FILTER_TAGS = ['low_carb', 'high_protein', 'light', 'low_oil', 'millet', 'low_sugar', 'fasting_food'] as const
/** What a dish contains or is: used by the gentle notes and the diet plans, shown (and correctable) on Dish detail. */
export const FLAG_TAGS = ['onion_garlic', 'salty', 'oily', 'sweet', 'grain', 'pulse', 'dairy', 'added_sugar', 'meat', 'egg', 'root_veg'] as const
export const DIET_TAGS: string[] = [...FILTER_TAGS, ...FLAG_TAGS]

/** A home's corrections of one dish's tags: true = the home says the dish has it, false = it does not. */
export type TagCorrections = Map<string, boolean>
export type CorrectionsByDish = Map<string, TagCorrections>

/** The dish's tags for this home: the catalogue's, plus what the home added, minus what it took away. */
export function effectiveTags(tags: string[] | undefined, corrections: TagCorrections | undefined): string[] {
  const base = tags ?? []
  if (!corrections || corrections.size === 0) return base
  const out = new Set(base)
  for (const [tag, present] of corrections) {
    if (present) out.add(tag)
    else out.delete(tag)
  }
  return [...out]
}

/** Whether the home has a correction for this tag, and which way (for the "changed by our home" mark on Dish detail). */
export const correctionOf = (corrections: TagCorrections | undefined, tag: string): boolean | undefined => corrections?.get(tag)
