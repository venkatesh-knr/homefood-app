import { describe, expect, it } from 'vitest'
import { cookAgainDays, defaultCookAgainMeal, isFreeSlot } from './cookAgain'
import type { SlotWithDetails } from './plannerQueries'
import type { MealType } from './planner'

function slot(date: string, meal: MealType, over: Partial<SlotWithDetails> = {}): SlotWithDetails {
  return {
    id: `${date}-${meal}`, week_plan_id: 'p', household_id: 'h', date, meal, source: 'home', place_name: null, main_dish_id: 'd', note: null, status: 'proposed',
    kept_despite_disagree: false, updated_at: '', main_dish: null, meal_slot_sides: [], meal_slot_cooks: [], meal_slot_eaters: [], ...over,
  }
}

describe('isFreeSlot', () => {
  it('is free when there is no slot, or an empty one', () => {
    expect(isFreeSlot(undefined)).toBe(true)
    expect(isFreeSlot(slot('2026-10-12', 'dinner', { main_dish_id: null }))).toBe(true)
    expect(isFreeSlot(slot('2026-10-12', 'dinner'))).toBe(false)
    expect(isFreeSlot(slot('2026-10-12', 'dinner', { main_dish_id: null, source: 'dine_out', place_name: 'Udupi' }))).toBe(false)
  })
})

describe('cookAgainDays', () => {
  const slots = [slot('2026-10-12', 'dinner'), slot('2026-10-13', 'lunch'), slot('2026-10-14', 'dinner', { main_dish_id: null })]
  const all = (date: string) => Boolean(date)

  it('lists the next 14 days from today, only looking at the chosen meal', () => {
    const days = cookAgainDays(slots, { today: '2026-10-12', meal: 'dinner', canPlan: all })
    expect(days).toHaveLength(14)
    expect(days[0]!.date).toBe('2026-10-12')
    expect(days[13]!.date).toBe('2026-10-25')
    expect(days.map((d) => d.state).slice(0, 4)).toEqual(['planned', 'free', 'free', 'free']) // lunch on the 13th does not count for dinner
  })

  it('lets the Planner put the dish in free slots and never touches a planned one', () => {
    const days = cookAgainDays(slots, { today: '2026-10-12', meal: 'dinner', canPlan: all })
    expect(days[0]!.action).toBe('none') // planned: left alone
    expect(days[1]!.action).toBe('plan')
    expect(days[2]!.action).toBe('plan') // the empty slot on the 14th
  })

  it('lets everyone else suggest it for planned meals, and nothing for free ones', () => {
    const days = cookAgainDays(slots, { today: '2026-10-12', meal: 'dinner', canPlan: () => false })
    expect(days[0]!.action).toBe('suggest')
    expect(days[1]!.action).toBe('none')
  })

  it('follows a Planner turn that covers only some days', () => {
    const days = cookAgainDays(slots, { today: '2026-10-12', meal: 'dinner', canPlan: (d) => d >= '2026-10-13' && d <= '2026-10-15' })
    expect(days.slice(0, 5).map((d) => d.action)).toEqual(['suggest', 'plan', 'plan', 'plan', 'none'])
  })
})

describe('defaultCookAgainMeal', () => {
  it('starts on the dish\'s own meal, among the meals the home plans', () => {
    expect(defaultCookAgainMeal(['snacks', 'dinner'], ['breakfast', 'lunch', 'dinner'])).toBe('dinner')
    expect(defaultCookAgainMeal(['breakfast'], ['breakfast', 'lunch'])).toBe('breakfast')
    expect(defaultCookAgainMeal([], ['lunch', 'dinner'])).toBe('lunch')
  })
})
