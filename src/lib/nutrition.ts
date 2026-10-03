// Pure nutrition logic: per-dish estimates, who a day's meals add up for, comparison with a person's daily target and the
// gentle tips that come out of it. Framework-free so it is unit-tested without a database.
// Everything here is an ESTIMATE for planning at home, not medical advice.

import { ageBand, type AgeBand } from './people'

export type NutrientKey = 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g' | 'fibre_g' | 'sugar_g' | 'sodium_mg'
export type Totals = Record<NutrientKey, number>

export const NUTRIENTS: NutrientKey[] = ['kcal', 'protein_g', 'carbs_g', 'fat_g', 'fibre_g', 'sugar_g', 'sodium_mg']

export type NutritionRow = Totals & { dish_id: string; serving: string; is_estimate: boolean; source: string }
export type TargetRow = Totals & { age_band: AgeBand; sex: 'female' | 'male'; activity: 'light' | 'moderate' | 'active' }

export function emptyTotals(): Totals {
  return { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fibre_g: 0, sugar_g: 0, sodium_mg: 0 }
}

export function addTotals(a: Totals, b: Totals): Totals {
  const out = emptyTotals()
  for (const k of NUTRIENTS) out[k] = a[k] + b[k]
  return out
}

export function totalsOf(row: Totals): Totals {
  const out = emptyTotals()
  for (const k of NUTRIENTS) out[k] = Number(row[k])
  return out
}

/** "An adult's day" used for the bars on a dish page (2000 kcal reference). */
export const ADULT_REFERENCE: Totals = { kcal: 2000, protein_g: 55, carbs_g: 275, fat_g: 55, fibre_g: 30, sugar_g: 50, sodium_mg: 2000 }

export function percentOf(value: number, reference: number): number {
  return reference <= 0 ? 0 : Math.round((value / reference) * 100)
}

type MealLike = {
  source: string
  main_dish_id: string | null
  meal_slot_sides: { dish: { id: string } }[]
}

/** One serving of the main dish plus one of each side — only home-cooked meals have an estimate. */
export function mealTotals(meal: MealLike, byDish: Map<string, Totals>): { totals: Totals; known: boolean } {
  if (meal.source !== 'home') return { totals: emptyTotals(), known: false }
  const ids = [...(meal.main_dish_id ? [meal.main_dish_id] : []), ...meal.meal_slot_sides.map((s) => s.dish.id)]
  let totals = emptyTotals()
  let found = 0
  for (const id of ids) {
    const t = byDish.get(id)
    if (t) {
      totals = addTotals(totals, t)
      found += 1
    }
  }
  return { totals, known: found > 0 }
}

export type DayTotals = { date: string; totals: Totals; meals: number; unknownMeals: number }

/** What each day's meals add up to for one person: only meals they are marked as eating, and only up to `today`. */
export function dayTotalsFor(
  slots: (MealLike & { date: string; meal_slot_eaters: { profile_id: string }[] })[],
  profileId: string,
  byDish: Map<string, Totals>,
  today: string,
): DayTotals[] {
  const days = new Map<string, DayTotals>()
  for (const s of slots) {
    if (s.date > today || !s.meal_slot_eaters.some((e) => e.profile_id === profileId)) continue
    const day = days.get(s.date) ?? { date: s.date, totals: emptyTotals(), meals: 0, unknownMeals: 0 }
    const m = mealTotals(s, byDish)
    day.meals += 1
    if (m.known) day.totals = addTotals(day.totals, m.totals)
    else day.unknownMeals += 1
    days.set(s.date, day)
  }
  return [...days.values()].sort((a, b) => (a.date < b.date ? -1 : 1))
}

export type PersonForTarget = { birth_year: number | null; sex: 'female' | 'male' | 'other' | null; activity: 'light' | 'moderate' | 'active' | null }

/** The daily target for a person. Missing details are filled in sensibly and reported, so the screen can say what it assumed:
 * no birth year -> adult, no sex (or "other") -> average of the female and male values, no activity -> moderate. */
export function targetFor(person: PersonForTarget, targets: TargetRow[], atYear = new Date().getFullYear()): { target: Totals; assumed: ('age' | 'sex' | 'activity')[] } | null {
  const band = ageBand(person.birth_year, atYear) ?? 'adult'
  const activity = person.activity ?? 'moderate'
  const assumed: ('age' | 'sex' | 'activity')[] = []
  if (person.birth_year === null) assumed.push('age')
  if (person.sex !== 'female' && person.sex !== 'male') assumed.push('sex')
  if (person.activity === null) assumed.push('activity')
  const pick = (sex: 'female' | 'male') => targets.find((t) => t.age_band === band && t.sex === sex && t.activity === activity)
  const f = pick('female')
  const m = pick('male')
  const rows = person.sex === 'female' ? [f] : person.sex === 'male' ? [m] : [f, m]
  if (rows.some((r) => !r)) return null
  const target = emptyTotals()
  for (const k of NUTRIENTS) target[k] = Math.round(rows.reduce((sum, r) => sum + Number(r![k]), 0) / rows.length)
  return { target, assumed }
}

export type Tip = { key: 'proteinLow' | 'sodiumHigh' | 'fibreLow' | 'caloriesHigh' | 'caloriesLow' | 'sugarHigh'; params: Record<string, number> }

export type PeriodSummary = {
  dayCount: number
  average: Totals
  percentOfTarget: Totals
  tips: Tip[]
}

/** Average of the days that have any estimate, against the target, plus a few gentle tips. Never blocks or scolds. */
export function summarisePeriod(days: DayTotals[], target: Totals): PeriodSummary {
  const counted = days.filter((d) => d.meals > d.unknownMeals)
  const n = counted.length
  const sum = counted.reduce((acc, d) => addTotals(acc, d.totals), emptyTotals())
  const average = emptyTotals()
  const pct = emptyTotals()
  for (const k of NUTRIENTS) {
    average[k] = n === 0 ? 0 : Math.round((sum[k] / n) * 10) / 10
    pct[k] = n === 0 ? 0 : percentOf(average[k], target[k])
  }
  const tips: Tip[] = []
  if (n >= 2) {
    const lowProtein = counted.filter((d) => d.totals.protein_g < 0.8 * target.protein_g).length
    if (lowProtein >= 2) tips.push({ key: 'proteinLow', params: { n: lowProtein, days: n } })
    const highSodium = counted.filter((d) => d.totals.sodium_mg > target.sodium_mg).length
    if (highSodium >= 2) tips.push({ key: 'sodiumHigh', params: { n: highSodium, days: n } })
    if (pct.fibre_g < 70) tips.push({ key: 'fibreLow', params: { percent: pct.fibre_g } })
    if (pct.kcal > 120) tips.push({ key: 'caloriesHigh', params: { percent: pct.kcal } })
    else if (pct.kcal < 70) tips.push({ key: 'caloriesLow', params: { percent: pct.kcal } })
    if (pct.sugar_g > 100) tips.push({ key: 'sugarHigh', params: { percent: pct.sugar_g } })
  }
  return { dayCount: n, average, percentOfTarget: pct, tips }
}

export type FamilyNote = { kind: 'good' | 'care' | 'info'; key: 'softChew' | 'spicyKids' | 'friedCare' | 'caffeineKids' | 'sweetInfo' | 'gheeRich'; names: string[] }

/** "For your family": short notes from a dish's tags and the age bands of who lives there. */
export function familyNotes(tags: string[], people: { name: string; band: AgeBand | null }[]): FamilyNote[] {
  const named = (bands: AgeBand[]) => people.filter((p) => p.band && bands.includes(p.band)).map((p) => p.name)
  const notes: FamilyNote[] = []
  const has = (t: string) => tags.includes(t)
  if (has('steamed') && named(['senior', 'child']).length > 0) notes.push({ kind: 'good', key: 'softChew', names: named(['senior', 'child']) })
  if (has('spicy') && named(['child']).length > 0) notes.push({ kind: 'care', key: 'spicyKids', names: named(['child']) })
  if (has('fried') && named(['teen', 'senior']).length > 0) notes.push({ kind: 'care', key: 'friedCare', names: named(['teen', 'senior']) })
  if (has('caffeine') && named(['child', 'teen']).length > 0) notes.push({ kind: 'care', key: 'caffeineKids', names: named(['child', 'teen']) })
  if (has('ghee')) notes.push({ kind: 'info', key: 'gheeRich', names: [] })
  if (has('sweet')) notes.push({ kind: 'info', key: 'sweetInfo', names: [] })
  return notes
}
