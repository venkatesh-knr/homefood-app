// Scenario tests that walk the REAL shared data: all 331 dishes (src/lib/fixtures/allDishes.json, written by scripts/gen-demo-catalogue.py),
// the 150 shop items and the 82 everyday foods. They answer "can a person find this by typing it?" for every item, in every picker context.
// The matching test-case list is docs/test-cases.md (section A and B).
import { describe, expect, it } from 'vitest'
import all from './fixtures/allDishes.json'
import shopItems from '../demo/shopItems.json'
import catalogue from '../demo/catalogue.json'
import { DEFAULT_DISH_FILTERS, dishMatchesQuery, pickerFit, pickerMatches, pickerStartCourse, type DietType, type DishCourse, type DishFilters, type MealType } from './dishes'
import { searchFoods, type FoodOption } from './intake'
import { suggestItems, type CatalogItem } from './shopping'
import { matchesWords, plainWords } from './search'
import { PLAN_KEYS, planFits, type FitKey } from './dietPlans'

type Row = { name: string; ta: string; meal_types: MealType[]; course: DishCourse; diet: DietType; tags: string[]; allergens: string[] }
const rows = all as unknown as Row[]
const dishes = rows.map((r, i) => ({
  id: `d${i}`,
  household_id: null,
  cuisine_id: null,
  name: r.name,
  course: r.course,
  diet: r.diet,
  meal_types: r.meal_types,
  tags: r.tags,
  allergens: r.allergens,
  dish_names: [{ language: 'en' as const, name: r.name }, ...(r.ta ? [{ language: 'ta' as const, name: r.ta }] : [])],
}))
const MEALS: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']
const HOME = 'home-1'

/** What the picker lists when it is opened for `course` at `meal` and `query` is typed (the same code the screen runs). */
function picker(course: 'main' | 'side', meal: MealType, query: string, over: Partial<DishFilters> = {}, widenCourse = false) {
  const filters: DishFilters = { ...DEFAULT_DISH_FILTERS, course: pickerStartCourse(course, meal), mealType: meal, query, ...over }
  return pickerMatches(dishes, filters, { widenCourse, householdId: HOME, allergens: [], prefs: [] }).map((d) => d.name)
}

describe('the shared catalogue itself', () => {
  it('has every dish with a meal, a valid course and diet, and a Tamil name', () => {
    expect(rows.length).toBeGreaterThanOrEqual(331)
    for (const r of rows) {
      expect(r.meal_types.length, r.name).toBeGreaterThan(0)
      expect(['main', 'side', 'both'], r.name).toContain(r.course)
      expect(['veg', 'egg', 'non_veg'], r.name).toContain(r.diet)
      expect(r.ta, `${r.name} has no Tamil name`).toBeTruthy()
    }
  })
  it('has no two dishes with the same name', () => {
    const seen = new Set<string>()
    for (const r of rows) {
      const k = r.name.toLowerCase()
      expect(seen.has(k), r.name).toBe(false)
      seen.add(k)
    }
  })
  it('lists a veg dish as veg: nothing tagged meat or egg is veg, and an egg dish is tagged egg', () => {
    for (const r of rows) if (r.diet === 'veg') expect(r.tags.includes('meat') || r.tags.includes('egg'), `${r.name} is veg but tagged meat or egg`).toBe(false)
    for (const r of rows) if (r.diet === 'egg') expect(r.tags, `${r.name} is an egg dish`).toContain('egg')
    for (const r of rows) if (r.diet === 'non_veg') expect(r.tags, `${r.name} is a non-veg dish`).toContain('meat')
  })
  it('carries the egg allergen on every egg dish', () => {
    for (const r of rows) if (r.diet === 'egg') expect(r.allergens, r.name).toContain('egg')
  })
})

describe('A1 · every dish can be found by typing its name, wherever the picker was opened', () => {
  for (const course of ['main', 'side'] as const) {
    for (const meal of MEALS) {
      it(`English name, picking a ${course} dish for ${meal}`, () => {
        for (const r of rows) expect(picker(course, meal, r.name), `${r.name} (${course}, ${meal})`).toContain(r.name)
      })
      it(`Tamil name, picking a ${course} dish for ${meal}`, () => {
        for (const r of rows) expect(picker(course, meal, r.ta), `${r.ta} = ${r.name} (${course}, ${meal})`).toContain(r.name)
      })
    }
  }
})

describe('A2 · typing the name loosely still finds it', () => {
  it('in capitals, with extra spaces and with the words the other way round', () => {
    for (const r of rows) {
      const words = plainWords(r.name)
      expect(picker('main', 'breakfast', `  ${r.name.toUpperCase()}  `), r.name).toContain(r.name)
      expect(picker('main', 'breakfast', [...words].reverse().join(' ')), `${r.name} reversed`).toContain(r.name)
    }
  })
  it('with the plural of the last word ("boiled eggs", "idlis")', () => {
    for (const r of rows) {
      const words = plainWords(r.name)
      const last = words[words.length - 1]!
      if (!/^[a-z]{3,}$/.test(last) || last.endsWith('s')) continue
      expect(picker('main', 'lunch', [...words.slice(0, -1), `${last}s`].join(' ')), `${r.name} + s`).toContain(r.name)
    }
  })
  it('by any one word of its name', () => {
    for (const r of rows) for (const w of plainWords(r.name)) if (w.length >= 3) expect(picker('side', 'dinner', w), `${w} → ${r.name}`).toContain(r.name)
  })
  it('by the beginning of a word ("boil" finds boiled egg)', () => {
    expect(picker('main', 'breakfast', 'boil')).toContain('Boiled egg')
    expect(picker('main', 'breakfast', 'omel')).toContain('Omelette')
  })
})

describe('A3 · the usual other spellings', () => {
  const cases: [string, string][] = [
    ['idly', 'Idli'], ['idlis', 'Idli'], ['dosai', 'Dosa'], ['dhosa', 'Dosa'], ['biriyani', 'Chicken biryani'], ['briyani', 'Egg biryani'],
    ['chappathi', 'Chapati'], ['chapathi', 'Chapati'], ['parota', 'Parotta'], ['porotta', 'Parotta'], ['omlet', 'Omelette'], ['omelet', 'Omelette'],
    ['sambhar', 'Sambar'], ['yogurt', 'Curd'], ['curd', 'Curd rice'], ['puri', 'Poori'], ['uppuma', 'Upma'], ['kari', 'Chicken curry'], ['muttai', 'Boiled egg'],
    ['egg boil', 'Boiled egg'], ['toast', 'Bread toast'], ['bread omlet', 'Bread omelette'], ['oats', 'Oats porridge'], ['scrambled egg', 'Scrambled eggs'], ['half boil', 'Half-boiled egg'], ['half boiled', 'Half-boiled egg'], ['fruits', 'Fruit bowl'], ['sandwich', 'Veg sandwich'], ['noodles', 'Veg noodles'], ['fried rice', 'Egg fried rice'], ['milk', 'Milk'], ['juice', 'Fresh fruit juice'], ['sprouts', 'Sprouts salad'], ['soup', 'Tomato soup'], ['kanji', 'Rice kanji'], ['sevai', 'Lemon sevai'], ['cornflakes', 'Cornflakes with milk'], ['eggs boiled', 'Boiled egg'], ['boiled eggs', 'Boiled egg'], ['anda', 'Egg bhurji'], ['chatni', 'Coconut chutney'], ['tea', 'Masala chai'],
  ]
  for (const [typed, expected] of cases) {
    it(`"${typed}" finds ${expected}`, () => {
      expect(picker('main', 'breakfast', typed)).toContain(expected)
    })
  }
  it('something that is not a dish finds nothing', () => {
    expect(picker('main', 'breakfast', 'zzzz')).toEqual([])
    expect(picker('main', 'breakfast', 'unicorn steak')).toEqual([])
  })
})

describe('A4 · boiled egg for breakfast (the reported problem)', () => {
  it('is catalogued as an egg dish for breakfast, lunch and dinner that is both a main and a side (migration 0045)', () => {
    const e = rows.find((r) => r.name === 'Boiled egg')!
    expect(e.course).toBe('both')
    expect(e.diet).toBe('egg')
    expect(e.meal_types).toContain('breakfast')
  })
  it('is found by typing "boiled egg" when a MAIN dish is wanted for breakfast', () => {
    expect(picker('main', 'breakfast', 'boiled egg')).toContain('Boiled egg')
    expect(picker('main', 'breakfast', 'egg')).toContain('Boiled egg')
  })
  it('fits both pickers for breakfast, so no "usually a side" note is shown for it', () => {
    const d = dishes.find((x) => x.name === 'Boiled egg')!
    expect(pickerFit(d, 'main', 'breakfast')).toEqual({ course: true, meal: true })
    expect(pickerFit(d, 'side', 'breakfast')).toEqual({ course: true, meal: true })
  })
  it('is in the MAIN and the SIDE list for breakfast with nothing typed', () => {
    expect(picker('main', 'breakfast', '')).toContain('Boiled egg')
    expect(picker('side', 'breakfast', '')).toContain('Boiled egg')
  })
  it('a dish that is only a side (coconut chutney) is not in the main list, but typing its name or "include side dishes" finds it', () => {
    const d = dishes.find((x) => x.name === 'Coconut chutney')!
    expect(pickerFit(d, 'main', 'breakfast')).toEqual({ course: false, meal: true })
    expect(picker('main', 'breakfast', '')).not.toContain('Coconut chutney')
    expect(picker('main', 'breakfast', 'coconut chutney')).toContain('Coconut chutney')
    expect(picker('main', 'breakfast', '', {}, true)).toContain('Coconut chutney')
  })
  it('is found for a dinner main as well, and by the egg diet filter', () => {
    expect(picker('main', 'dinner', 'boiled egg')).toContain('Boiled egg')
    expect(picker('main', 'breakfast', 'egg', { diet: 'egg' })).toContain('Boiled egg')
  })
  it('the Dishes tab (no dish-type or meal limit) finds it', () => {
    const f: DishFilters = { ...DEFAULT_DISH_FILTERS, query: 'boiled egg' }
    expect(pickerMatches(dishes, f, { widenCourse: false, householdId: HOME, allergens: [], prefs: [] }).map((d) => d.name)).toContain('Boiled egg')
  })
  it('"egg" does not bring up "Veg kurma", and "ice" does not bring up rice dishes (words are matched from their start)', () => {
    const egg = picker('main', 'breakfast', 'egg')
    expect(egg).not.toContain('Veg kurma')
    expect(picker('main', 'lunch', 'ice')).not.toContain('Lemon rice')
  })
  it('every egg dish is findable for breakfast by typing "egg"', () => {
    const eggs = rows.filter((r) => /egg|omelette|bhurji/i.test(r.name)).map((r) => r.name)
    const found = picker('main', 'breakfast', 'egg')
    for (const n of eggs.filter((n) => /egg/i.test(n))) expect(found, n).toContain(n)
  })
})

describe('A5 · what the picker lists with nothing typed', () => {
  it('a main dish for each meal: only mains and "both" dishes cooked at that meal (snacks: any kind)', () => {
    for (const meal of MEALS) {
      const names = picker('main', meal, '')
      expect(names.length, meal).toBeGreaterThan(0)
      for (const n of names) {
        const r = rows.find((x) => x.name === n)!
        expect(r.meal_types, `${n} for ${meal}`).toContain(meal)
        if (meal !== 'snacks') expect(r.course, `${n} for ${meal}`).not.toBe('side')
      }
    }
  })
  it('a snack main lists the snacks people really plan (samosa, murukku, sundal) though they are catalogued as sides', () => {
    const names = picker('main', 'snacks', '')
    for (const n of ['Samosa', 'Murukku', 'Sundal', 'Masala chai']) expect(names, n).toContain(n)
  })
  it('a side dish for each meal: only sides and "both" dishes cooked at that meal', () => {
    for (const meal of MEALS) {
      const names = picker('side', meal, '')
      expect(names.length, meal).toBeGreaterThan(0)
      for (const n of names) {
        const r = rows.find((x) => x.name === n)!
        expect(r.meal_types, `${n} for ${meal}`).toContain(meal)
        expect(r.course, `${n} for ${meal}`).not.toBe('main')
      }
    }
  })
  it('"include side dishes" only adds dishes, never removes any', () => {
    for (const meal of MEALS) {
      const before = new Set(picker('main', meal, ''))
      const after = new Set(picker('main', meal, '', {}, true))
      for (const n of before) expect(after.has(n), n).toBe(true)
      expect(after.size).toBeGreaterThanOrEqual(before.size)
    }
  })
  it('every dish can be reached with nothing typed: in some meal list as a main or a side', () => {
    const reachable = new Set<string>()
    for (const meal of MEALS) for (const course of ['main', 'side'] as const) for (const n of picker(course, meal, '')) reachable.add(n)
    for (const meal of MEALS) for (const n of picker('main', meal, '', {}, true)) reachable.add(n)
    for (const r of rows) expect(reachable.has(r.name), `${r.name} is in no list`).toBe(true)
  })
})

describe('A6 · filters', () => {
  const all3 = (over: Partial<DishFilters>, widen = true) => picker('main', 'lunch', '', { mealType: 'any', ...over }, widen)
  it('veg, egg and non-veg filters split the catalogue exactly', () => {
    const veg = all3({ diet: 'veg' })
    const egg = all3({ diet: 'egg' })
    const non = all3({ diet: 'non_veg' })
    expect(veg.length + egg.length + non.length).toBe(rows.length)
    for (const n of egg) expect(rows.find((r) => r.name === n)!.diet).toBe('egg')
  })
  it('a search together with a diet filter shows only that diet (egg + "curry" is egg curry, not chicken curry)', () => {
    const names = picker('main', 'lunch', 'curry', { diet: 'egg' })
    expect(names).toContain('Egg curry')
    expect(names).not.toContain('Chicken curry')
  })
  it('each tag chip returns only dishes with that tag, and several chips need all of them', () => {
    for (const tag of ['low_carb', 'high_protein', 'light', 'low_oil', 'low_sugar', 'millet', 'fasting_food']) {
      const names = all3({ tags: [tag] })
      for (const n of names) expect(rows.find((r) => r.name === n)!.tags, `${n} / ${tag}`).toContain(tag)
    }
    expect(all3({ tags: ['low_carb', 'high_protein'] }).length).toBeLessThanOrEqual(all3({ tags: ['low_carb'] }).length)
  })
  it('"safe for everyone eating" leaves out dishes with the allergen, and egg-free / veg preferences leave out egg and meat', () => {
    const filters: DishFilters = { ...DEFAULT_DISH_FILTERS, safeOnly: true }
    const withAllergen = pickerMatches(dishes, filters, { widenCourse: true, householdId: HOME, allergens: ['egg'], prefs: [] })
    for (const d of withAllergen) expect(d.allergens).not.toContain('egg')
    const veg = pickerMatches(dishes, filters, { widenCourse: true, householdId: HOME, allergens: [], prefs: [{ profile_id: 'p1', diet: 'veg', no_onion_garlic: false, low_oil: false, low_salt: false, low_sugar: false }] })
    for (const d of veg) expect(d.diet).toBe('veg')
    const egg = pickerMatches(dishes, filters, { widenCourse: true, householdId: HOME, allergens: [], prefs: [{ profile_id: 'p1', diet: 'egg', no_onion_garlic: false, low_oil: false, low_salt: false, low_sugar: false }] })
    expect(egg.some((d) => d.diet === 'egg')).toBe(true)
    for (const d of egg) expect(d.diet).not.toBe('non_veg')
  })
  it('a meal filter on the Dishes tab returns exactly the dishes cooked at that meal', () => {
    for (const meal of MEALS) {
      const names = all3({ mealType: meal })
      expect(names.length).toBe(rows.filter((r) => r.meal_types.includes(meal)).length)
    }
  })
})

describe('A6b · filters from what people need, over every dish', () => {
  const base = { low_oil: false, low_salt: false, low_sugar: false, no_onion_garlic: false, diet: null as DietType | null, profile_id: 'p1' }
  const safe = (prefs: object[], allergens: string[] = []) =>
    pickerMatches(dishes, { ...DEFAULT_DISH_FILTERS, safeOnly: true }, { widenCourse: true, householdId: HOME, allergens, prefs: prefs as never })
  it('"no onion or garlic" removes every dish tagged onion_garlic and nothing else', () => {
    const names = safe([{ ...base, no_onion_garlic: true }]).map((d) => d.name)
    for (const r of rows) expect(names.includes(r.name), r.name).toBe(!r.tags.includes('onion_garlic'))
  })
  it('each allergen in the catalogue takes out exactly the dishes that carry it', () => {
    const allergens = [...new Set(rows.flatMap((r) => r.allergens))]
    expect(allergens.length).toBeGreaterThan(3)
    for (const a of allergens) {
      const names = safe([], [a]).map((d) => d.name)
      for (const r of rows) expect(names.includes(r.name), `${r.name} / ${a}`).toBe(!r.allergens.includes(a))
    }
  })
  it('everyone eating together: the strictest person decides (veg + egg allergy leaves only egg-free vegetarian dishes)', () => {
    const names = safe([{ ...base, diet: 'veg' }, { ...base, diet: 'egg' }], ['egg']).map((d) => d.name)
    for (const n of names) {
      const r = rows.find((x) => x.name === n)!
      expect(r.diet).toBe('veg')
      expect(r.allergens).not.toContain('egg')
    }
  })
  it('every diet plan has at least one dish for every meal (a diet plate is never left with nothing to offer)', () => {
    for (const plan of [...PLAN_KEYS, 'fasting_food'] as FitKey[]) {
      for (const meal of MEALS) {
        const n = rows.filter((r) => r.meal_types.includes(meal) && planFits(plan, r)).length
        expect(n, `${plan} / ${meal}`).toBeGreaterThan(0)
      }
    }
  })
})

describe('A7 · a typed search never needs the meal or dish-type limits', () => {
  it('finds the same dish whichever meal or kind of dish the picker was opened for', () => {
    for (const r of rows.slice(0, 120)) {
      const baseline = picker('main', 'breakfast', r.name)
      for (const meal of MEALS) for (const course of ['main', 'side'] as const) expect(picker(course, meal, r.name).sort()).toEqual([...baseline].sort())
    }
  })
  it('the dishes that fit the picker come before the others in the list order helper', () => {
    const d = dishes.find((x) => x.name === 'Coconut chutney')!
    const dosa = dishes.find((x) => x.name === 'Egg dosa')!
    const fit = (x: typeof d) => pickerFit(x, 'main', 'breakfast')
    expect(fit(dosa).course && fit(dosa).meal).toBe(true)
    expect(fit(d).course).toBe(false)
  })
})

describe('A8 · word matching in general', () => {
  it('an empty search matches everything and spaces alone are empty', () => {
    expect(matchesWords(['Idli'], '')).toBe(true)
    expect(matchesWords(['Idli'], '   ')).toBe(true)
  })
  it('keeps Tamil letters and vowel signs as typed', () => {
    expect(matchesWords(['Dosa', 'தோசை'], 'தோசை')).toBe(true)
    expect(matchesWords(['Dosa', 'தோசை'], 'தோ')).toBe(true)
    expect(matchesWords(['Dosa', 'தோசை'], 'இட்லி')).toBe(false)
  })
  it('ignores accents and apostrophes', () => {
    expect(matchesWords(['Amma’s kitchen'], 'ammas')).toBe(true)
    expect(matchesWords(['Crème brûlée'], 'creme brulee')).toBe(true)
  })
  it('matches the name it was saved under, whichever language the screen is in', () => {
    expect(dishMatchesQuery({ name: 'Boiled egg' }, [{ language: 'ta', name: 'வேகவைத்த முட்டை' }], 'boiled egg')).toBe(true)
    expect(dishMatchesQuery({ name: 'Boiled egg' }, [{ language: 'ta', name: 'வேகவைத்த முட்டை' }], 'முட்டை')).toBe(true)
  })
})

// ── B · shopping: every shared item by name, Tamil name and alias ──
const shop: CatalogItem[] = (shopItems as Record<string, unknown>[]).map((r) => ({
  key: r.id as string, source: 'common', id: r.id as string, name_en: r.name_en as string, name_ta: r.name_ta as string, aliases: r.aliases as string[],
  section: r.section as CatalogItem['section'], tab: r.browse_tab as CatalogItem['tab'], usual_amount: r.usual_amount as number, usual_unit: r.usual_unit as CatalogItem['usual_unit'],
  perishable: r.perishable as boolean, staple: r.staple as boolean, pack_sizes: r.pack_sizes as number[] | null, g_per_cup: r.g_per_cup as number | null, g_per_piece: r.g_per_piece as number | null, created_by: null,
}))

describe('B1 · every shopping item can be found by typing', () => {
  it('by its English name, its Tamil name and each alias', () => {
    for (const c of shop) {
      for (const n of [c.name_en, c.name_ta ?? '', ...c.aliases]) {
        if (n.trim().length < 2) continue
        expect(suggestItems(shop, n, 200).map((x) => x.key), `${n} → ${c.name_en}`).toContain(c.key)
      }
    }
  })
  it('by the first two letters', () => {
    for (const c of shop) expect(suggestItems(shop, c.name_en.slice(0, 2), 200).map((x) => x.key), c.name_en).toContain(c.key)
  })
  it('has no two items with the same name', () => {
    const seen = new Set<string>()
    for (const c of shop) {
      expect(seen.has(c.name_en.toLowerCase()), c.name_en).toBe(false)
      seen.add(c.name_en.toLowerCase())
    }
  })
  it('puts the best match first: "onion" gives Onion before anything that merely contains it', () => {
    expect(suggestItems(shop, 'onion', 5)[0]!.name_en.toLowerCase()).toBe('onion')
  })
})

// ── C · My extras: every everyday food ──
type FoodRow = { id: string; name_en: string; name_ta: string }
const foods: FoodOption[] = (catalogue.commonFoods as unknown as FoodRow[]).map((f) => ({
  key: `common:${f.id}`, source: { kind: 'common', id: f.id }, name_en: f.name_en, name_ta: f.name_ta, category: null, unit: 'piece', usual: 1, per: {} as FoodOption['per'],
}))

describe('C1 · every everyday food can be found by typing', () => {
  it('by its English and Tamil name', () => {
    for (const f of foods) {
      expect(searchFoods(foods, f.name_en).map((x) => x.key), f.name_en).toContain(f.key)
      expect(searchFoods(foods, f.name_ta ?? '').map((x) => x.key), f.name_ta ?? '').toContain(f.key)
    }
  })
  it('boiled egg, omelette and egg white are all there, and "egg" finds the three', () => {
    const names = searchFoods(foods, 'egg').map((x) => x.name_en)
    expect(names.some((n) => /boiled egg/i.test(n))).toBe(true)
    expect(names.some((n) => /omelette/i.test(n))).toBe(true)
    expect(names.some((n) => /egg white/i.test(n))).toBe(true)
  })
  it('in capitals, plural and in the other order', () => {
    expect(searchFoods(foods, 'BOILED EGGS').map((x) => x.name_en)).toContain('Boiled egg')
    expect(searchFoods(foods, 'egg boiled').map((x) => x.name_en)).toContain('Boiled egg')
  })
  it('names that start with the typed words come first', () => {
    expect(searchFoods(foods, 'boiled')[0]!.name_en.toLowerCase().startsWith('boiled')).toBe(true)
  })
})
