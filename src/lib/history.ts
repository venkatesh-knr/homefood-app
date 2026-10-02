// Pure helpers for the History screen: which dates a week/month/year covers, and the simple counts shown above the list.
// Framework-free so it's unit-tested without a database (same pattern as lib/planner.ts).

import { addDays, toISODate, weekStartOf, type MealSource } from './planner'

export type HistoryRangeKind = 'week' | 'month' | 'year'

function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

/** First and last ISO date of the week (Mon–Sun), month or year containing `anchor`. */
export function rangeBounds(kind: HistoryRangeKind, anchor: string): { from: string; to: string } {
  const a = parse(anchor)
  if (kind === 'week') {
    const from = toISODate(weekStartOf(a))
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
  source: MealSource
  main_dish_id: string | null
  meal_slot_cooks: { profile_id: string }[]
}

export type HistorySummary = {
  total: number
  bySource: Record<MealSource, number>
  /** Home-cooked main dishes, by dish id. */
  dishCounts: Record<string, number>
  /** Meals each profile cooked, by profile id. */
  cookCounts: Record<string, number>
}

export function summariseHistory(slots: HistorySlot[]): HistorySummary {
  const summary: HistorySummary = { total: slots.length, bySource: { home: 0, dine_out: 0, order_in: 0 }, dishCounts: {}, cookCounts: {} }
  for (const s of slots) {
    summary.bySource[s.source] += 1
    if (s.source === 'home' && s.main_dish_id) summary.dishCounts[s.main_dish_id] = (summary.dishCounts[s.main_dish_id] ?? 0) + 1
    for (const c of s.meal_slot_cooks) summary.cookCounts[c.profile_id] = (summary.cookCounts[c.profile_id] ?? 0) + 1
  }
  return summary
}

/** Biggest counts first; ties broken by key so the order is stable between renders. */
export function topEntries(counts: Record<string, number>, limit: number): [string, number][] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}
