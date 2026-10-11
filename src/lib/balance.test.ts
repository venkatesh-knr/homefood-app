import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE, limitsOf, notesSignature, weekBalance } from './balance'
import type { SlotDish, SlotWithDetails } from './plannerQueries'
import type { MealType } from './planner'

const dish = (id: string, tags: string[] = []): SlotDish => ({ id, name: id, diet: 'veg', allergens: [], photo_path: null, cuisine_id: null, dish_names: [], tags })
let n = 0
function slot(date: string, meal: MealType, main: SlotDish | null, sides: SlotDish[] = [], source: SlotWithDetails['source'] = 'home'): SlotWithDetails {
  return {
    id: `s${n++}`, week_plan_id: 'p', household_id: 'h', date, meal, source, place_name: null, main_dish_id: main?.id ?? null, note: null, status: 'proposed',
    kept_despite_disagree: false, updated_at: '', main_dish: main, meal_slot_sides: sides.map((d, i) => ({ position: i + 1, dish: d })), meal_slot_cooks: [], meal_slot_eaters: [],
  }
}
const WEEK = '2026-10-05' // a Monday
const meals: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']
const opts = { weekStart: WEEK, today: '2026-10-05', meals }
const veg = dish('poriyal', ['vegetable'])

describe('limitsOf', () => {
  it("uses the home's numbers, or the defaults before the migration has run", () => {
    expect(limitsOf({})).toEqual(DEFAULT_BALANCE)
    expect(limitsOf({ balance_same_main: 4, balance_fried: 6, balance_out_run: 2 })).toEqual({ sameMain: 4, fried: 6, outRun: 2 })
  })
})

describe('weekBalance', () => {
  it('says nothing about a balanced week', () => {
    const slots = [slot('2026-10-05', 'lunch', dish('rice'), [veg]), slot('2026-10-05', 'dinner', dish('chapati'), [veg]), slot('2026-10-06', 'lunch', dish('curd rice'), [veg])]
    expect(weekBalance(slots, DEFAULT_BALANCE, opts)).toEqual([])
  })

  it('notices the same main dish 3 or more times', () => {
    const idli = dish('idli')
    const slots = ['2026-10-05', '2026-10-07', '2026-10-09'].map((d) => slot(d, 'breakfast', idli))
    expect(weekBalance(slots, DEFAULT_BALANCE, opts)).toEqual([{ kind: 'sameMain', dish: idli, count: 3 }])
    expect(weekBalance(slots.slice(0, 2), DEFAULT_BALANCE, opts)).toEqual([])
    expect(weekBalance(slots, { ...DEFAULT_BALANCE, sameMain: 4 }, opts)).toEqual([])
  })

  it('counts meals with a fried dish, main or side, and only flags more than the limit', () => {
    const fry = dish('bajji', ['fried'])
    const five = ['05', '06', '07', '08', '09'].map((d, i) => (i % 2 ? slot(`2026-10-${d}`, 'snacks', dish(`m${i}`), [fry]) : slot(`2026-10-${d}`, 'snacks', dish(`f${i}`, ['fried']))))
    expect(weekBalance(five.slice(0, 4), DEFAULT_BALANCE, opts)).toEqual([])
    expect(weekBalance(five, DEFAULT_BALANCE, opts)).toEqual([{ kind: 'fried', count: 5 }])
  })

  it('names the days still to come that have a lunch or dinner but no vegetable dish', () => {
    const slots = [
      slot('2026-10-04', 'dinner', dish('past')), // before today: ignored
      slot('2026-10-06', 'lunch', dish('rice'), [dish('appalam')]),
      slot('2026-10-07', 'lunch', dish('rice'), [veg]),
      slot('2026-10-08', 'breakfast', dish('idli')), // only breakfast planned: not a missing-vegetables day
      slot('2026-10-09', 'dinner', null, [], 'order_in'), // eating out: nothing to judge
    ]
    expect(weekBalance(slots, DEFAULT_BALANCE, opts)).toEqual([{ kind: 'noVegetable', dates: ['2026-10-06'] }])
  })

  it('does not judge vegetables before the dishes carry the tag', () => {
    const slots = [slot('2026-10-06', 'lunch', dish('rice'), [dish('appalam')])]
    expect(weekBalance(slots, DEFAULT_BALANCE, { ...opts, checkVegetables: false })).toEqual([])
  })

  it('counts a vegetable main dish too', () => {
    expect(weekBalance([slot('2026-10-06', 'dinner', dish('aloo gobi', ['vegetable']))], DEFAULT_BALANCE, opts)).toEqual([])
  })

  it('finds 3 or more meals out or ordered in, one after another, across days', () => {
    const out = [slot('2026-10-10', 'lunch', null, [], 'dine_out'), slot('2026-10-10', 'snacks', null, [], 'order_in'), slot('2026-10-10', 'dinner', null, [], 'dine_out')]
    expect(weekBalance(out, DEFAULT_BALANCE, opts)).toEqual([{ kind: 'eatingOut', count: 3 }])
    expect(weekBalance(out.slice(0, 2), DEFAULT_BALANCE, opts)).toEqual([])
    // a meal at home in the middle breaks the run
    const broken = [out[0]!, slot('2026-10-10', 'snacks', dish('s')), out[2]!]
    expect(weekBalance(broken, DEFAULT_BALANCE, opts).some((x) => x.kind === 'eatingOut')).toBe(false)
    // so does a meal that is not planned yet
    expect(weekBalance([out[0]!, out[2]!], DEFAULT_BALANCE, opts).some((x) => x.kind === 'eatingOut')).toBe(false)
    // snacks off: dinner is followed straight by the next breakfast
    const noSnacks = [slot('2026-10-10', 'lunch', null, [], 'dine_out'), slot('2026-10-10', 'dinner', null, [], 'order_in'), slot('2026-10-11', 'breakfast', null, [], 'order_in')]
    expect(weekBalance(noSnacks, DEFAULT_BALANCE, { ...opts, meals: ['breakfast', 'lunch', 'dinner'] })).toEqual([{ kind: 'eatingOut', count: 3 }])
  })

  it('has a signature that changes when the notes do', () => {
    const a = notesSignature([{ kind: 'fried', count: 5 }])
    expect(a).toBe(notesSignature([{ kind: 'fried', count: 5 }]))
    expect(a).not.toBe(notesSignature([{ kind: 'fried', count: 6 }]))
    expect(notesSignature([])).toBe('')
  })
})
