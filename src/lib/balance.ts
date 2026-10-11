// The weekly balance check behind the Week tab's gentle banner. Pure and framework-free, so it is unit-tested without a database.
import { addDays, type MealType } from './planner'
import type { SlotDish, SlotWithDetails } from './plannerQueries'

export type BalanceLimits = {
  /** A main dish planned this many times in the week (or more) is mentioned. */
  sameMain: number
  /** More than this many meals with a fried dish are mentioned. */
  fried: number
  /** This many dine-out / order-in meals in a row (or more) are mentioned. */
  outRun: number
}

export const DEFAULT_BALANCE: BalanceLimits = { sameMain: 3, fried: 4, outRun: 3 }

/** What the Admin may set in Home settings (matches the checks in migration 0024). */
export const BALANCE_RANGE: Record<keyof BalanceLimits, { min: number; max: number }> = {
  sameMain: { min: 2, max: 14 },
  fried: { min: 0, max: 28 },
  outRun: { min: 2, max: 14 },
}

type HomeLimits = { balance_same_main?: number | null; balance_fried?: number | null; balance_out_run?: number | null }

/** The home's limits, or the defaults while migration 0024 has not been run (the columns do not exist yet). */
export function limitsOf(home: HomeLimits): BalanceLimits {
  return {
    sameMain: home.balance_same_main ?? DEFAULT_BALANCE.sameMain,
    fried: home.balance_fried ?? DEFAULT_BALANCE.fried,
    outRun: home.balance_out_run ?? DEFAULT_BALANCE.outRun,
  }
}

export type BalanceNote =
  | { kind: 'sameMain'; dish: SlotDish; count: number }
  | { kind: 'fried'; count: number }
  | { kind: 'noVegetable'; dates: string[] }
  | { kind: 'eatingOut'; count: number }

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']
const dishesOf = (s: SlotWithDetails): SlotDish[] => (s.main_dish ? [s.main_dish, ...s.meal_slot_sides.map((x) => x.dish)] : s.meal_slot_sides.map((x) => x.dish))
const has = (d: SlotDish, tag: string) => (d.tags ?? []).includes(tag)

/** What looks unbalanced about the week that starts on `weekStart`. Days before `today` are not nagged about (they are done). */
export function weekBalance(slots: SlotWithDetails[], limits: BalanceLimits, opts: { weekStart: string; today: string; meals: MealType[]; checkVegetables?: boolean }): BalanceNote[] {
  const notes: BalanceNote[] = []
  const home = slots.filter((s) => s.source === 'home')

  // the same main dish again and again
  const mains = new Map<string, { dish: SlotDish; count: number }>()
  for (const s of home) {
    if (!s.main_dish) continue
    const e = mains.get(s.main_dish.id)
    if (e) e.count++
    else mains.set(s.main_dish.id, { dish: s.main_dish, count: 1 })
  }
  for (const e of [...mains.values()].filter((m) => m.count >= limits.sameMain).sort((a, b) => b.count - a.count || a.dish.name.localeCompare(b.dish.name))) {
    notes.push({ kind: 'sameMain', dish: e.dish, count: e.count })
  }

  // too many fried meals
  const fried = home.filter((s) => dishesOf(s).some((d) => has(d, 'fried'))).length
  if (fried > limits.fried) notes.push({ kind: 'fried', count: fried })

  // days still to come with no vegetable dish at home (skipped until the dishes carry the tag: migration 0024)
  const dates: string[] = []
  for (let i = 0; i < 7 && opts.checkVegetables !== false; i++) {
    const date = addDays(opts.weekStart, i)
    if (date < opts.today) continue
    const day = home.filter((s) => s.date === date)
    const hasMainMeal = day.some((s) => (s.meal === 'lunch' || s.meal === 'dinner') && s.main_dish)
    if (hasMainMeal && !day.some((s) => dishesOf(s).some((d) => has(d, 'vegetable')))) dates.push(date)
  }
  if (dates.length > 0) notes.push({ kind: 'noVegetable', dates })

  // meals out or ordered in, one after another (a meal not planned yet ends the run)
  const bySlot = new Map(slots.map((s) => [`${s.date}|${s.meal}`, s]))
  let run = 0
  let longest = 0
  for (let i = 0; i < 7; i++) {
    const date = addDays(opts.weekStart, i)
    for (const meal of MEAL_ORDER.filter((m) => opts.meals.includes(m))) {
      const s = bySlot.get(`${date}|${meal}`)
      run = s && s.source !== 'home' ? run + 1 : 0
      longest = Math.max(longest, run)
    }
  }
  if (longest >= limits.outRun) notes.push({ kind: 'eatingOut', count: longest })

  return notes
}

/** A short fingerprint of what the banner says, so a dismissed banner comes back only if the notes change. */
export function notesSignature(notes: BalanceNote[]): string {
  return notes
    .map((n) => (n.kind === 'sameMain' ? `m:${n.dish.id}:${n.count}` : n.kind === 'fried' ? `f:${n.count}` : n.kind === 'noVegetable' ? `v:${n.dates.join(',')}` : `o:${n.count}`))
    .join('|')
}
