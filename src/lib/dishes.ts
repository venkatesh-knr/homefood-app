// Shared types and small pure helpers for the dish catalogue. Framework-free,
// same pattern as lib/people.ts, so the filtering/display logic is unit-testable.

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner'
export type DishCourse = 'main' | 'side' | 'both'
export type DietType = 'veg' | 'egg' | 'non_veg'

export type Cuisine = {
  id: string
  household_id: string | null
  parent_id: string | null
  name: string
  name_ta: string | null
  sort_order: number
}

export type Dish = {
  id: string
  household_id: string | null
  cuisine_id: string | null
  name: string
  meal_types: MealType[]
  course: DishCourse
  diet: DietType
  tags: string[]
  allergens: string[]
  prep_minutes: number | null
  photo_path: string | null
  photo_credit: string | null
  recipe_search: string | null
  where_seen: string | null
  created_by: string | null
  created_at: string
}

export type DishNameRow = { language: 'en' | 'ta'; name: string }

/** dishes.name is the fallback; dish_names carries the per-language version when there is one. */
export function dishDisplayName(dish: Pick<Dish, 'name'>, names: DishNameRow[], language: 'en' | 'ta'): string {
  return names.find((n) => n.language === language)?.name ?? dish.name
}

export function cuisineLabel(cuisine: Cuisine, language: 'en' | 'ta'): string {
  return (language === 'ta' && cuisine.name_ta) || cuisine.name
}

/** Cuisines a dish can actually be tagged with — leaves of the tree, not pure grouping
 * parents. "European"/"Japanese" have no parent_id (same as "Indian") but aren't
 * themselves anyone's parent, so they're assignable; "Indian" is, so it's excluded even
 * though nothing in its own row marks it as a group. Filtering on parent_id alone (only
 * cuisines that have one) would wrongly hide European/Japanese too. */
export function assignableCuisines(cuisines: Cuisine[]): Cuisine[] {
  const parentIds = new Set(cuisines.map((c) => c.parent_id).filter((id): id is string => id !== null))
  return cuisines.filter((c) => !parentIds.has(c.id))
}

const DISH_TONE_PALETTE = ['#F3D27A', '#D9643A', '#C08A5B', '#6B4A3A', '#EFE3C8']
/** These tones are dark enough that the initial letter needs to be light, not ink-coloured. */
const DARK_TONES = new Set(['#D9643A', '#C08A5B', '#6B4A3A'])

export function dishTone(index: number): { background: string; ink: string } {
  const background = DISH_TONE_PALETTE[index % DISH_TONE_PALETTE.length]!
  return { background, ink: DARK_TONES.has(background) ? '#FFF8EE' : '#2B2622' }
}

const DIET_COLORS: Record<DietType, string> = { veg: '#2F7A3E', egg: '#8A5A00', non_veg: '#B3261E' }
export function dietColor(diet: DietType): string {
  return DIET_COLORS[diet]
}

/** True if this dish contains anything in `allergens` — used for "safe for everyone eating". */
export function dishConflictsWith(dish: Pick<Dish, 'allergens'>, allergens: string[]): boolean {
  return dish.allergens.some((a) => allergens.includes(a))
}

export type DishFilters = {
  query: string
  cuisineId: string | 'all' | 'mine'
  course: DishCourse | 'any'
  diet: DietType | 'any'
  mealType: MealType | 'any'
  safeOnly: boolean
}

export const DEFAULT_DISH_FILTERS: DishFilters = {
  query: '',
  cuisineId: 'all',
  course: 'any',
  diet: 'any',
  mealType: 'any',
  safeOnly: false,
}

/** Matches the search box against both languages so "தோசை" and "dosa" both find it. */
export function matchesQuery(name: string, nameTa: string | undefined, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return name.toLowerCase().includes(q) || Boolean(nameTa?.toLowerCase().includes(q))
}

export function passesFilters(
  dish: Pick<Dish, 'household_id' | 'cuisine_id' | 'course' | 'diet' | 'meal_types' | 'allergens'>,
  filters: DishFilters,
  householdId: string,
  householdAllergens: string[],
): boolean {
  if (filters.cuisineId === 'mine' ? dish.household_id !== householdId : filters.cuisineId !== 'all' && dish.cuisine_id !== filters.cuisineId) {
    return false
  }
  if (filters.course !== 'any' && dish.course !== 'both' && dish.course !== filters.course) return false
  if (filters.diet !== 'any' && dish.diet !== filters.diet) return false
  if (filters.mealType !== 'any' && !dish.meal_types.includes(filters.mealType)) return false
  if (filters.safeOnly && dishConflictsWith(dish, householdAllergens)) return false
  return true
}
