// Prep reminders: the tasks to do AHEAD of cooking (grind the batter, soak the chickpeas, set the curd, thaw the chicken, marinate the meat).
// Pure logic: which tasks show on Today and when. No network here.
//   * Tonight · for tomorrow: from 4 pm (the home's own clock), the "night before" tasks of tomorrow's planned HOME meals.
//   * Today: the "hours before" tasks of today's home meals, until that meal's time.
import { addDays } from './planner'

export type PrepKind = 'soak' | 'batter_ferment' | 'set_curd' | 'thaw' | 'marinate' | 'sprout' | 'other'
export type PrepLead = 'night_before' | 'hours_before'

/** One prep tag of a recipe. `household_id` is null for a standard recipe's tag. */
export type PrepRow = { id: string; recipe_id: string; dish_id: string; household_id: string | null; kind: PrepKind; lead: PrepLead; hours: number | null; text_en: string; text_ta: string | null }

/** From this hour the evening card shows tomorrow's night-before tasks. */
export const EVENING_FROM = 16
/** About when each meal is eaten: a same-day task stops showing once its meal time has passed. */
export const MEAL_HOUR: Record<string, number> = { breakfast: 8, lunch: 13, snacks: 17, dinner: 20 }
const MEAL_ORDER = ['breakfast', 'lunch', 'snacks', 'dinner']

/** The date (YYYY-MM-DD) and hour (0-23) on a clock in the given time zone, e.g. the home's Asia/Kolkata. */
export function zonedParts(now: Date, timeZone: string): { date: string; hour: number } {
  let parts: Record<string, string> = {}
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((p) => [p.type, p.value]))
  } catch {
    parts = {}
  }
  if (!parts.year) {
    const p = (n: number) => String(n).padStart(2, '0')
    return { date: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`, hour: now.getHours() }
  }
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) % 24 }
}

/** The tags that apply to each dish for a home: its own recipe's tags if that recipe has any, else the standard recipe's. */
export function prepByDish(rows: PrepRow[], householdId: string): Map<string, PrepRow[]> {
  const own = new Map<string, PrepRow[]>()
  const standard = new Map<string, PrepRow[]>()
  for (const r of rows) {
    if (r.household_id === householdId) own.set(r.dish_id, [...(own.get(r.dish_id) ?? []), r])
    else if (r.household_id === null) standard.set(r.dish_id, [...(standard.get(r.dish_id) ?? []), r])
  }
  const out = new Map(standard)
  for (const [dish, list] of own) out.set(dish, list)
  return out
}

type DishLike = { id: string; name: string; dish_names: { language: string; name: string }[] }
export type PrepSlot = { id: string; date: string; meal: string; source: string; main_dish: DishLike | null; meal_slot_sides: { position: number; dish: DishLike }[] }

export type PrepTask = {
  key: string
  slotId: string
  prepId: string
  date: string
  meal: string
  dishId: string
  dish: { en: string; ta: string | null }
  kind: PrepKind
  lead: PrepLead
  hours: number | null
  text: { en: string; ta: string | null }
}

export const taskKey = (slotId: string, prepId: string) => `${slotId}:${prepId}`

function tasksOf(slot: PrepSlot, prep: Map<string, PrepRow[]>, lead: PrepLead): PrepTask[] {
  if (slot.source !== 'home') return []
  const dishes = [slot.main_dish, ...[...slot.meal_slot_sides].sort((a, b) => a.position - b.position).map((s) => s.dish)].filter((d): d is DishLike => d !== null)
  const seen = new Set<string>()
  const out: PrepTask[] = []
  for (const d of dishes) {
    for (const p of prep.get(d.id) ?? []) {
      const key = taskKey(slot.id, p.id)
      if (p.lead !== lead || seen.has(key)) continue
      seen.add(key)
      out.push({
        key, slotId: slot.id, prepId: p.id, date: slot.date, meal: slot.meal, dishId: d.id,
        dish: { en: d.dish_names.find((n) => n.language === 'en')?.name ?? d.name, ta: d.dish_names.find((n) => n.language === 'ta')?.name ?? null },
        kind: p.kind, lead: p.lead, hours: p.hours, text: { en: p.text_en, ta: p.text_ta },
      })
    }
  }
  return out
}

const byMeal = (a: PrepTask, b: PrepTask) => a.date.localeCompare(b.date) || MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal)

/** What to show on Today right now: the evening card's tasks (tomorrow's night-before prep, from 4 pm) and today's same-day prep (until each meal's time). */
export function prepTasks(opts: { now: Date; timeZone: string; slots: PrepSlot[]; prep: Map<string, PrepRow[]>; minHour?: number }): { tonight: PrepTask[]; today: PrepTask[]; todayDate: string; tomorrowDate: string } {
  const { date, hour: realHour } = zonedParts(opts.now, opts.timeZone)
  const hour = Math.max(realHour, opts.minHour ?? 0)
  const tomorrow = addDays(date, 1)
  const tonight = hour >= EVENING_FROM ? opts.slots.filter((s) => s.date === tomorrow).flatMap((s) => tasksOf(s, opts.prep, 'night_before')).sort(byMeal) : []
  const today = opts.slots
    .filter((s) => s.date === date && hour < (MEAL_HOUR[s.meal] ?? 24))
    .flatMap((s) => tasksOf(s, opts.prep, 'hours_before'))
    .sort(byMeal)
  return { tonight, today, todayDate: date, tomorrowDate: tomorrow }
}

/** How long a task needs, for the line under it: "needs about 8 hours", "overnight" (a soak with no hours), "3 hours before", or nothing. */
export function leadNote(task: Pick<PrepTask, 'kind' | 'lead' | 'hours'>): { key: 'needs' | 'overnight' | 'hoursBefore'; hours: number } | null {
  if (task.lead === 'hours_before') return task.hours ? { key: 'hoursBefore', hours: task.hours } : null
  if (task.hours) return { key: 'needs', hours: task.hours }
  return task.kind === 'soak' ? { key: 'overnight', hours: 0 } : null
}

export const taskText = (task: Pick<PrepTask, 'text'>, lang: 'en' | 'ta') => (lang === 'ta' && task.text.ta ? task.text.ta : task.text.en)
export const taskDish = (task: Pick<PrepTask, 'dish'>, lang: 'en' | 'ta') => (lang === 'ta' && task.dish.ta ? task.dish.ta : task.dish.en)
