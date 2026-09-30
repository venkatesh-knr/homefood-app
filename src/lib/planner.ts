// Shared types and pure helpers for the week planner. Framework-free, same
// pattern as lib/people.ts and lib/dishes.ts, so the date/scaling/allergy
// logic is unit-testable without a database.

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner'
export type MealSource = 'home' | 'dine_out' | 'order_in'
export type SlotStatus = 'proposed' | 'confirmed' | 'done'
export type PlanStatus = 'draft' | 'published'
export type TurnScope = 'day' | 'week' | 'month'
export type TurnStatus = 'requested' | 'approved' | 'declined'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']

export type WeekPlan = {
  id: string
  household_id: string
  week_start: string // ISO date, always a Monday
  status: PlanStatus
  published_at: string | null
}

export type MealSlot = {
  id: string
  week_plan_id: string
  household_id: string
  date: string // ISO date
  meal: MealType
  source: MealSource
  place_name: string | null
  main_dish_id: string | null
  note: string | null
  status: SlotStatus
  kept_despite_disagree: boolean
  updated_at: string
}

export type PlannerTurn = {
  id: string
  household_id: string
  profile_id: string
  scope: TurnScope
  start_date: string
  end_date: string
  status: TurnStatus
  requested_by: string | null
  created_at: string
}

/** The Monday on/before `date` — households always plan Monday-start weeks. */
export function weekStartOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y!, m! - 1, d! + days)
  return toISODate(date)
}

/** The 7 ISO dates (Mon..Sun) of the week starting at `weekStartIso`. */
export function weekDates(weekStartIso: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartIso, i))
}

/** Which meal types this household plans, in order — snacks only if the home has it on. */
export function activeMealTypes(snacksEnabled: boolean): MealType[] {
  return snacksEnabled ? MEAL_TYPES : MEAL_TYPES.filter((m) => m !== 'snacks')
}

const ONE_LETTER: Record<number, string> = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'T', 5: 'F', 6: 'S' }

/** Single weekday-initial letter (M T W T F S S) for the 7-day strip, from an ISO date. */
export function weekdayLetter(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return ONE_LETTER[new Date(y!, m! - 1, d!).getDay()]!
}

/** Short localized weekday name ("Wed", "செவ்") for copy like "Copy last Wed". */
export function weekdayShort(isoDate: string, lang: 'en' | 'ta'): string {
  const fmt = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short' })
  return fmt.format(new Date(`${isoDate}T00:00:00`))
}

export function dayOfMonth(isoDate: string): number {
  return Number(isoDate.split('-')[2])
}

/** True for households whose plan for `weekStartIso` this profile can edit right now. */
export function turnCoversDate(turn: PlannerTurn, isoDate: string): boolean {
  return turn.status === 'approved' && isoDate >= turn.start_date && isoDate <= turn.end_date
}

type EaterAllergyInfo = { name: string; allergens: string[] }

/** Which of a meal's combined allergens (main + sides) actually affect someone eating it, and who. */
export function mealAllergyConflicts(
  mealAllergens: string[],
  eaters: EaterAllergyInfo[],
): { allergens: string[]; names: string[] } {
  const affectedAllergens = new Set<string>()
  const affectedNames = new Set<string>()
  for (const eater of eaters) {
    const hit = eater.allergens.filter((a) => mealAllergens.includes(a))
    if (hit.length > 0) {
      affectedNames.add(eater.name)
      hit.forEach((a) => affectedAllergens.add(a))
    }
  }
  return { allergens: [...affectedAllergens], names: [...affectedNames] }
}

export function sourceLabelKey(source: MealSource): string {
  return { home: 'planner.source.home', dine_out: 'planner.source.dineOut', order_in: 'planner.source.orderIn' }[source]
}

/** Rough meal band for the hour of day — breakfast <11, lunch <15, snacks <19, else dinner. */
function mealBandAt(hour: number): MealType {
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 19) return 'snacks'
  return 'dinner'
}

/** Today's "next up" meal card on the Today page: the current time band, or the next active
 * meal after it if this household has that one turned off (e.g. no snacks) or skips ahead of
 * it in the day. Falls back to the last active meal once the day's meals are all behind us. */
export function nextMealType(now: Date, active: MealType[]): MealType {
  const order: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']
  const from = order.indexOf(mealBandAt(now.getHours()))
  for (let i = from; i < order.length; i++) {
    const m = order[i]!
    if (active.includes(m)) return m
  }
  return active[active.length - 1] ?? 'dinner'
}

export function greetingPeriod(now: Date): 'morning' | 'afternoon' | 'evening' {
  const h = now.getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
