import { describe, expect, it } from 'vitest'
import {
  extrasDaysFromTotals,
  mergeMealsAndExtras,
  clampQuantity, extrasByDay, foodKey, goalFor, gramsOf100g, mergeDay, nutritionFor, parseGoal, progressOf, quantityStep, recentSources, sameAsYesterday, searchFoods,
  snapshotFor, stepQuantity, sumIntake, type FoodOption, type IntakeRow, type PerUnit,
} from './intake'
import { emptyTotals, type DayTotals } from './nutrition'

const per = (kcal: number | null, protein: number | null = 0): PerUnit => ({ kcal, protein_g: protein, carbs_g: kcal === null ? null : 10, fat_g: kcal === null ? null : 1, fibre_g: kcal === null ? null : 1, sugar_g: kcal === null ? null : 2, sodium_mg: kcal === null ? null : 50 })

const food = (id: string, name: string, ta: string | null, over: Partial<FoodOption> = {}): FoodOption => ({
  key: `common:${id}`, source: { kind: 'common', id }, name_en: name, name_ta: ta, category: 'fruit', unit: 'piece', usual: 1, per: per(90, 1), ...over,
})

function row(over: Partial<IntakeRow> = {}): IntakeRow {
  return {
    id: 'r1', profile_id: 'me', eaten_on: '2026-10-11', eaten_at: '10:00', common_food_id: 'banana', custom_food_id: null, dish_id: null, food_name: 'Banana', quantity: 1, unit: 'piece',
    kcal: 90, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, fibre_g: 2.6, sugar_g: 12, sodium_mg: 1, ...over,
  }
}

describe('amounts', () => {
  it('counts pieces and servings in whole numbers and everything else in halves', () => {
    expect(quantityStep('piece')).toBe(1)
    expect(quantityStep('serving')).toBe(1)
    expect(quantityStep('glass')).toBe(0.5)
    expect(quantityStep('100g')).toBe(0.5)
  })
  it('keeps an amount on its step, at least one step and at most 50', () => {
    expect(clampQuantity('piece', 1.5)).toBe(2)
    expect(clampQuantity('glass', 1.3)).toBe(1.5)
    expect(clampQuantity('glass', 0)).toBe(0.5)
    expect(clampQuantity('piece', -3)).toBe(1)
    expect(clampQuantity('piece', 500)).toBe(50)
  })
  it('steps up and down, never below one step', () => {
    expect(stepQuantity('glass', 1, 1)).toBe(1.5)
    expect(stepQuantity('glass', 0.5, -1)).toBe(0.5)
    expect(stepQuantity('piece', 3, -1)).toBe(2)
  })
  it('turns a 100 g amount into grams', () => {
    expect(gramsOf100g(1.5)).toBe(150)
    expect(gramsOf100g(0.5)).toBe(50)
  })
})

describe('nutritionFor / snapshotFor', () => {
  it('scales every figure and rounds (whole milligrams for salt)', () => {
    const n = nutritionFor({ kcal: 7, protein_g: 0.25, carbs_g: 0.26, fat_g: 0.6, fibre_g: 0.15, sugar_g: 0.05, sodium_mg: 0.4 }, 10)
    expect(n).toEqual({ kcal: 70, protein_g: 2.5, carbs_g: 2.6, fat_g: 6, fibre_g: 1.5, sugar_g: 0.5, sodium_mg: 4 })
  })
  it('keeps unknown figures unknown instead of making them zero', () => {
    const n = nutritionFor({ kcal: null, protein_g: 4, carbs_g: null, fat_g: null, fibre_g: null, sugar_g: null, sodium_mg: null }, 2)
    expect(n.kcal).toBeNull()
    expect(n.protein_g).toBe(8)
  })
  it('copies the name, amount and nutrition for saving', () => {
    const s = snapshotFor(food('almond', 'Almonds', 'பாதாம்', { per: per(7, 0.25) }), 10)
    expect(s).toMatchObject({ food_name: 'Almonds', quantity: 10, unit: 'piece', kcal: 70, protein_g: 2.5 })
  })
})

describe('day totals', () => {
  it('adds the items of a day and counts the ones with no calories as not counted', () => {
    const day = sumIntake([row(), row({ id: 'r2', kcal: 100, protein_g: 5 }), row({ id: 'r3', kcal: null, protein_g: null, carbs_g: null })])
    expect(day.items).toBe(3)
    expect(day.unknownItems).toBe(1)
    expect(day.totals.kcal).toBe(190)
    expect(day.totals.protein_g).toBeCloseTo(6.1)
  })
  it('groups by date', () => {
    const byDay = extrasByDay([row(), row({ id: 'r2', eaten_on: '2026-10-10', kcal: 50 }), row({ id: 'r3' })])
    expect(byDay.get('2026-10-11')!.items).toBe(2)
    expect(byDay.get('2026-10-10')!.totals.kcal).toBe(50)
  })
  it('shows a day as meals plus extras plus the total of both', () => {
    const meals = { ...emptyTotals(), kcal: 1500, protein_g: 40 }
    const d = mergeDay(meals, sumIntake([row({ kcal: 200, protein_g: 12 })]))
    expect(d.total.kcal).toBe(1700)
    expect(d.total.protein_g).toBe(52)
    expect(d.extraItems).toBe(1)
    expect(mergeDay(meals, undefined).total.kcal).toBe(1500)
  })
})

describe('same as yesterday', () => {
  it('copies yesterday\'s items for today, without ids or dates', () => {
    const copy = sameAsYesterday([row({ id: 'y1' }), row({ id: 'y2', common_food_id: 'egg', food_name: 'Boiled egg' })], [])
    expect(copy).toHaveLength(2)
    expect(copy[0]).not.toHaveProperty('id')
    expect(copy[0]).not.toHaveProperty('eaten_on')
    expect(copy[0]).toMatchObject({ food_name: 'Banana', kcal: 90, profile_id: 'me' })
  })
  it('leaves out what is already logged today, so a second tap never doubles up', () => {
    const copy = sameAsYesterday([row({ id: 'y1' }), row({ id: 'y2', common_food_id: 'egg', food_name: 'Boiled egg' })], [row({ id: 't1', eaten_on: '2026-10-12' })])
    expect(copy.map((c) => c.food_name)).toEqual(['Boiled egg'])
  })
  it('copies an item again if today\'s has a different amount', () => {
    expect(sameAsYesterday([row({ id: 'y1', quantity: 2 })], [row({ id: 't1', quantity: 1 })])).toHaveLength(1)
  })
})

describe('recentSources', () => {
  it('lists each food once, newest first', () => {
    const rows = [
      row({ id: '1', eaten_on: '2026-10-09', common_food_id: 'egg' }),
      row({ id: '2', eaten_on: '2026-10-11', eaten_at: '08:00', common_food_id: 'banana' }),
      row({ id: '3', eaten_on: '2026-10-11', eaten_at: '16:00', common_food_id: null, custom_food_id: 'laddu' }),
      row({ id: '4', eaten_on: '2026-10-10', common_food_id: 'banana' }),
    ]
    expect(recentSources(rows).map(foodKey)).toEqual(['custom:laddu', 'common:banana', 'common:egg'])
    expect(recentSources(rows, 2)).toHaveLength(2)
  })
})

describe('searchFoods', () => {
  const list = [food('1', 'Boiled egg', 'வேகவைத்த முட்டை'), food('2', 'Egg white, boiled', 'முட்டை வெள்ளைக்கரு'), food('3', 'Banana', 'வாழைப்பழம்'), food('4', 'Eggless cake', null)]
  it('finds English and Tamil names', () => {
    expect(searchFoods(list, 'banana').map((f) => f.name_en)).toEqual(['Banana'])
    expect(searchFoods(list, 'வாழை').map((f) => f.name_en)).toEqual(['Banana'])
    expect(searchFoods(list, 'முட்டை').map((f) => f.name_en)).toEqual(['Egg white, boiled', 'Boiled egg'])
  })
  it('ignores case, needs every word, and lists names that start with the words first', () => {
    expect(searchFoods(list, 'EGG').map((f) => f.name_en)).toEqual(['Egg white, boiled', 'Eggless cake', 'Boiled egg'])
    expect(searchFoods(list, 'egg boiled')).toHaveLength(2)
    expect(searchFoods(list, 'xyz')).toEqual([])
  })
  it('shows everything for an empty search', () => {
    expect(searchFoods(list, '  ')).toHaveLength(4)
  })
})

describe('goals', () => {
  const target = { protein_g: 46, kcal: 1900 }
  it('uses the person\'s own goal when they set one, otherwise the suggested target', () => {
    expect(goalFor(null, target)).toEqual({ protein: { value: 46, personal: false }, kcal: { value: 1900, personal: false } })
    expect(goalFor({ protein_goal_g: 60, kcal_goal: null }, target)).toEqual({ protein: { value: 60, personal: true }, kcal: { value: 1900, personal: false } })
    expect(goalFor({ protein_goal_g: null, kcal_goal: 2100 }, target).kcal).toEqual({ value: 2100, personal: true })
  })
  it('reports progress gently: never above 100% and never a warning', () => {
    expect(progressOf(52, 60)).toEqual({ eaten: 52, goal: 60, percent: 87, remaining: 8, reached: false })
    expect(progressOf(75, 60)).toMatchObject({ percent: 100, remaining: 0, reached: true })
    expect(progressOf(0, 0).percent).toBe(0)
  })
  it('reads a typed goal: empty clears it, whole numbers in range are kept, the rest is refused', () => {
    expect(parseGoal('', 'protein')).toBeNull()
    expect(parseGoal(' 60 ', 'protein')).toBe(60)
    expect(parseGoal('5', 'protein')).toBe('invalid')
    expect(parseGoal('500', 'protein')).toBe('invalid')
    expect(parseGoal('2300', 'kcal')).toBe(2300)
    expect(parseGoal('500', 'kcal')).toBe('invalid')
    expect(parseGoal('60.5', 'protein')).toBe('invalid')
    expect(parseGoal('abc', 'kcal')).toBe('invalid')
  })
})

describe('mergeMealsAndExtras', () => {
  const day = (date: string, kcal: number): DayTotals => ({ date, totals: { ...emptyTotals(), kcal, protein_g: kcal / 30 }, meals: 2, unknownMeals: 0 })
  it('adds each day\'s extras to its meals and keeps the two parts', () => {
    const extras = extrasByDay([row({ eaten_on: '2026-10-10', kcal: 200, protein_g: 10 })])
    const { days, parts } = mergeMealsAndExtras([day('2026-10-10', 1500), day('2026-10-11', 1400)], extras)
    expect(days.map((d) => d.totals.kcal)).toEqual([1700, 1400])
    expect(parts.get('2026-10-10')).toMatchObject({ extraItems: 1 })
    expect(parts.get('2026-10-10')!.meals.kcal).toBe(1500)
    expect(parts.get('2026-10-10')!.extras.kcal).toBe(200)
    expect(parts.get('2026-10-11')!.extras.kcal).toBe(0)
  })
  it('counts a day with only extras', () => {
    const { days } = mergeMealsAndExtras([], extrasByDay([row({ eaten_on: '2026-10-12', kcal: 90 })]))
    expect(days).toHaveLength(1)
    expect(days[0]!.meals).toBe(1)
    expect(days[0]!.totals.kcal).toBe(90)
  })
  it('keeps the count of fasted meals on a day', () => {
    const { days } = mergeMealsAndExtras([{ ...day('2026-10-11', 600), fastedMeals: 1 }], new Map())
    expect(days[0]!.fastedMeals).toBe(1)
  })
  it('leaves extras with no calories out of the total', () => {
    const extras = extrasByDay([row({ kcal: null, protein_g: null }), row({ id: 'r2', kcal: 50 })])
    const { days } = mergeMealsAndExtras([day('2026-10-11', 1000)], extras)
    expect(days[0]!.totals.kcal).toBe(1050)
  })
})

describe('extrasDaysFromTotals', () => {
  it('turns the totals function rows into days of extras for one person', () => {
    const days = extrasDaysFromTotals([
      { eaten_on: '2026-10-11', totals: per(250, 9), items: 3, unknown_items: 1 },
      { eaten_on: '2026-10-10', totals: per(100, 2), items: 1, unknown_items: 0 },
    ])
    expect(days.get('2026-10-11')).toMatchObject({ items: 3, unknownItems: 1 })
    expect(days.get('2026-10-11')!.totals.kcal).toBe(250)
    expect(days.get('2026-10-10')!.totals.protein_g).toBe(2)
  })
})
