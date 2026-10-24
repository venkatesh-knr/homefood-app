import { describe, expect, it } from 'vitest'
import { EMPTY_RULE, effectOn, fastsOn, isFastingDay, isUsable, isoWeekday, slotFasting, upcomingDates, type FastingRule } from './fasting'

const rule = (over: Partial<FastingRule> = {}): FastingRule => ({ ...EMPTY_RULE('paati'), weekdays: [6], ...over })
// 2026-10-24 is a Saturday
describe('which days', () => {
  it('knows the weekday of a date', () => {
    expect(isoWeekday('2026-10-24')).toBe(6)
    expect(isoWeekday('2026-10-25')).toBe(7)
    expect(isoWeekday('2026-10-26')).toBe(1)
  })
  it('a fasting day is a chosen weekday or a chosen date', () => {
    expect(isFastingDay(rule(), '2026-10-24')).toBe(true)
    expect(isFastingDay(rule(), '2026-10-25')).toBe(false)
    expect(isFastingDay(rule({ weekdays: [], dates: ['2026-10-29'] }), '2026-10-29')).toBe(true)
  })
})

describe('what it means for a meal', () => {
  it('skip a meal: only the chosen meals are left out', () => {
    const r = rule({ mode: 'skip_meals', skip_meals: ['dinner'] })
    expect(effectOn(r, '2026-10-24', 'dinner')).toBe('skip')
    expect(effectOn(r, '2026-10-24', 'lunch')).toBe('normal')
    expect(effectOn(r, '2026-10-25', 'dinner')).toBe('normal')
  })
  it('fruits and milk only: every meal is left out of the plan that day', () => {
    const r = rule({ mode: 'fruits_milk' })
    expect(effectOn(r, '2026-10-24', 'breakfast')).toBe('skip')
    expect(effectOn(r, '2026-10-24', 'dinner')).toBe('skip')
  })
  it('one meal a day: every other meal is left out', () => {
    const r = rule({ mode: 'one_meal', one_meal: 'lunch' })
    expect(effectOn(r, '2026-10-24', 'lunch')).toBe('normal')
    expect(effectOn(r, '2026-10-24', 'snacks')).toBe('skip')
  })
  it('fasting foods only: the person still eats, fasting foods', () => {
    expect(effectOn(rule({ mode: 'fasting_foods' }), '2026-10-24', 'lunch')).toBe('foods')
    expect(effectOn(rule({ mode: 'fasting_foods' }), '2026-10-25', 'lunch')).toBe('normal')
  })
  it('does a person fast that day at all', () => {
    expect(fastsOn(rule({ mode: 'skip_meals', skip_meals: ['dinner'] }), '2026-10-24')).toBe(true)
    expect(fastsOn(rule(), '2026-10-25')).toBe(false)
  })
})

describe('everyone\'s rules for one meal', () => {
  it('lists who skips it and who eats fasting foods', () => {
    const rules = [rule({ profile_id: 'paati', mode: 'fruits_milk' }), rule({ profile_id: 'amma', mode: 'skip_meals', skip_meals: ['dinner'] }), rule({ profile_id: 'appa', mode: 'fasting_foods' }), rule({ profile_id: 'kavi', weekdays: [1] })]
    expect(slotFasting(rules, '2026-10-24', 'dinner')).toEqual({ skip: ['paati', 'amma'], foods: ['appa'] })
    expect(slotFasting(rules, '2026-10-24', 'lunch')).toEqual({ skip: ['paati'], foods: ['appa'] })
    expect(slotFasting([], '2026-10-24', 'lunch')).toEqual({ skip: [], foods: [] })
  })
})

describe('a rule worth saving', () => {
  it('needs a weekday or a date, and meals to skip or the one meal', () => {
    expect(isUsable(rule())).toBe(true)
    expect(isUsable(rule({ weekdays: [], dates: [] }))).toBe(false)
    expect(isUsable(rule({ mode: 'skip_meals', skip_meals: [] }))).toBe(false)
    expect(isUsable(rule({ mode: 'one_meal', one_meal: null }))).toBe(false)
    expect(isUsable(rule({ mode: 'fruits_milk', weekdays: [], dates: ['2026-10-29'] }))).toBe(true)
  })
  it('keeps only dates from today on, once each', () => {
    expect(upcomingDates(['2026-10-29', '2026-10-01', '2026-10-29', '2026-10-24'], '2026-10-24')).toEqual(['2026-10-24', '2026-10-29'])
  })
})
