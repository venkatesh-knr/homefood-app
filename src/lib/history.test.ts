import { describe, expect, it } from 'vitest'
import { rangeBounds, shiftAnchor, summariseHistory, topEntries } from './history'
import type { AttendanceRow } from './attendance'

describe('rangeBounds', () => {
  it('week runs Monday to Sunday', () => {
    expect(rangeBounds('week', '2026-09-30')).toEqual({ from: '2026-09-28', to: '2026-10-04' }) // Wed
    expect(rangeBounds('week', '2026-10-04')).toEqual({ from: '2026-09-28', to: '2026-10-04' }) // Sun
  })
  it('week runs Sunday to Saturday for homes that start their week on Sunday', () => {
    expect(rangeBounds('week', '2026-09-30', 7)).toEqual({ from: '2026-09-27', to: '2026-10-03' }) // Wed
    expect(rangeBounds('week', '2026-10-04', 7)).toEqual({ from: '2026-10-04', to: '2026-10-10' }) // Sun starts a new week
  })
  it('month covers the whole calendar month, leap years included', () => {
    expect(rangeBounds('month', '2026-09-15')).toEqual({ from: '2026-09-01', to: '2026-09-30' })
    expect(rangeBounds('month', '2028-02-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
  })
  it('year is January to December', () => {
    expect(rangeBounds('year', '2026-09-30')).toEqual({ from: '2026-01-01', to: '2026-12-31' })
  })
})

describe('shiftAnchor', () => {
  it('moves by one week, month or year', () => {
    expect(shiftAnchor('week', '2026-09-30', -1)).toBe('2026-09-23')
    expect(shiftAnchor('month', '2026-01-20', -1)).toBe('2025-12-01')
    expect(shiftAnchor('month', '2026-12-05', 1)).toBe('2027-01-01')
    expect(shiftAnchor('year', '2026-09-30', 1)).toBe('2027-01-01')
  })
})

describe('summariseHistory / topEntries', () => {
  const slots = [
    { source: 'home' as const, main_dish_id: 'dosa', meal_slot_cooks: [{ profile_id: 'amma' }] },
    { source: 'home' as const, main_dish_id: 'dosa', meal_slot_cooks: [{ profile_id: 'amma' }, { profile_id: 'cook' }] },
    { source: 'home' as const, main_dish_id: 'idli', meal_slot_cooks: [] },
    { source: 'dine_out' as const, main_dish_id: null, meal_slot_cooks: [] },
    { source: 'order_in' as const, main_dish_id: 'dosa', meal_slot_cooks: [] },
  ]
  it('counts meals by source, and dishes/cooks only for home meals', () => {
    const s = summariseHistory(slots)
    expect(s.total).toBe(5)
    expect(s.bySource).toEqual({ home: 3, dine_out: 1, order_in: 1 })
    expect(s.dishCounts).toEqual({ dosa: 2, idli: 1 }) // the order-in dosa is not counted as cooked
    expect(s.cookCounts).toEqual({ amma: 2, cook: 1 })
  })
  it('counts home-cooked main dishes by cuisine', () => {
    const s = summariseHistory([
      { source: 'home', main_dish_id: 'dosa', main_dish: { cuisine_id: 'south' }, meal_slot_cooks: [] },
      { source: 'home', main_dish_id: 'idli', main_dish: { cuisine_id: 'south' }, meal_slot_cooks: [] },
      { source: 'home', main_dish_id: 'pizza', main_dish: { cuisine_id: 'european' }, meal_slot_cooks: [] },
      { source: 'order_in', main_dish_id: 'pizza', main_dish: { cuisine_id: 'european' }, meal_slot_cooks: [] },
      { source: 'home', main_dish_id: 'mystery', main_dish: { cuisine_id: null }, meal_slot_cooks: [] },
    ])
    expect(s.cuisineCounts).toEqual({ south: 2, european: 1 })
  })
  it('lists the biggest first and breaks ties by key', () => {
    expect(topEntries({ a: 1, b: 3, c: 3 }, 2)).toEqual([['b', 3], ['c', 3]])
  })
})

describe('summariseHistory with attendance', () => {
  const eaters = [{ profile_id: 'amma' }, { profile_id: 'appa' }]
  const slot = (id: string) => ({ id, source: 'home' as const, main_dish_id: 'dosa', meal_slot_cooks: [], meal_slot_eaters: eaters })
  const row = (slot_id: string, profile_id: string, status: AttendanceRow['status'], portion: AttendanceRow['portion'] = 'normal'): AttendanceRow => ({ slot_id, profile_id, status, portion })

  it('falls back to the plan when nothing was recorded', () => {
    const s = summariseHistory([slot('a'), slot('b')])
    expect(s.eatenMeals).toBe(2)
    expect(s.recordedMeals).toBe(0)
    expect(s.ateCounts).toEqual({ amma: 2, appa: 2 })
  })

  it('leaves out meals a person skipped or ate elsewhere, but counts small and large portions as eaten', () => {
    const s = summariseHistory([slot('a'), slot('b'), slot('c')], [row('a', 'appa', 'skipped'), row('b', 'appa', 'elsewhere'), row('c', 'appa', 'ate', 'large'), row('c', 'amma', 'ate', 'small')])
    expect(s.ateCounts).toEqual({ amma: 3, appa: 1 })
    expect(s.eatenMeals).toBe(3) // Amma still ate every one of them
    expect(s.recordedMeals).toBe(3)
  })

  it('does not count a meal nobody ate', () => {
    const s = summariseHistory([slot('a'), slot('b')], [row('a', 'amma', 'skipped'), row('a', 'appa', 'elsewhere')])
    expect(s.eatenMeals).toBe(1)
    expect(s.ateCounts).toEqual({ amma: 1, appa: 1 })
  })

  it('counts a meal with nobody listed as eaten, since nothing says it was missed', () => {
    expect(summariseHistory([{ id: 'x', source: 'dine_out', main_dish_id: null, meal_slot_cooks: [], meal_slot_eaters: [] }]).eatenMeals).toBe(1)
  })
})
