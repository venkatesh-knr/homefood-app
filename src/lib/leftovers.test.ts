import { describe, expect, it } from 'vitest'
import { activeLeftovers, leftoverName, leftoverPromptDue, leftoversForDate, mealsForLeftover, lastDayFor, lastDayWhen, type Leftover } from './leftovers'

function lo(over: Partial<Leftover> & { id: string }): Leftover {
  return {
    household_id: 'h', dish_id: 'd', from_slot_id: null, amount: 'some', kept_in: 'fridge', cooked_on: '2026-10-24', use_by: '2026-10-25', status: 'active',
    used_slot_id: null, created_by: null, created_at: '2026-10-24T10:00:00Z', dish: { id: 'd', name: 'Sambar', dish_names: [{ language: 'ta', name: 'சாம்பார்' }, { language: 'en', name: 'Sambar' }] }, ...over,
  }
}

describe('use-by', () => {
  it('fridge is good until the next day, kept out until the same day', () => {
    expect(lastDayFor('2026-10-24', 'fridge')).toBe('2026-10-25')
    expect(lastDayFor('2026-10-24', 'out')).toBe('2026-10-24')
    expect(lastDayFor('2026-10-31', 'fridge')).toBe('2026-11-01')
  })
  it('says today, tomorrow or a date', () => {
    expect(lastDayWhen('2026-10-24', '2026-10-24')).toBe('today')
    expect(lastDayWhen('2026-10-25', '2026-10-24')).toBe('tomorrow')
    expect(lastDayWhen('2026-10-27', '2026-10-24')).toBe('date')
  })
})

describe('the list of leftovers', () => {
  const list = [
    lo({ id: 'a', use_by: '2026-10-25', created_at: '2026-10-24T09:00:00Z' }),
    lo({ id: 'b', use_by: '2026-10-24' }),
    lo({ id: 'c', status: 'used' }),
    lo({ id: 'd', status: 'gone' }),
    lo({ id: 'e', use_by: '2026-10-23' }),
  ]
  it('shows active ones still good today, soonest use-by first; the rest drop off quietly', () => {
    expect(activeLeftovers(list, '2026-10-24').map((l) => l.id)).toEqual(['b', 'a'])
  })
  it('on a later day only what is still good then', () => {
    expect(activeLeftovers(list, '2026-10-25').map((l) => l.id)).toEqual(['a'])
    expect(activeLeftovers(list, '2026-10-26')).toEqual([])
  })
  it('offers a meal the leftovers that are good on its day', () => {
    expect(leftoversForDate(list, '2026-10-25').map((l) => l.id)).toEqual(['a'])
  })
  it('names the dish in the screen language', () => {
    expect(leftoverName(list[0]!.dish, 'ta')).toBe('சாம்பார்')
    expect(leftoverName(list[0]!.dish, 'en')).toBe('Sambar')
    expect(leftoverName(null, 'en')).toBe('')
  })
})

describe('when the question is asked', () => {
  const slot = (meal: string, date = '2026-10-24', source = 'home', main: unknown = {}) => ({ date, meal, source, main_dish: main })
  it('after the usual time of a home meal that has a main dish', () => {
    expect(leftoverPromptDue(slot('lunch'), { date: '2026-10-24', hour: 12 })).toBe(false)
    expect(leftoverPromptDue(slot('lunch'), { date: '2026-10-24', hour: 13 })).toBe(true)
    expect(leftoverPromptDue(slot('dinner'), { date: '2026-10-24', hour: 19 })).toBe(false)
    expect(leftoverPromptDue(slot('dinner'), { date: '2026-10-24', hour: 21 })).toBe(true)
  })
  it('for earlier days always, for later days never', () => {
    expect(leftoverPromptDue(slot('dinner', '2026-10-23'), { date: '2026-10-24', hour: 6 })).toBe(true)
    expect(leftoverPromptDue(slot('breakfast', '2026-10-25'), { date: '2026-10-24', hour: 23 })).toBe(false)
  })
  it('never for a meal out, an order in, or a meal with no dish', () => {
    expect(leftoverPromptDue(slot('lunch', '2026-10-24', 'dine_out'), { date: '2026-10-24', hour: 15 })).toBe(false)
    expect(leftoverPromptDue(slot('lunch', '2026-10-24', 'home', null), { date: '2026-10-24', hour: 15 })).toBe(false)
  })
})

describe('meals a leftover can go into', () => {
  const side = (n: number, leftover_id: string | null = null) => ({ position: n, leftover_id })
  const slots = [
    { id: 's1', date: '2026-10-24', meal: 'dinner', source: 'home', main_dish: { id: 'm' }, meal_slot_sides: [side(1)] },
    { id: 's2', date: '2026-10-25', meal: 'lunch', source: 'home', main_dish: { id: 'm' }, meal_slot_sides: [side(1), side(2), side(3)] },
    { id: 's3', date: '2026-10-25', meal: 'breakfast', source: 'home', main_dish: { id: 'm' }, meal_slot_sides: [] },
    { id: 's4', date: '2026-10-25', meal: 'dinner', source: 'dine_out', main_dish: null, meal_slot_sides: [] },
    { id: 's5', date: '2026-10-26', meal: 'lunch', source: 'home', main_dish: { id: 'm' }, meal_slot_sides: [] },
    { id: 's6', date: '2026-10-23', meal: 'dinner', source: 'home', main_dish: { id: 'm' }, meal_slot_sides: [] },
    { id: 's7', date: '2026-10-25', meal: 'snacks', source: 'home', main_dish: { id: 'm' }, meal_slot_sides: [side(1, 'x')] },
  ]
  it('lists home meals with a main dish and a free side spot, from now to the use-by day, soonest first', () => {
    expect(mealsForLeftover({ id: 'x', use_by: '2026-10-25' }, slots, { date: '2026-10-24', hour: 9 }).map((s) => s.id)).toEqual(['s1', 's3'])
  })
  it('leaves out a meal of today whose usual time has passed', () => {
    expect(mealsForLeftover({ id: 'x', use_by: '2026-10-25' }, slots, { date: '2026-10-24', hour: 21 }).map((s) => s.id)).toEqual(['s3'])
  })
  it('offers nothing when no meal fits', () => {
    expect(mealsForLeftover({ id: 'x', use_by: '2026-10-24' }, slots.slice(1), { date: '2026-10-24', hour: 9 })).toEqual([])
  })
})
