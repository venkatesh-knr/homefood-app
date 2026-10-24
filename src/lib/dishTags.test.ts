import { describe, expect, it } from 'vitest'
import { DIET_TAGS, FILTER_TAGS, correctionOf, effectiveTags } from './dishTags'
import { DEFAULT_DISH_FILTERS, passesFilters } from './dishes'

describe('a home\'s corrections of diet tags', () => {
  it('adds what the home says the dish has and takes away what it says it does not', () => {
    const fixes = new Map([['oily', true], ['pulse', false]])
    expect(effectiveTags(['grain', 'pulse'], fixes).sort()).toEqual(['grain', 'oily'])
  })
  it('leaves the catalogue\'s tags alone when there is no correction', () => {
    expect(effectiveTags(['grain'], undefined)).toEqual(['grain'])
    expect(effectiveTags(['grain'], new Map())).toEqual(['grain'])
    expect(effectiveTags(undefined, new Map([['egg', true]]))).toEqual(['egg'])
  })
  it('says which way a tag was changed', () => {
    const fixes = new Map([['oily', true], ['pulse', false]])
    expect(correctionOf(fixes, 'oily')).toBe(true)
    expect(correctionOf(fixes, 'pulse')).toBe(false)
    expect(correctionOf(fixes, 'grain')).toBeUndefined()
  })
  it('knows the seven filter chips and every tag the database accepts', () => {
    expect(FILTER_TAGS).toHaveLength(7)
    expect(new Set(DIET_TAGS).size).toBe(18)
  })
})

describe('the diet filter chips', () => {
  const dish = { household_id: null, cuisine_id: null, course: 'main' as const, diet: 'veg' as const, meal_types: ['lunch' as const], allergens: [], tags: ['low_carb', 'light'] }
  const f = (tags: string[]) => ({ ...DEFAULT_DISH_FILTERS, tags })
  it('shows a dish that has every chip that is on', () => {
    expect(passesFilters(dish, f(['low_carb']), 'h', [])).toBe(true)
    expect(passesFilters(dish, f(['low_carb', 'light']), 'h', [])).toBe(true)
  })
  it('hides a dish that lacks one of them', () => {
    expect(passesFilters(dish, f(['low_carb', 'millet']), 'h', [])).toBe(false)
    expect(passesFilters({ ...dish, tags: undefined }, f(['light']), 'h', [])).toBe(false)
  })
  it('shows everything when no chip is on', () => {
    expect(passesFilters({ ...dish, tags: [] }, f([]), 'h', [])).toBe(true)
  })
})
