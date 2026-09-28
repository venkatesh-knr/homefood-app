import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DISH_FILTERS,
  assignableCuisines,
  cuisineLabel,
  dietColor,
  dishConflictsWith,
  dishDisplayName,
  dishTone,
  matchesQuery,
  passesFilters,
  type Cuisine,
  type Dish,
} from './dishes'

const HH = 'household-1'

function dish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: 'd1',
    household_id: null,
    cuisine_id: 'south',
    name: 'Dosa',
    meal_types: ['breakfast'],
    course: 'main',
    diet: 'veg',
    tags: [],
    allergens: [],
    prep_minutes: 20,
    photo_path: null,
    photo_credit: null,
    recipe_search: null,
    where_seen: null,
    created_by: null,
    created_at: '',
    ...overrides,
  }
}

describe('dishDisplayName', () => {
  it('prefers the matching-language name', () => {
    expect(dishDisplayName(dish(), [{ language: 'ta', name: 'தோசை' }], 'ta')).toBe('தோசை')
  })
  it('falls back to dishes.name when the language is missing', () => {
    expect(dishDisplayName(dish(), [{ language: 'ta', name: 'தோசை' }], 'en')).toBe('Dosa')
  })
})

describe('cuisineLabel', () => {
  const c: Cuisine = { id: 'c1', household_id: null, parent_id: null, name: 'South Indian', name_ta: 'தென்னிந்திய', sort_order: 1 }
  it('uses the Tamil name only in Tamil', () => {
    expect(cuisineLabel(c, 'ta')).toBe('தென்னிந்திய')
    expect(cuisineLabel(c, 'en')).toBe('South Indian')
  })
  it('falls back to the English name if Tamil is missing', () => {
    expect(cuisineLabel({ ...c, name_ta: null }, 'ta')).toBe('South Indian')
  })
})

describe('assignableCuisines', () => {
  // Mirrors supabase/migrations/0003_seed_cuisines.sql: "Indian" groups two children,
  // "European"/"Japanese" stand alone with no parent_id of their own either.
  const mk = (id: string, parent_id: string | null): Cuisine => ({ id, household_id: null, parent_id, name: id, name_ta: null, sort_order: 1 })
  const cuisines = [mk('indian', null), mk('south', 'indian'), mk('north', 'indian'), mk('european', null), mk('japanese', null)]

  it('excludes a pure grouping parent even though its own parent_id is also null', () => {
    const ids = assignableCuisines(cuisines).map((c) => c.id)
    expect(ids).not.toContain('indian')
  })
  it('includes parentless cuisines that are not themselves a parent of anything', () => {
    const ids = assignableCuisines(cuisines).map((c) => c.id)
    expect(ids).toEqual(expect.arrayContaining(['south', 'north', 'european', 'japanese']))
  })
})

describe('dishTone', () => {
  it('pairs dark backgrounds with a light initial and vice versa', () => {
    const light = dishTone(0)
    expect(light.ink).toBe('#2B2622')
    const dark = dishTone(1)
    expect(dark.ink).toBe('#FFF8EE')
  })
})

describe('dietColor', () => {
  it('is distinct per diet', () => {
    const colors = new Set([dietColor('veg'), dietColor('egg'), dietColor('non_veg')])
    expect(colors.size).toBe(3)
  })
})

describe('dishConflictsWith', () => {
  it('is true when any allergen overlaps', () => {
    expect(dishConflictsWith(dish({ allergens: ['milk', 'cashew'] }), ['soy', 'cashew'])).toBe(true)
  })
  it('is false with no overlap or no allergens to check', () => {
    expect(dishConflictsWith(dish({ allergens: ['milk'] }), ['soy'])).toBe(false)
    expect(dishConflictsWith(dish({ allergens: [] }), ['soy'])).toBe(false)
  })
})

describe('matchesQuery', () => {
  it('matches either language, case-insensitively', () => {
    expect(matchesQuery('Dosa', 'தோசை', 'dosa')).toBe(true)
    expect(matchesQuery('Dosa', 'தோசை', 'தோசை')).toBe(true)
    expect(matchesQuery('Dosa', 'தோசை', 'pizza')).toBe(false)
  })
  it('an empty query matches everything', () => {
    expect(matchesQuery('Dosa', undefined, '  ')).toBe(true)
  })
})

describe('passesFilters', () => {
  it('the "mine" pseudo-cuisine matches only this household\'s own dishes', () => {
    const mine = { ...DEFAULT_DISH_FILTERS, cuisineId: 'mine' as const }
    expect(passesFilters(dish({ household_id: HH }), mine, HH, [])).toBe(true)
    expect(passesFilters(dish({ household_id: null }), mine, HH, [])).toBe(false)
  })
  it('a specific cuisine filters out everything else', () => {
    const f = { ...DEFAULT_DISH_FILTERS, cuisineId: 'north' }
    expect(passesFilters(dish({ cuisine_id: 'north' }), f, HH, [])).toBe(true)
    expect(passesFilters(dish({ cuisine_id: 'south' }), f, HH, [])).toBe(false)
  })
  it('"both" course always passes a course filter', () => {
    const f = { ...DEFAULT_DISH_FILTERS, course: 'main' as const }
    expect(passesFilters(dish({ course: 'both' }), f, HH, [])).toBe(true)
    expect(passesFilters(dish({ course: 'side' }), f, HH, [])).toBe(false)
  })
  it('safeOnly excludes dishes that conflict with household allergies', () => {
    const f = { ...DEFAULT_DISH_FILTERS, safeOnly: true }
    expect(passesFilters(dish({ allergens: ['soy'] }), f, HH, ['soy'])).toBe(false)
    expect(passesFilters(dish({ allergens: [] }), f, HH, ['soy'])).toBe(true)
  })
})
