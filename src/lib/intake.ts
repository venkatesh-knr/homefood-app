// "My extras": the pure logic for a personal food log: units and amounts, the nutrition of an amount, what a day adds up to, copying
// yesterday, search, and which goal applies. Framework-free, so every part is unit-tested without a database.
// Everything here is an ESTIMATE for planning at home, not medical advice.
import { matchesWords } from './search'
import { addTotals, emptyTotals, NUTRIENTS, scaleTotals, type DayTotals, type NutrientKey, type Totals } from './nutrition'

export type FoodUnit = 'piece' | 'glass' | 'cup' | 'bowl' | 'tbsp' | 'scoop' | 'handful' | '100g' | 'serving'
/** The units a food can be counted in (a catalogue dish is counted in "servings"). */
export const FOOD_UNITS: FoodUnit[] = ['piece', 'glass', 'cup', 'bowl', 'tbsp', 'scoop', 'handful', '100g', 'serving']
export const CUSTOM_FOOD_UNITS: FoodUnit[] = ['piece', 'glass', 'cup', 'bowl', 'tbsp', 'scoop', 'handful', '100g']

export type FoodCategory = 'dairy' | 'eggs' | 'fruit' | 'nuts_seeds' | 'pulses_sprouts' | 'meat_fish' | 'drinks' | 'snacks_sweets' | 'protein'
export const FOOD_CATEGORIES: FoodCategory[] = ['dairy', 'eggs', 'fruit', 'nuts_seeds', 'pulses_sprouts', 'meat_fish', 'drinks', 'snacks_sweets', 'protein']

/** Nutrition of ONE unit of a food. A null means "unknown" (for example a custom food typed in without a label). */
export type PerUnit = Record<NutrientKey, number | null>

export type FoodSource = { kind: 'common' | 'custom' | 'dish'; id: string }

/** One thing that can be picked in the Add sheet, from any of the three places. */
export type FoodOption = {
  key: string
  source: FoodSource
  name_en: string
  name_ta: string | null
  category: FoodCategory | null
  unit: FoodUnit
  /** The usual amount (3 dates, 1 glass). */
  usual: number
  per: PerUnit
}

export const foodKey = (s: FoodSource) => `${s.kind}:${s.id}`

/** A logged item as stored: where it came from, what was eaten and the nutrition copied in at the time. */
export type IntakeRow = {
  id: string
  profile_id: string
  eaten_on: string
  eaten_at: string | null
  common_food_id: string | null
  custom_food_id: string | null
  dish_id: string | null
  food_name: string
  quantity: number
  unit: FoodUnit
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fibre_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
}

export function sourceOfRow(r: Pick<IntakeRow, 'common_food_id' | 'custom_food_id' | 'dish_id'>): FoodSource | null {
  if (r.common_food_id) return { kind: 'common', id: r.common_food_id }
  if (r.custom_food_id) return { kind: 'custom', id: r.custom_food_id }
  if (r.dish_id) return { kind: 'dish', id: r.dish_id }
  return null
}

// ── amounts ──
export const MAX_QUANTITY = 50

/** How much one tap of + or − changes the amount: whole numbers for pieces and servings, halves for the rest. */
export function quantityStep(unit: FoodUnit): number {
  return unit === 'piece' || unit === 'serving' ? 1 : 0.5
}

export function minQuantity(unit: FoodUnit): number {
  return quantityStep(unit)
}

/** Keeps an amount sensible: at least one step, at most 50, and on the unit's step (a piece is never 1.5). */
export function clampQuantity(unit: FoodUnit, quantity: number): number {
  const step = quantityStep(unit)
  const snapped = Math.round(quantity / step) * step
  return Math.min(MAX_QUANTITY, Math.max(step, snapped))
}

export function stepQuantity(unit: FoodUnit, quantity: number, direction: -1 | 1): number {
  return clampQuantity(unit, quantity + direction * quantityStep(unit))
}

/** "1", "1.5", "0.5" — an amount without trailing zeros. */
export function formatQuantity(q: number): string {
  return String(Math.round(q * 100) / 100)
}

/** Grams for 100g-portion foods, so the amount can be shown as "150 g" rather than "1.5 × 100 g". */
export function gramsOf100g(quantity: number): number {
  return Math.round(quantity * 100)
}

// ── nutrition of an amount ──
const ROUND: Record<NutrientKey, number> = { kcal: 1, protein_g: 1, carbs_g: 1, fat_g: 1, fibre_g: 1, sugar_g: 1, sodium_mg: 0 }
const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places

/** The nutrition of `quantity` units. Unknown (null) stays unknown; a known value is scaled and rounded. */
export function nutritionFor(per: PerUnit, quantity: number): PerUnit {
  const out = {} as PerUnit
  for (const k of NUTRIENTS) out[k] = per[k] === null ? null : round(per[k]! * quantity, ROUND[k])
  return out
}

/** True when the amount has no calorie figure (a custom food without a label), so it cannot be added up. */
export const isUnknown = (n: { kcal: number | null }) => n.kcal === null

/** What is saved with a logged item. */
export function snapshotFor(food: FoodOption, quantity: number): { food_name: string; quantity: number; unit: FoodUnit } & PerUnit {
  return { food_name: food.name_en, quantity, unit: food.unit, ...nutritionFor(food.per, quantity) }
}

// ── a day's extras ──
export type ExtrasDay = { totals: Totals; items: number; unknownItems: number }

/** What a list of logged items adds up to. Items with no calorie figure are counted as "not counted", not as zero. */
export function sumIntake(rows: Pick<IntakeRow, NutrientKey>[]): ExtrasDay {
  let totals = emptyTotals()
  let unknown = 0
  for (const r of rows) {
    if (r.kcal === null) {
      unknown += 1
      continue
    }
    const one = emptyTotals()
    for (const k of NUTRIENTS) one[k] = r[k] ?? 0
    totals = addTotals(totals, one)
  }
  return { totals, items: rows.length, unknownItems: unknown }
}

/** Extras per day, by date. */
export function extrasByDay(rows: IntakeRow[]): Map<string, ExtrasDay> {
  const groups = new Map<string, IntakeRow[]>()
  for (const r of rows) groups.set(r.eaten_on, [...(groups.get(r.eaten_on) ?? []), r])
  return new Map([...groups].map(([date, list]) => [date, sumIntake(list)]))
}

export type DayParts = { meals: Totals; extras: Totals; total: Totals; extraItems: number; unknownItems: number }

/** A day as two parts, the planned meals and the extras, and the total of both. */
export function mergeDay(meals: Totals, extras: ExtrasDay | undefined): DayParts {
  const e = extras?.totals ?? emptyTotals()
  return { meals, extras: e, total: addTotals(meals, e), extraItems: extras?.items ?? 0, unknownItems: extras?.unknownItems ?? 0 }
}

export type DayPart = { meals: Totals; extras: Totals; extraItems: number }

/** The days of "My nutrition" with the extras added in, and for each day the two parts (meals, extras) so the screen can show both.
 * A day with only extras counts too. Extras with no calories are not added (they stay "not counted"). */
export function mergeMealsAndExtras(days: DayTotals[], extras: Map<string, ExtrasDay>): { days: DayTotals[]; parts: Map<string, DayPart> } {
  const dates = [...new Set([...days.map((d) => d.date), ...extras.keys()])].sort()
  const parts = new Map<string, DayPart>()
  const merged = dates.map((date): DayTotals => {
    const base: DayTotals = days.find((d) => d.date === date) ?? { date, totals: emptyTotals(), meals: 0, unknownMeals: 0 }
    const e = extras.get(date)
    parts.set(date, { meals: base.totals, extras: e?.totals ?? emptyTotals(), extraItems: e ? e.items - e.unknownItems : 0 })
    return { date, totals: addTotals(base.totals, e?.totals ?? emptyTotals()), meals: base.meals + (e ? e.items - e.unknownItems : 0), unknownMeals: base.unknownMeals, fastedMeals: base.fastedMeals }
  })
  return { days: merged, parts }
}

/** The family totals function's rows for one person, as days of extras (items are never sent, only sums). */
export function extrasDaysFromTotals(rows: { eaten_on: string; totals: PerUnit; items: number; unknown_items: number }[]): Map<string, ExtrasDay> {
  const out = new Map<string, ExtrasDay>()
  for (const r of rows) {
    const t = emptyTotals()
    for (const k of NUTRIENTS) t[k] = r.totals[k] ?? 0
    out.set(r.eaten_on, { totals: t, items: r.items, unknownItems: r.unknown_items })
  }
  return out
}

// ── same as yesterday ──
export type IntakeDraft = Omit<IntakeRow, 'id' | 'eaten_on'>

const sameItem = (a: IntakeDraft | IntakeRow, b: IntakeDraft | IntakeRow) =>
  a.food_name === b.food_name && a.unit === b.unit && a.quantity === b.quantity && (a.common_food_id ?? a.custom_food_id ?? a.dish_id) === (b.common_food_id ?? b.custom_food_id ?? b.dish_id)

/** Yesterday's items as new items for today. Anything already logged today with the same food and amount is left out, so tapping twice never doubles up. */
export function sameAsYesterday(yesterday: IntakeRow[], today: IntakeRow[]): IntakeDraft[] {
  return yesterday
    .filter((y) => !today.some((t) => sameItem(y, t)))
    .map(({ id: _id, eaten_on: _day, ...rest }) => ({ ...rest }))
}

// ── Recent and My usuals ──
/** The foods eaten most recently (each once), newest first. */
export function recentSources(rows: IntakeRow[], limit = 8): FoodSource[] {
  const seen = new Set<string>()
  const out: FoodSource[] = []
  const newest = [...rows].sort((a, b) => (a.eaten_on === b.eaten_on ? (b.eaten_at ?? '').localeCompare(a.eaten_at ?? '') : a.eaten_on < b.eaten_on ? 1 : -1))
  for (const r of newest) {
    const s = sourceOfRow(r)
    if (!s || seen.has(foodKey(s))) continue
    seen.add(foodKey(s))
    out.push(s)
    if (out.length >= limit) break
  }
  return out
}

// ── search ──
const norm = (s: string) => s.toLowerCase().normalize('NFC').trim()

/** Dishes that are not already an everyday food or one of the home's own foods with the same name ("Boiled egg", "Curd" are both): the food
 * (counted in pieces, glasses, bowls) is what someone means, and listing the dish beside it only makes the list longer. */
export function withoutSameNamed(dishes: FoodOption[], foods: FoodOption[]): FoodOption[] {
  const taken = new Set(foods.map((f) => norm(f.name_en)))
  return dishes.filter((d) => !taken.has(norm(d.name_en)))
}

/** Foods whose English or Tamil name has the words typed (any order, plurals and the usual spellings are forgiven); names that start with them come first. */
export function searchFoods(options: FoodOption[], query: string): FoodOption[] {
  const q = norm(query)
  if (!q) return options
  const words = q.split(/\s+/)
  const scored: { o: FoodOption; score: number }[] = []
  for (const o of options) {
    if (!matchesWords([o.name_en, o.name_ta], query)) continue
    const en = norm(o.name_en)
    const ta = norm(o.name_ta ?? '')
    const starts = en.startsWith(q) || ta.startsWith(q) ? 0 : en.split(/\s+/).some((w) => w.startsWith(words[0]!)) ? 1 : 2
    scored.push({ o, score: starts })
  }
  return scored.sort((a, b) => a.score - b.score || a.o.name_en.localeCompare(b.o.name_en)).map((s) => s.o)
}

// ── goals ──
export type Goals = { protein_goal_g: number | null; kcal_goal: number | null }

export type GoalChoice = { value: number; personal: boolean }

/** The protein and calorie goals that apply: the person's own if they set one, else the suggested daily target. */
export function goalFor(goals: Goals | null | undefined, target: Pick<Totals, 'protein_g' | 'kcal'>): { protein: GoalChoice; kcal: GoalChoice } {
  const protein = goals?.protein_goal_g ?? null
  const kcal = goals?.kcal_goal ?? null
  return {
    protein: protein === null ? { value: target.protein_g, personal: false } : { value: protein, personal: true },
    kcal: kcal === null ? { value: target.kcal, personal: false } : { value: kcal, personal: true },
  }
}

export type GoalProgress = { eaten: number; goal: number; percent: number; remaining: number; reached: boolean }

/** "52 of 60 g": how far along, never as a warning (going over is simply shown as reached). */
export function progressOf(eaten: number, goal: number): GoalProgress {
  const e = Math.round(eaten)
  const g = Math.round(goal)
  return { eaten: e, goal: g, percent: g <= 0 ? 0 : Math.min(100, Math.round((eaten / goal) * 100)), remaining: Math.max(0, g - e), reached: g > 0 && eaten >= goal }
}

/** A goal typed by a person: empty clears it (null), otherwise a whole number within what the database allows. */
export function parseGoal(text: string, kind: 'protein' | 'kcal'): number | null | 'invalid' {
  const t = text.trim()
  if (t === '') return null
  if (!/^\d+$/.test(t)) return 'invalid'
  const n = Number(t)
  const [min, max] = kind === 'protein' ? [10, 400] : [800, 6000]
  return n >= min && n <= max ? n : 'invalid'
}

export { scaleTotals }
