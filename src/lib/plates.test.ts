import { describe, expect, it } from 'vitest'
import { familyEaterIds, familyHeadcount, mealFor, plateDishes, plateEaterIds, plateLabel, sharedPositions, type SlotPlate } from './plates'
import type { SlotDish } from './plannerQueries'

const dish = (id: string): SlotDish => ({ id, name: id, diet: 'veg', allergens: [], photo_path: null, cuisine_id: null, dish_names: [] })
const plate = (over: Partial<SlotPlate> = {}): SlotPlate => ({ id: 'p1', position: 1, plans: ['low_carb'], shared_sides: [1], main_dish: dish('paneer'), sides: [{ position: 1, dish: dish('salad') }], eater_ids: ['amma', 'appa'], ...over })
const slot = (plates: SlotPlate[] = [plate()]) => ({
  main_dish_id: 'rice',
  main_dish: dish('rice'),
  meal_slot_eaters: ['amma', 'appa', 'paati', 'kavi', 'arun'].map((profile_id) => ({ profile_id })),
  meal_slot_sides: [{ position: 1, dish: dish('poriyal') }, { position: 2, dish: dish('appalam') }],
  plates,
})

describe('who eats the family meal', () => {
  it('is everyone marked as eating, less the people on a plate', () => {
    expect(familyEaterIds(slot())).toEqual(['paati', 'kavi', 'arun'])
    expect(familyHeadcount(slot(), 5)).toBe(3)
    expect([...plateEaterIds(slot())].sort()).toEqual(['amma', 'appa'])
  })
  it('with no plate nothing changes', () => {
    expect(familyEaterIds(slot([]))).toHaveLength(5)
    expect(familyHeadcount(slot([]), 5)).toBe(5)
  })
  it('a meal with no list of eaters is for every family member, less the plate', () => {
    expect(familyHeadcount({ meal_slot_eaters: [], plates: [plate()] }, 5)).toBe(3)
  })
  it('never goes below nothing', () => {
    expect(familyHeadcount({ meal_slot_eaters: [{ profile_id: 'amma' }], plates: [plate({ eater_ids: ['amma', 'appa'] })] }, 5)).toBe(0)
  })
})

describe('what is on a plate', () => {
  it('its own dishes, then the family sides it shares', () => {
    expect(plateDishes(slot(), plate()).map((d) => d.id)).toEqual(['paneer', 'salad', 'poriyal'])
    expect(plateDishes(slot(), plate({ shared_sides: [] })).map((d) => d.id)).toEqual(['paneer', 'salad'])
  })
  it('knows which family sides are shared', () => {
    expect([...sharedPositions(slot())]).toEqual([1])
    expect(sharedPositions(slot([])).size).toBe(0)
  })
  it('names the people on it', () => {
    expect(plateLabel(plate(), (id) => id.toUpperCase())).toBe('AMMA + APPA')
  })
})

describe('the meal as one person eats it', () => {
  it('a person on a plate eats the plate, a person off it eats the family meal', () => {
    const s = slot()
    expect(mealFor(s, 'amma').main_dish_id).toBe('paneer')
    expect(mealFor(s, 'amma').meal_slot_sides.map((x) => x.dish.id)).toEqual(['salad', 'poriyal'])
    expect(mealFor(s, 'kavi')).toBe(s)
  })
})
