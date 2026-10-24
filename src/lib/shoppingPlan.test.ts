import { describe, expect, it } from 'vitest'
import shopItems from '../demo/shopItems.json'
import { catalogIndex, type CatalogItem, type ShopItem } from './shopping'
import { addAmounts, ingredientCandidates, matchIngredient, mealsFromSlots, mergePlanIntoList, neededFor, needFor, planRange, planShopping, roundNeed, type PlanMeal, type PlanRecipe } from './shoppingPlan'

// The real shared list (src/demo/shopItems.json is written from scripts/shop_items_data.py), so these tests also guard the data.
const catalog: CatalogItem[] = (shopItems as Record<string, unknown>[]).map((r) => ({
  key: r.id as string, source: 'common', id: r.id as string, name_en: r.name_en as string, name_ta: r.name_ta as string, aliases: r.aliases as string[],
  section: r.section as CatalogItem['section'], tab: r.browse_tab as CatalogItem['tab'], usual_amount: r.usual_amount as number, usual_unit: r.usual_unit as CatalogItem['usual_unit'],
  perishable: r.perishable as boolean, staple: r.staple as boolean, pack_sizes: r.pack_sizes as number[] | null, g_per_cup: r.g_per_cup as number | null, g_per_piece: r.g_per_piece as number | null, created_by: null,
}))
const item = (name: string) => {
  const c = catalog.find((x) => x.name_en === name)
  if (!c) throw new Error(`no shop item "${name}"`)
  return c
}
const index = catalogIndex(catalog)

describe('rounding a need to a shop amount', () => {
  it('non-perishables: the smallest pack that covers it', () => {
    expect(roundNeed(item('Toor dal'), 380)).toEqual({ amount: 500, unit: 'g', approx: false })
    expect(roundNeed(item('Rice'), 1300)).toEqual({ amount: 2, unit: 'kg', approx: false })
    expect(roundNeed(item('Rice'), 100)).toEqual({ amount: 100, unit: 'g', approx: false })
    expect(roundNeed(item('Toor dal'), 0)).toEqual({ amount: 100, unit: 'g', approx: false })
  })
  it("an item's own packs win: oil comes in 1 L and 5 L", () => {
    expect(roundNeed(item('Oil'), 300)).toEqual({ amount: 1, unit: 'L', approx: false })
    expect(roundNeed(item('Oil'), 1200)).toEqual({ amount: 5, unit: 'L', approx: false })
    expect(roundNeed(item('Sesame oil'), 400)).toEqual({ amount: 500, unit: 'ml', approx: false })
  })
  it('above the largest pack it rounds up to whole kg', () => {
    expect(roundNeed(item('Rice'), 7300)).toEqual({ amount: 8, unit: 'kg', approx: false })
  })
  it('perishables: rounded up to 50 g, 100 ml, whole pieces and bunches, and shown as about', () => {
    expect(roundNeed(item('Tomato'), 761)).toEqual({ amount: 800, unit: 'g', approx: true })
    expect(roundNeed(item('Tomato'), 1125)).toEqual({ amount: 1.15, unit: 'kg', approx: true })
    expect(roundNeed(item('Milk'), 1250)).toEqual({ amount: 1.3, unit: 'L', approx: true })
    expect(roundNeed(item('Drumstick'), 3.2)).toEqual({ amount: 4, unit: 'pcs', approx: true })
    expect(roundNeed(item('Eggs'), 6)).toEqual({ amount: 6, unit: 'pcs', approx: true })
    expect(roundNeed(item('Coriander leaves'), 0.25)).toEqual({ amount: 1, unit: 'bunch', approx: true })
    expect(roundNeed(item('Tomato'), 0)).toEqual({ amount: 50, unit: 'g', approx: true })
  })
  it('items bought as a pack stay one pack', () => {
    expect(roundNeed(item('Papad'), 3)).toEqual({ amount: 1, unit: 'pack', approx: false })
  })
})

describe('turning recipe amounts into shop amounts', () => {
  it('cups and spoons become grams or ml behind the scenes', () => {
    expect(needFor(item('Toor dal'), 0.5, 'cup')).toBe(100)
    expect(needFor(item('Rice'), 2, 'cup')).toBe(380)
    expect(needFor(item('Oil'), 4, 'tbsp')).toBe(60)
    expect(needFor(item('Oil'), 3, 'tsp')).toBe(15)
    expect(needFor(item('Sugar'), 2, 'tbsp')).toBe(25)
  })
  it('pieces become grams for items bought by weight, and stay pieces otherwise', () => {
    expect(needFor(item('Tomato'), 3, 'piece')).toBe(300)
    expect(needFor(item('Drumstick'), 2, 'piece')).toBe(2)
    expect(needFor(item('Garlic'), 5, 'clove')).toBe(20)
    expect(needFor(item('Coconut'), 1, 'cup')).toBe(0.5)
  })
  it('what cannot be converted gives nothing; "to taste" gives a tiny amount', () => {
    expect(needFor(item('Cashew nuts'), 8, 'piece')).toBeNull()
    expect(needFor(item('Papad'), 2, 'piece')).toBeNull()
    expect(needFor(item('Coriander leaves'), null, 'to_taste')).toBe(0.25)
  })
})

describe('matching recipe ingredient names', () => {
  it('tries the plain name, the part before a comma, and the first of "and" / "or"', () => {
    expect(ingredientCandidates('Onion, chopped')).toContain('onion')
    expect(ingredientCandidates('Oil for frying')).toContain('oil')
    expect(ingredientCandidates('Mustard seeds and curry leaves')).toContain('mustard seed')
  })
  const nameOf = (ing: string) => {
    const m = matchIngredient(index, ing)
    return m === 'ignore' ? 'ignore' : m?.name_en
  }
  it('finds the shop item', () => {
    expect(nameOf('Onion, chopped')).toBe('Onion')
    expect(nameOf('Small onion')).toBe('Small onion')
    expect(nameOf('Shallots, chopped')).toBe('Small onion')
    expect(nameOf('Oil for frying')).toBe('Oil')
    expect(nameOf('Rava (semolina)')).toBe('Rava')
    expect(nameOf('Grated coconut')).toBe('Coconut')
    expect(nameOf('Mustard seeds and curry leaves')).toBe('Mustard seeds')
    expect(nameOf('Thick curd')).toBe('Curd')
    expect(nameOf('Green chillies')).toBe('Green chilli')
    expect(nameOf('Toor dal, cooked')).toBe('Toor dal')
  })
  it('ignores water and cooked rice, and leaves odd ingredients unmatched', () => {
    expect(nameOf('Water')).toBe('ignore')
    expect(nameOf('Cold water')).toBe('ignore')
    expect(nameOf('Cooked rice')).toBe('ignore')
    expect(nameOf('Tomato puree')).toBeUndefined()
  })
})

const sambar: PlanRecipe = {
  servings: 4,
  ingredients: [
    { name: 'Toor dal', quantity: 0.5, unit: 'cup' },
    { name: 'Tomato', quantity: 3, unit: 'piece' },
    { name: 'Drumstick', quantity: 2, unit: 'piece' },
    { name: 'Small onion', quantity: 8, unit: 'piece' },
    { name: 'Sambar powder', quantity: 2, unit: 'tbsp' },
    { name: 'Salt', quantity: null, unit: 'to_taste' },
    { name: 'Water', quantity: 3, unit: 'cup' },
    { name: 'Tomato puree', quantity: 1, unit: 'cup' },
  ],
}
const dish = (id: string, name: string, ta: string | null = null) => ({ id, name_en: name, name_ta: ta })
const meal = (slotId: string, d: ReturnType<typeof dish>, people: number): PlanMeal => ({ slotId, dish: d, people })

describe('planning the shopping', () => {
  const sambarDish = dish('d-sambar', 'Sambar', 'சாம்பார்')
  const recipes = new Map([['d-sambar', sambar]])

  it('adds up three sambars for five people and rounds the tomato to 50 g', () => {
    const plan = planShopping([meal('s1', sambarDish, 5), meal('s2', sambarDish, 5), meal('s3', sambarDish, 5)], recipes, catalog, 'en')
    const tomato = plan.lines.find((l) => l.item.name_en === 'Tomato')!
    // 3 pieces for 4 people = 3.75 pieces for 5 = 375 g; three times = 1125 g → 1150 g
    expect(tomato).toMatchObject({ amount: 1.15, unit: 'kg', approx: true, dishes: ['Sambar'] })
    expect(plan.mealCount).toBe(3)
  })

  it('rounds drumstick pieces up', () => {
    const plan = planShopping([meal('s1', sambarDish, 5)], recipes, catalog, 'en')
    // 2 pieces for 4 people = 2.5 for 5 → 3
    expect(plan.lines.find((l) => l.item.name_en === 'Drumstick')).toMatchObject({ amount: 3, unit: 'pcs' })
  })

  it('suggests a pack for non-perishables: 0.5 cup dal for 4 people is 100 g', () => {
    const plan = planShopping([meal('s1', sambarDish, 4)], recipes, catalog, 'en')
    expect(plan.lines.find((l) => l.item.name_en === 'Toor dal')).toMatchObject({ amount: 100, unit: 'g', approx: false })
  })

  it('counts each meal at its own head count (a smaller meal needs less)', () => {
    const big = planShopping([meal('s1', sambarDish, 8)], recipes, catalog, 'en').lines.find((l) => l.item.name_en === 'Tomato')!
    const small = planShopping([meal('s1', sambarDish, 2)], recipes, catalog, 'en').lines.find((l) => l.item.name_en === 'Tomato')!
    expect(big.amount).toBe(600)
    expect(small.amount).toBe(150)
  })

  it('keeps staples apart, skips water, and lists what it cannot match', () => {
    const plan = planShopping([meal('s1', sambarDish, 4)], recipes, catalog, 'en')
    expect(plan.staples.map((l) => l.item.name_en)).toEqual(['Salt', 'Sambar powder'])
    expect(plan.lines.some((l) => l.item.staple)).toBe(false)
    expect(plan.lines.some((l) => l.item.name_en === 'Water')).toBe(false)
    expect(plan.unmatched).toEqual([{ name: 'Tomato puree', dishes: ['Sambar'] }])
  })

  it('names the dishes in the chosen language, and counts only meals with a recipe', () => {
    const plan = planShopping([meal('s1', sambarDish, 4), meal('s2', dish('d-none', 'Pizza'), 4)], recipes, catalog, 'ta')
    expect(plan.lines.find((l) => l.item.name_en === 'Tomato')!.dishes).toEqual(['சாம்பார்'])
    expect(plan.mealCount).toBe(1)
  })

  it('sorts by section, vegetables first', () => {
    const plan = planShopping([meal('s1', sambarDish, 4)], recipes, catalog, 'en')
    expect(plan.lines.map((l) => l.item.section)).toEqual(['veg_fruit', 'veg_fruit', 'veg_fruit', 'grocery'].slice(0, plan.lines.length))
  })
})

describe('which meals count', () => {
  const d = (id: string) => ({ id, name: id, dish_names: [{ language: 'en', name: id.toUpperCase() }, { language: 'ta', name: `${id}-ta` }] })
  const slot = (id: string, over: Record<string, unknown> = {}) => ({ id, source: 'home', main_dish: d('main'), meal_slot_sides: [{ position: 2, dish: d('b') }, { position: 1, dish: d('a') }], meal_slot_eaters: [{ profile_id: 'p1' }, { profile_id: 'p2' }], ...over })

  it('takes the main dish and the sides, with the number of people eating that meal', () => {
    const meals = mealsFromSlots([slot('s1')], 5)
    expect(meals.map((m) => [m.dish.id, m.people])).toEqual([['main', 2], ['a', 2], ['b', 2]])
    expect(meals[0]!.dish).toEqual({ id: 'main', name_en: 'MAIN', name_ta: 'main-ta' })
  })
  it('leaves a leftover side out: it is not cooked again, so it needs nothing from the shop', () => {
    const meals = mealsFromSlots([slot('s1', { meal_slot_sides: [{ position: 1, dish: d('a') }, { position: 2, dish: d('left'), is_leftover: true }] })], 5)
    expect(meals.map((m) => m.dish.id)).toEqual(['main', 'a'])
  })
  it('cooks the family meal for the people not on a diet plate, the plate for its own, and a shared side for everyone', () => {
    const plates = [{ main_dish: d('paneer'), sides: [{ position: 1, dish: d('salad') }], shared_sides: [1], eater_ids: ['p1'] }]
    const meals = mealsFromSlots([slot('s1', { meal_slot_eaters: [{ profile_id: 'p1' }, { profile_id: 'p2' }, { profile_id: 'p3' }], plates })], 5)
    expect(meals.map((m) => [m.dish.id, m.people])).toEqual([['main', 2], ['a', 3], ['b', 2], ['paneer', 1], ['salad', 1]])
  })
  it('does not cook for people who skip the meal because they are fasting', () => {
    const meals = mealsFromSlots([slot('s1', { meal_slot_eaters: [{ profile_id: 'p1' }, { profile_id: 'p2' }, { profile_id: 'p3' }], fasting: { skip: ['p3'], foods: [] } })], 5)
    expect(meals.map((m) => [m.dish.id, m.people])).toEqual([['main', 2], ['a', 2], ['b', 2]])
  })
  it('uses the family count when a meal has no list of who is eating', () => {
    expect(mealsFromSlots([slot('s1', { meal_slot_eaters: [] })], 5)[0]!.people).toBe(5)
  })
  it('skips dine-out and order-in meals and empty slots', () => {
    expect(mealsFromSlots([slot('s1', { source: 'dine_out' }), slot('s2', { source: 'order_in' }), slot('s3', { main_dish: null, meal_slot_sides: [] })], 5)).toEqual([])
  })
})

describe('the date range', () => {
  it('rest of this week runs from tomorrow to the last day of the week', () => {
    expect(planRange('week', '2026-09-30', 1)).toEqual({ from: '2026-10-01', to: '2026-10-04', empty: false }) // Wednesday, week starts Monday
    expect(planRange('week', '2026-09-30', 7)).toEqual({ from: '2026-10-01', to: '2026-10-03', empty: false }) // week starts Sunday
  })
  it('is empty when tomorrow is already next week', () => {
    expect(planRange('week', '2026-10-04', 1).empty).toBe(true) // Sunday
  })
  it('next 7 days is tomorrow and the six days after', () => {
    expect(planRange('next7', '2026-09-30', 1)).toEqual({ from: '2026-10-01', to: '2026-10-07', empty: false })
    expect(planRange('next7', '2026-10-04', 1)).toEqual({ from: '2026-10-05', to: '2026-10-11', empty: false })
  })
})

describe('putting the plan on the list', () => {
  const row = (over: Partial<ShopItem> & { name: string }): ShopItem => ({
    id: over.name, household_id: 'h', name_ta: null, section: 'veg_fruit', amount: null, unit: null, note: null, source: 'manual', source_dishes: [], is_regular: false,
    added_by: null, bought_at: null, bought_by: null, created_at: '2026-10-23T08:00:00Z', ...over,
  })
  const pick = (over: Record<string, unknown> = {}) => ({ name: 'Tomato', name_ta: 'தக்காளி', section: 'veg_fruit' as const, amount: 1, unit: 'kg' as const, dishes: ['Sambar'], ...over })

  it('adds amounts of the same kind', () => {
    expect(addAmounts({ amount: 500, unit: 'g' }, { amount: 1, unit: 'kg' })).toEqual({ amount: 1.5, unit: 'kg' })
    expect(addAmounts({ amount: 4, unit: 'pcs' }, { amount: 3, unit: 'pcs' })).toEqual({ amount: 7, unit: 'pcs' })
    expect(addAmounts({ amount: 1, unit: 'L' }, { amount: 500, unit: 'ml' })).toEqual({ amount: 1.5, unit: 'L' })
    expect(addAmounts({ amount: null, unit: null }, { amount: 2, unit: 'kg' })).toEqual({ amount: 2, unit: 'kg' })
  })
  it('leaves the amount alone when the kinds differ (pieces and weight)', () => {
    expect(addAmounts({ amount: 4, unit: 'pcs' }, { amount: 1, unit: 'kg' })).toBeNull()
  })
  it('inserts new items with source "plan" and the dishes', () => {
    const { inserts, updates } = mergePlanIntoList([], [pick()], 'h', 'me')
    expect(updates).toEqual([])
    expect(inserts).toEqual([{ household_id: 'h', name: 'Tomato', name_ta: 'தக்காளி', section: 'veg_fruit', amount: 1, unit: 'kg', source: 'plan', source_dishes: ['Sambar'], added_by: 'me' }])
  })
  it('merges into an item already on the list: amounts added, dishes joined', () => {
    const { inserts, updates } = mergePlanIntoList([row({ name: 'Tomato', amount: 500, unit: 'g', source_dishes: ['Rasam'] })], [pick()], 'h', 'me')
    expect(inserts).toEqual([])
    expect(updates).toEqual([{ id: 'Tomato', patch: { amount: 1.5, unit: 'kg', source: 'plan', source_dishes: ['Rasam', 'Sambar'] } }])
  })
  it('brings a ticked-off item back with the new amount', () => {
    const { updates } = mergePlanIntoList([row({ name: 'Tomato', amount: 2, unit: 'kg', bought_at: '2026-10-22T08:00:00Z', bought_by: 'p', source_dishes: ['Old'] })], [pick()], 'h', 'me')
    expect(updates).toEqual([{ id: 'Tomato', patch: { amount: 1, unit: 'kg', source: 'plan', source_dishes: ['Sambar'], bought_at: null, bought_by: null } }])
  })
  it('adds an unmatched ingredient with no amount', () => {
    const { inserts } = mergePlanIntoList([], [pick({ name: 'Tomato puree', name_ta: null, section: 'other', amount: null, unit: null })], 'h', 'me')
    expect(inserts[0]).toMatchObject({ name: 'Tomato puree', section: 'other', amount: null, unit: null })
  })
  it('finds what is needed for tomorrow by dish name in either language', () => {
    const items = [row({ name: 'Drumstick', source: 'plan', source_dishes: ['Sambar'] }), row({ name: 'Paneer', source: 'plan', source_dishes: ['Palak paneer'] }), row({ name: 'Milk', source: 'regular' }), row({ name: 'Onion', source: 'plan', source_dishes: ['சாம்பார்'], bought_at: '2026-10-23T08:00:00Z' })]
    expect(neededFor(items, ['sambar', 'சாம்பார்']).map((i) => i.name)).toEqual(['Drumstick'])
  })
})
