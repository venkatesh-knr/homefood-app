// Shared types and small pure helpers for the dish catalogue. Framework-free,
// same pattern as lib/people.ts, so the filtering/display logic is unit-testable.
import { clashesHard, type Preferences } from './diets'
import { matchesWords } from './search'

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

/** True if this dish contains anything in `allergens` — used for "Suits everyone eating" (together with the hard clashes of everyday preferences). */
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
  /** Diet tags a dish must all have (low_carb, high_protein...). */
  tags: string[]
}

export const DEFAULT_DISH_FILTERS: DishFilters = {
  query: '',
  cuisineId: 'all',
  course: 'any',
  diet: 'any',
  mealType: 'any',
  safeOnly: false,
  tags: [],
}

/** Matches the search box against both languages so "தோசை" and "dosa" both find it. */
export function matchesQuery(name: string, nameTa: string | undefined, query: string): boolean {
  return matchesWords([name, nameTa], query)
}

/** The search box against a dish: its English name, its Tamil name and the name it was saved under, whatever language the screen is in. */
export function dishMatchesQuery(dish: Pick<Dish, 'name'>, names: DishNameRow[], query: string): boolean {
  return matchesWords([dish.name, ...names.map((n) => n.name)], query)
}

/** In the dish picker a main dish and a side dish are different lists, and the list also starts on the meal being planned. Snacks are the
 * exception for the main dish: a snack is usually one item (samosa, murukku, sundal) and nearly all of those are catalogued as sides. */
export function pickerStartCourse(course: 'main' | 'side', meal: MealType): DishCourse | 'any' {
  return course === 'main' && meal === 'snacks' ? 'any' : course
}

/** The filters the picker really applies. Typing in the search box lifts the dish-type and meal limits (someone who types "boiled egg"
 * wants boiled egg, even though it is catalogued as a side dish), and "include sides / mains" lifts the dish-type limit by hand. */
export function pickerFilters(filters: DishFilters, opts: { widenCourse: boolean }): DishFilters {
  const searching = filters.query.trim() !== ''
  return { ...filters, course: opts.widenCourse || searching ? 'any' : filters.course, mealType: searching ? 'any' : filters.mealType }
}

type Pickable = Pick<Dish, 'name' | 'household_id' | 'cuisine_id' | 'course' | 'diet' | 'meal_types' | 'allergens'> & { tags?: string[]; dish_names: DishNameRow[] }

/** The dishes the picker lists for these filters: the limits of passesFilters (with the search box lifting the dish-type and meal limits) and the words typed. */
export function pickerMatches<D extends Pickable>(
  dishes: D[],
  filters: DishFilters,
  opts: { widenCourse: boolean; householdId: string; allergens: string[]; prefs: Preferences[] },
): D[] {
  const applied = pickerFilters(filters, { widenCourse: opts.widenCourse })
  return dishes.filter((d) => passesFilters(d, applied, opts.householdId, opts.allergens, opts.prefs) && dishMatchesQuery(d, d.dish_names, filters.query))
}

/** Whether a dish is what the picker was opened for: the right kind of dish (a "both" dish is either) and one cooked at this meal. */
export function pickerFit(dish: Pick<Dish, 'course' | 'meal_types'>, course: 'main' | 'side', meal: MealType): { course: boolean; meal: boolean } {
  return { course: dish.course === 'both' || dish.course === course || (course === 'main' && meal === 'snacks'), meal: dish.meal_types.includes(meal) }
}

export function passesFilters(
  dish: Pick<Dish, 'household_id' | 'cuisine_id' | 'course' | 'diet' | 'meal_types' | 'allergens'> & { tags?: string[] },
  filters: DishFilters,
  householdId: string,
  householdAllergens: string[],
  prefs: Preferences[] = [],
): boolean {
  if (filters.cuisineId === 'mine' ? dish.household_id !== householdId : filters.cuisineId !== 'all' && dish.cuisine_id !== filters.cuisineId) {
    return false
  }
  if (filters.course !== 'any' && dish.course !== 'both' && dish.course !== filters.course) return false
  if (filters.diet !== 'any' && dish.diet !== filters.diet) return false
  if (filters.mealType !== 'any' && !dish.meal_types.includes(filters.mealType)) return false
  if (filters.tags.length > 0 && !filters.tags.every((x) => (dish.tags ?? []).includes(x))) return false
  if (filters.safeOnly && (dishConflictsWith(dish, householdAllergens) || clashesHard(dish, prefs))) return false
  return true
}

/** How many dishes use each cuisine, by cuisine id (dishes with no cuisine are not counted). */
export function countDishesByCuisine(dishes: { cuisine_id: string | null }[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const d of dishes) if (d.cuisine_id) out.set(d.cuisine_id, (out.get(d.cuisine_id) ?? 0) + 1)
  return out
}
