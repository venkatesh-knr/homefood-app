import { describe, expect, it } from 'vitest'
import { addTotals, dayTotalsFor, emptyTotals, familyNotes, mealTotals, OUTSIDE_MEAL_ESTIMATES, percentOf, summarisePeriod, targetFor, type TargetRow, type Totals } from './nutrition'

const t = (kcal: number, protein_g = 0, sodium_mg = 0, fibre_g = 0, sugar_g = 0): Totals => ({ ...emptyTotals(), kcal, protein_g, sodium_mg, fibre_g, sugar_g })

describe('totals', () => {
  it('adds nutrients and works out a share of a reference', () => {
    expect(addTotals(t(100, 5), t(50, 2)).kcal).toBe(150)
    expect(percentOf(320, 2000)).toBe(16)
  })
})

describe('mealTotals', () => {
  const byDish = new Map<string, Totals>([['dosa', t(150, 3.5)], ['sambar', t(130, 6)]])
  it('adds the main dish and every side that has an estimate', () => {
    const m = mealTotals({ source: 'home', main_dish_id: 'dosa', meal_slot_sides: [{ dish: { id: 'sambar' } }, { dish: { id: 'unknown' } }] }, byDish)
    expect(m.known).toBe(true)
    expect(m.totals.kcal).toBe(280)
  })
  it('has no estimate for dine-out / order-in, or a dish we know nothing about', () => {
    expect(mealTotals({ source: 'dine_out', main_dish_id: 'dosa', meal_slot_sides: [] }, byDish).known).toBe(false)
    expect(mealTotals({ source: 'home', main_dish_id: 'mystery', meal_slot_sides: [] }, byDish).known).toBe(false)
  })
})

describe('meals out', () => {
  const byDish = new Map<string, Totals>()
  it('counts a dine-out or order-in meal as a rough estimate once someone says how big it was', () => {
    const m = mealTotals({ source: 'dine_out', outside_meal_size: 'heavy', main_dish_id: null, meal_slot_sides: [] }, byDish)
    expect(m.known).toBe(true)
    expect(m.totals).toEqual(OUTSIDE_MEAL_ESTIMATES.heavy)
    expect(mealTotals({ source: 'order_in', outside_meal_size: 'light', main_dish_id: null, meal_slot_sides: [] }, byDish).totals.kcal).toBe(OUTSIDE_MEAL_ESTIMATES.light.kcal)
    expect(mealTotals({ source: 'dine_out', outside_meal_size: null, main_dish_id: null, meal_slot_sides: [] }, byDish).known).toBe(false)
  })
  it('has light, normal and heavy in a sensible order', () => {
    expect(OUTSIDE_MEAL_ESTIMATES.light.kcal).toBeLessThan(OUTSIDE_MEAL_ESTIMATES.normal.kcal)
    expect(OUTSIDE_MEAL_ESTIMATES.normal.kcal).toBeLessThan(OUTSIDE_MEAL_ESTIMATES.heavy.kcal)
  })
  it('adds into the day, scaled by portion, and leaves unsized meals out as before', () => {
    const eaters = [{ profile_id: 'me' }]
    const slots = [
      { id: 'a', date: '2026-10-01', source: 'dine_out', outside_meal_size: 'normal' as const, main_dish_id: null, meal_slot_sides: [], meal_slot_eaters: eaters },
      { id: 'b', date: '2026-10-01', source: 'order_in', outside_meal_size: null, main_dish_id: null, meal_slot_sides: [], meal_slot_eaters: eaters },
    ]
    const days = dayTotalsFor(slots, 'me', byDish, '2026-10-03', [{ slot_id: 'a', profile_id: 'me', status: 'ate', portion: 'small' }])
    expect(days[0]!.totals.kcal).toBeCloseTo(OUTSIDE_MEAL_ESTIMATES.normal.kcal * 0.75)
    expect(days[0]!.unknownMeals).toBe(1)
  })
})

describe('dayTotalsFor', () => {
  const byDish = new Map<string, Totals>([['dosa', t(150, 3.5)], ['idli', t(175, 5.5)]])
  const slot = (date: string, dish: string, eaters: string[]) => ({ date, source: 'home', main_dish_id: dish, meal_slot_sides: [], meal_slot_eaters: eaters.map((profile_id) => ({ profile_id })) })
  it('only counts meals this person eats, up to today, grouped by day', () => {
    const days = dayTotalsFor(
      [slot('2026-10-01', 'dosa', ['me']), slot('2026-10-01', 'idli', ['me', 'x']), slot('2026-10-01', 'idli', ['x']), slot('2026-10-02', 'idli', ['me']), slot('2026-10-09', 'idli', ['me'])],
      'me',
      byDish,
      '2026-10-03',
    )
    expect(days.map((d) => [d.date, d.meals, d.totals.kcal])).toEqual([['2026-10-01', 2, 325], ['2026-10-02', 1, 175]])
  })
  it('leaves out skipped meals and scales small and large portions', () => {
    const withId = (id: string, date: string, dish: string) => ({ id, ...slot(date, dish, ['me']) })
    const slots = [withId('a', '2026-10-01', 'dosa'), withId('b', '2026-10-01', 'idli'), withId('c', '2026-10-02', 'idli'), withId('d', '2026-10-02', 'dosa')]
    const days = dayTotalsFor(
      slots,
      'me',
      byDish,
      '2026-10-03',
      [
        { slot_id: 'a', profile_id: 'me', status: 'skipped', portion: 'normal' },
        { slot_id: 'b', profile_id: 'me', status: 'ate', portion: 'small' },
        { slot_id: 'c', profile_id: 'me', status: 'ate', portion: 'large' },
        { slot_id: 'd', profile_id: 'other', status: 'skipped', portion: 'normal' },
      ],
    )
    expect(days.map((d) => [d.date, d.meals, Math.round(d.totals.kcal)])).toEqual([['2026-10-01', 1, 131], ['2026-10-02', 2, 369]])
  })
})

describe('targetFor', () => {
  const rows: TargetRow[] = [
    { age_band: 'adult', sex: 'female', activity: 'moderate', ...t(2230, 46, 2000, 30, 56) },
    { age_band: 'adult', sex: 'male', activity: 'moderate', ...t(2730, 54, 2000, 30, 68) },
    { age_band: 'senior', sex: 'female', activity: 'light', ...t(1650, 46, 2000, 30, 41) },
    { age_band: 'senior', sex: 'male', activity: 'light', ...t(2000, 54, 2000, 30, 50) },
  ]
  it('uses the person\'s own band, sex and activity', () => {
    const r = targetFor({ birth_year: 1950, sex: 'female', activity: 'light' }, rows, 2026)!
    expect(r.target.kcal).toBe(1650)
    expect(r.assumed).toEqual([])
  })
  it('fills gaps with adult / average of the sexes / moderate, and says so', () => {
    const r = targetFor({ birth_year: null, sex: null, activity: null }, rows, 2026)!
    expect(r.target.kcal).toBe(2480)
    expect(r.assumed).toEqual(['age', 'sex', 'activity'])
  })
  it('returns null when the reference table has no matching row', () => {
    expect(targetFor({ birth_year: 2020, sex: 'male', activity: 'light' }, rows, 2026)).toBeNull()
  })
})

describe('summarisePeriod', () => {
  const target = t(2000, 50, 2000, 30, 50)
  const day = (date: string, kcal: number, protein: number, sodium: number, fibre = 25) => ({ date, totals: t(kcal, protein, sodium, fibre), meals: 3, unknownMeals: 0 })
  it('averages the days that have data and compares with the target', () => {
    const s = summarisePeriod([day('a', 1800, 40, 1500), day('b', 2200, 60, 2500)], target)
    expect(s.dayCount).toBe(2)
    expect(s.average.kcal).toBe(2000)
    expect(s.percentOfTarget.kcal).toBe(100)
  })
  it('suggests gently: low protein / high salt on several days, never from one day', () => {
    const many = summarisePeriod([day('a', 2000, 30, 2600), day('b', 2000, 35, 2700), day('c', 2000, 70, 1000)], target)
    expect(many.tips.map((x) => x.key)).toEqual(['proteinLow', 'sodiumHigh'])
    expect(summarisePeriod([day('a', 2000, 30, 2600)], target).tips).toEqual([])
  })
  it('ignores days where nothing had an estimate', () => {
    const s = summarisePeriod([{ date: 'a', totals: emptyTotals(), meals: 2, unknownMeals: 2 }], target)
    expect(s.dayCount).toBe(0)
    expect(s.average.kcal).toBe(0)
  })
})

describe('familyNotes', () => {
  const people = [{ name: 'Paati', band: 'senior' as const }, { name: 'Kavi', band: 'child' as const }, { name: 'Amma', band: 'adult' as const }]
  it('turns tags and ages into short notes', () => {
    expect(familyNotes(['steamed'], people)).toEqual([{ kind: 'good', key: 'softChew', names: ['Paati', 'Kavi'] }])
    expect(familyNotes(['spicy'], people)[0]).toMatchObject({ key: 'spicyKids', names: ['Kavi'] })
    expect(familyNotes(['fried'], people)[0]).toMatchObject({ key: 'friedCare', names: ['Paati'] })
    expect(familyNotes(['ghee', 'sweet'], people).map((n) => n.key)).toEqual(['gheeRich', 'sweetInfo'])
  })
  it('says nothing when no one in the home is affected', () => {
    expect(familyNotes(['spicy', 'fried'], [{ name: 'Amma', band: 'adult' }])).toEqual([])
  })
})
