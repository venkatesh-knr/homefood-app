// Pure helpers for the History screen: which dates a week/month/year covers, and the simple counts shown above the list.
// Framework-free so it's unit-tested without a database (same pattern as lib/planner.ts).

import { addDays, toISODate, weekStartOf, type MealSource } from './planner'
import { attendanceFor, attendanceMap, portionFactor, type AttendanceRow } from './attendance'

export type HistoryRangeKind = 'week' | 'month' | 'year'

function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

/** First and last ISO date of the week (starting Monday, or Sunday when `weekStartsOn` is 7), month or year containing `anchor`. */
export function rangeBounds(kind: HistoryRangeKind, anchor: string, weekStartsOn: number = 1): { from: string; to: string } {
  const a = parse(anchor)
  if (kind === 'week') {
    const from = toISODate(weekStartOf(a, weekStartsOn))
    return { from, to: addDays(from, 6) }
  }
  if (kind === 'month') {
    return { from: toISODate(new Date(a.getFullYear(), a.getMonth(), 1)), to: toISODate(new Date(a.getFullYear(), a.getMonth() + 1, 0)) }
  }
  return { from: `${a.getFullYear()}-01-01`, to: `${a.getFullYear()}-12-31` }
}

/** Move the anchor one week / month / year earlier (-1) or later (+1). */
export function shiftAnchor(kind: HistoryRangeKind, anchor: string, direction: -1 | 1): string {
  const a = parse(anchor)
  if (kind === 'week') return addDays(anchor, 7 * direction)
  if (kind === 'month') return toISODate(new Date(a.getFullYear(), a.getMonth() + direction, 1))
  return toISODate(new Date(a.getFullYear() + direction, 0, 1))
}

type HistorySlot = {
  id?: string
  source: MealSource
  main_dish_id: string | null
  /** Only the cuisine is needed (for the "by cuisine" counts). */
  main_dish?: { cuisine_id: string | null } | null
  meal_slot_cooks: { profile_id: string }[]
  meal_slot_eaters?: { profile_id: string }[]
}

export type HistorySummary = {
  total: number
  bySource: Record<MealSource, number>
  /** Home-cooked main dishes, by dish id. */
  dishCounts: Record<string, number>
  /** Home-cooked main dishes, by cuisine id. */
  cuisineCounts: Record<string, number>
  /** Meals each profile cooked, by profile id. */
  cookCounts: Record<string, number>
  /** Meals each profile ate, by profile id: planned and marked as eating, minus the ones they skipped or ate elsewhere. */
  ateCounts: Record<string, number>
  /** Planned meals somebody ate. A meal counts as eaten unless everyone marked as eating it skipped it or ate elsewhere. */
  eatenMeals: number
  /** Meals with at least one attendance row recorded; the rest are counted as eaten as planned. */
  recordedMeals: number
}

/** Counts for the History screen. `attendance` is what people recorded ("skipped", "ate elsewhere", small / large portion); a meal with
 * nothing recorded counts as eaten by everyone marked as eating it, so the numbers fall back to the plan. */
export function summariseHistory(slots: HistorySlot[], attendance: AttendanceRow[] = []): HistorySummary {
  const summary: HistorySummary = {
    total: slots.length,
    bySource: { home: 0, dine_out: 0, order_in: 0 },
    dishCounts: {},
    cuisineCounts: {},
    cookCounts: {},
    ateCounts: {},
    eatenMeals: 0,
    recordedMeals: 0,
  }
  const rows = attendanceMap(attendance)
  const recorded = new Set(attendance.map((r) => r.slot_id))
  for (const s of slots) {
    summary.bySource[s.source] += 1
    if (s.source === 'home' && s.main_dish_id) {
      summary.dishCounts[s.main_dish_id] = (summary.dishCounts[s.main_dish_id] ?? 0) + 1
      const cuisine = s.main_dish?.cuisine_id
      if (cuisine) summary.cuisineCounts[cuisine] = (summary.cuisineCounts[cuisine] ?? 0) + 1
    }
    for (const c of s.meal_slot_cooks) summary.cookCounts[c.profile_id] = (summary.cookCounts[c.profile_id] ?? 0) + 1

    const eaters = s.meal_slot_eaters ?? []
    let somebodyAte = eaters.length === 0 // nobody listed: nothing says the meal was missed
    for (const e of eaters) {
      if (portionFactor(s.id ? attendanceFor(rows, s.id, e.profile_id) : undefined) > 0) {
        summary.ateCounts[e.profile_id] = (summary.ateCounts[e.profile_id] ?? 0) + 1
        somebodyAte = true
      }
    }
    if (somebodyAte) summary.eatenMeals += 1
    if (s.id && recorded.has(s.id)) summary.recordedMeals += 1
  }
  return summary
}

/** Biggest counts first; ties broken by key so the order is stable between renders. */
export function topEntries(counts: Record<string, number>, limit: number): [string, number][] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}
