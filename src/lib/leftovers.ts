// Leftovers: what is left after a home meal, until when it is good, and which later meals it can go into. Pure logic, no network.
import { addDays } from './planner'
import { MEAL_HOUR } from './prep'
import type { SlotDish } from './plannerQueries'

export type LeftoverAmount = 'little' | 'some' | 'lot'
export type KeptIn = 'fridge' | 'out'
export type LeftoverStatus = 'active' | 'used' | 'gone'

export const LEFTOVER_AMOUNTS: LeftoverAmount[] = ['little', 'some', 'lot']
export const KEPT_IN: KeptIn[] = ['fridge', 'out']
/** How many people it serves, shown on the amount chips: a little (1), some (2-3), a lot (4+). */
export const AMOUNT_PEOPLE: Record<LeftoverAmount, string> = { little: '1', some: '2–3', lot: '4+' }

/** The dish of a leftover: the same facts a meal's dishes carry, so it can become a side of a meal as it is. */
export type LeftoverDish = Pick<SlotDish, 'id' | 'name' | 'dish_names'> & Partial<SlotDish>
export type Leftover = {
  id: string
  household_id: string
  dish_id: string
  from_slot_id: string | null
  amount: LeftoverAmount
  kept_in: KeptIn
  cooked_on: string
  use_by: string
  status: LeftoverStatus
  used_slot_id: string | null
  created_by: string | null
  created_at: string
  dish: LeftoverDish | null
}

/** "Veg kurma (leftover)": a side that is a leftover says so wherever the meal is shown. */
export const withLeftoverTag = (name: string, isLeftover: boolean | undefined, tag: string): string => (isLeftover ? `${name} (${tag})` : name)

/** The last good day: cooked food in the fridge is good until the next day's dinner, food kept out until that night's dinner. */
export function lastDayFor(cookedOn: string, keptIn: KeptIn): string {
  return keptIn === 'fridge' ? addDays(cookedOn, 1) : cookedOn
}

/** The name in the screen language (falls back to English, then the plain name). */
export function leftoverName(dish: LeftoverDish | null, lang: 'en' | 'ta'): string {
  if (!dish) return ''
  return dish.dish_names.find((n) => n.language === lang)?.name ?? dish.dish_names.find((n) => n.language === 'en')?.name ?? dish.name
}

/** Leftovers still good today (use-by day not over) and not used or gone: soonest use-by first. Past their use-by they drop off quietly. */
export function activeLeftovers(list: Leftover[], today: string): Leftover[] {
  return list.filter((l) => l.status === 'active' && l.use_by >= today).sort((a, b) => a.use_by.localeCompare(b.use_by) || a.created_at.localeCompare(b.created_at))
}

/** "today" and "tomorrow" read as words; any other day as a date. Always "dinner": that is the last meal a leftover is good for. */
export function lastDayWhen(useBy: string, today: string): 'today' | 'tomorrow' | 'date' {
  if (useBy <= today) return 'today'
  if (useBy === addDays(today, 1)) return 'tomorrow'
  return 'date'
}

/** Whether a meal's leftover question is due: a home meal with a main dish, once its usual time has come (breakfast from 8 am, lunch 1 pm, snacks 5 pm, dinner 8 pm on the home's clock). */
export function leftoverPromptDue(slot: { date: string; meal: string; source: string; main_dish: unknown | null }, now: { date: string; hour: number }): boolean {
  if (slot.source !== 'home' || !slot.main_dish) return false
  if (slot.date < now.date) return true
  if (slot.date > now.date) return false
  return now.hour >= (MEAL_HOUR[slot.meal] ?? 24)
}

type SlotLike = { id: string; date: string; meal: string; source: string; main_dish: { id: string } | null; meal_slot_sides: { position: number; leftover_id?: string | null }[] }

/** Meals a leftover could go into: home meals with a main dish and a free side spot, from now (today's meals whose usual time has not passed) up to the use-by day, not one that already has it. Soonest first. */
export function mealsForLeftover(l: Pick<Leftover, 'id' | 'use_by'>, slots: SlotLike[], now: { date: string; hour: number }): SlotLike[] {
  const order = ['breakfast', 'lunch', 'snacks', 'dinner']
  return slots
    .filter((s) => s.source === 'home' && s.main_dish !== null && (s.date > now.date || (s.date === now.date && now.hour < (MEAL_HOUR[s.meal] ?? 24))) && s.date <= l.use_by && s.meal_slot_sides.length < 3 && !s.meal_slot_sides.some((x) => x.leftover_id === l.id))
    .sort((a, b) => a.date.localeCompare(b.date) || order.indexOf(a.meal) - order.indexOf(b.meal))
}

/** Leftovers that may be added to a meal on `date` in the editor: still good that day and not yet used (the ones already used in this meal are shown as its sides). */
export function leftoversForDate(list: Leftover[], date: string): Leftover[] {
  return list.filter((l) => l.status === 'active' && l.use_by >= date).sort((a, b) => a.use_by.localeCompare(b.use_by))
}
