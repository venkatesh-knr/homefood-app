// Fasting days: how a person fasts, on which weekdays and dates, and what that means for one meal. The app never suggests fasting; it only
// follows what each person chose. Pure logic, no network.

export type FastMode = 'skip_meals' | 'fasting_foods' | 'fruits_milk' | 'one_meal'
export const FAST_MODES: FastMode[] = ['skip_meals', 'fasting_foods', 'fruits_milk', 'one_meal']
export type FastMeal = 'breakfast' | 'lunch' | 'snacks' | 'dinner'
export const FAST_MEALS: FastMeal[] = ['breakfast', 'lunch', 'snacks', 'dinner']

export type FastingRule = {
  profile_id: string
  mode: FastMode
  skip_meals: FastMeal[]
  one_meal: FastMeal | null
  /** 1 = Monday ... 7 = Sunday. */
  weekdays: number[]
  dates: string[]
}

/** What a day's fasting means for one meal: it goes on as usual, the person skips it (left out of it), or eats fasting foods only. */
export type MealEffect = 'normal' | 'skip' | 'foods'

/** ISO weekday (1 = Monday ... 7 = Sunday) of a YYYY-MM-DD date. */
export function isoWeekday(date: string): number {
  const d = new Date(`${date}T00:00:00`).getDay()
  return d === 0 ? 7 : d
}

export function isFastingDay(rule: Pick<FastingRule, 'weekdays' | 'dates'>, date: string): boolean {
  return rule.dates.includes(date) || rule.weekdays.includes(isoWeekday(date))
}

export function effectOn(rule: FastingRule, date: string, meal: string): MealEffect {
  if (!isFastingDay(rule, date)) return 'normal'
  switch (rule.mode) {
    case 'skip_meals':
      return (rule.skip_meals as string[]).includes(meal) ? 'skip' : 'normal'
    case 'fruits_milk':
      return 'skip'
    case 'one_meal':
      return meal === rule.one_meal ? 'normal' : 'skip'
    case 'fasting_foods':
      return 'foods'
  }
}

/** Who skips a meal (left out of it) and who eats fasting foods only, from everyone's rules. */
export type SlotFasting = { skip: string[]; foods: string[] }
export function slotFasting(rules: FastingRule[], date: string, meal: string): SlotFasting {
  const skip: string[] = []
  const foods: string[] = []
  for (const r of rules) {
    const e = effectOn(r, date, meal)
    if (e === 'skip') skip.push(r.profile_id)
    else if (e === 'foods') foods.push(r.profile_id)
  }
  return { skip, foods }
}

/** True when the person fasts at all that day (any meal affected): nutrition marks the day instead of calling it low. */
export function fastsOn(rule: FastingRule, date: string): boolean {
  return FAST_MEALS.some((m) => effectOn(rule, date, m) !== 'normal')
}

export const EMPTY_RULE = (profile_id: string): FastingRule => ({ profile_id, mode: 'skip_meals', skip_meals: ['dinner'], one_meal: 'lunch', weekdays: [], dates: [] })

/** A rule worth saving: a way to fast, and at least one weekday or date. Skipping meals needs at least one meal. */
export function isUsable(rule: FastingRule): boolean {
  if (rule.weekdays.length === 0 && rule.dates.length === 0) return false
  if (rule.mode === 'skip_meals' && rule.skip_meals.length === 0) return false
  if (rule.mode === 'one_meal' && !rule.one_meal) return false
  return true
}

/** Dates that are today or later, oldest first, no repeats (past dates have nothing left to do). */
export function upcomingDates(dates: string[], today: string): string[] {
  return [...new Set(dates)].filter((d) => d >= today).sort()
}
