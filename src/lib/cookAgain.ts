// "Cook this again": which of the next 14 days can take a dish for a given meal, and what the person asking may do about each.
// Pure and framework-free, so it is unit-tested without a database.
import { addDays, type MealType } from './planner'
import type { SlotWithDetails } from './plannerQueries'

export const COOK_AGAIN_DAYS = 14

export type CookAgainDay = {
  date: string
  /** `free`: nothing planned for this meal yet. `planned`: something is there and is never replaced. */
  state: 'free' | 'planned'
  slot: SlotWithDetails | undefined
  /** What the person asking may do here: put the dish in a free slot, suggest it for a planned one, or nothing. */
  action: 'plan' | 'suggest' | 'none'
}

/** A meal that exists but has no dish and no place is as good as free (the editor can leave one behind). */
export function isFreeSlot(slot: SlotWithDetails | undefined): boolean {
  return !slot || (!slot.main_dish_id && !slot.place_name)
}

export function cookAgainDays(slots: SlotWithDetails[], opts: { today: string; meal: MealType; canPlan: (date: string) => boolean; days?: number }): CookAgainDay[] {
  const out: CookAgainDay[] = []
  for (let i = 0; i < (opts.days ?? COOK_AGAIN_DAYS); i++) {
    const date = addDays(opts.today, i)
    const slot = slots.find((s) => s.date === date && s.meal === opts.meal)
    const free = isFreeSlot(slot)
    const mayPlan = opts.canPlan(date)
    out.push({ date, state: free ? 'free' : 'planned', slot, action: free ? (mayPlan ? 'plan' : 'none') : mayPlan ? 'none' : 'suggest' })
  }
  return out
}

/** The meal to start on: the one the dish is usually eaten at, among the meals this home plans. */
export function defaultCookAgainMeal(dishMeals: MealType[], active: MealType[]): MealType {
  return dishMeals.find((m) => active.includes(m)) ?? active[0] ?? 'dinner'
}
