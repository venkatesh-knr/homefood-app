import { describe, expect, it } from 'vitest'
import {
  activeMealTypes,
  addDays,
  dayOfMonth,
  greetingPeriod,
  mealAllergyConflicts,
  nextMealType,
  toISODate,
  turnCoversDate,
  weekDates,
  weekStartOf,
  weekdayLetter,
  type PlannerTurn,
} from './planner'

describe('weekStartOf', () => {
  it('finds the Monday on or before the given date', () => {
    expect(toISODate(weekStartOf(new Date(2026, 8, 30)))).toBe('2026-09-28') // Wed -> Mon
    expect(toISODate(weekStartOf(new Date(2026, 8, 28)))).toBe('2026-09-28') // Mon -> itself
    expect(toISODate(weekStartOf(new Date(2026, 9, 4)))).toBe('2026-09-28') // Sun -> previous Mon
  })
})

describe('addDays / weekDates', () => {
  it('adds days across a month boundary', () => {
    expect(addDays('2026-09-28', 3)).toBe('2026-10-01')
  })
  it('lists all 7 days Monday to Sunday', () => {
    expect(weekDates('2026-09-28')).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ])
  })
})

describe('activeMealTypes', () => {
  it('drops snacks when the household has them off', () => {
    expect(activeMealTypes(true)).toEqual(['breakfast', 'lunch', 'snacks', 'dinner'])
    expect(activeMealTypes(false)).toEqual(['breakfast', 'lunch', 'dinner'])
  })
})

describe('weekdayLetter / dayOfMonth', () => {
  it('reads the right weekday letter and day number', () => {
    expect(weekdayLetter('2026-09-30')).toBe('W') // Wednesday
    expect(dayOfMonth('2026-09-30')).toBe(30)
  })
})

describe('turnCoversDate', () => {
  const base: PlannerTurn = {
    id: '1',
    household_id: 'h',
    profile_id: 'p',
    scope: 'week',
    start_date: '2026-09-28',
    end_date: '2026-10-04',
    status: 'approved',
    requested_by: null,
    created_at: '',
  }
  it('is true inside the range when approved', () => {
    expect(turnCoversDate(base, '2026-09-30')).toBe(true)
  })
  it('is false outside the range or when not approved', () => {
    expect(turnCoversDate(base, '2026-10-05')).toBe(false)
    expect(turnCoversDate({ ...base, status: 'requested' }, '2026-09-30')).toBe(false)
  })
})

describe('nextMealType', () => {
  const ALL: ReturnType<typeof activeMealTypes> = ['breakfast', 'lunch', 'snacks', 'dinner']
  it('picks the current time band when it is active', () => {
    expect(nextMealType(new Date(2026, 8, 30, 9), ALL)).toBe('breakfast')
    expect(nextMealType(new Date(2026, 8, 30, 12), ALL)).toBe('lunch')
    expect(nextMealType(new Date(2026, 8, 30, 16), ALL)).toBe('snacks')
    expect(nextMealType(new Date(2026, 8, 30, 20), ALL)).toBe('dinner')
  })
  it('skips ahead to the next active meal when the current band is off (e.g. no snacks)', () => {
    const noSnacks = activeMealTypes(false)
    expect(nextMealType(new Date(2026, 8, 30, 16), noSnacks)).toBe('dinner')
  })
  it('falls back to the last active meal once the day is over', () => {
    expect(nextMealType(new Date(2026, 8, 30, 22), ['breakfast', 'lunch'])).toBe('lunch')
  })
})

describe('greetingPeriod', () => {
  it('bands the hour into morning/afternoon/evening', () => {
    expect(greetingPeriod(new Date(2026, 8, 30, 7))).toBe('morning')
    expect(greetingPeriod(new Date(2026, 8, 30, 14))).toBe('afternoon')
    expect(greetingPeriod(new Date(2026, 8, 30, 20))).toBe('evening')
  })
})

describe('mealAllergyConflicts', () => {
  it('finds who is affected and by which allergens', () => {
    const result = mealAllergyConflicts(
      ['soy', 'wheat'],
      [
        { name: 'Paati', allergens: ['soy'] },
        { name: 'Kavi', allergens: ['milk'] },
      ],
    )
    expect(result.names).toEqual(['Paati'])
    expect(result.allergens).toEqual(['soy'])
  })
  it('is empty when nobody eating has a matching allergy', () => {
    expect(mealAllergyConflicts(['soy'], [{ name: 'Kavi', allergens: ['milk'] }])).toEqual({ allergens: [], names: [] })
  })
})
