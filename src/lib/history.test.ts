import { describe, expect, it } from 'vitest'
import { rangeBounds, shiftAnchor, summariseHistory, topEntries } from './history'

describe('rangeBounds', () => {
  it('week runs Monday to Sunday', () => {
    expect(rangeBounds('week', '2026-09-30')).toEqual({ from: '2026-09-28', to: '2026-10-04' }) // Wed
    expect(rangeBounds('week', '2026-10-04')).toEqual({ from: '2026-09-28', to: '2026-10-04' }) // Sun
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
  it('lists the biggest first and breaks ties by key', () => {
    expect(topEntries({ a: 1, b: 3, c: 3 }, 2)).toEqual([['b', 3], ['c', 3]])
  })
})
