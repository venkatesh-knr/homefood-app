// "From this week's meals": turns the recipes of planned home meals into a shopping list. Pure logic, no network.
// The recipes speak in cups, spoons and pieces; the list never does: everything is worked out in g, ml, pieces or bunches behind the scenes and
// shown in g, kg, ml, L, pcs, bunch or pack.
//   * Perishables (vegetables, fruit, greens, milk, curd, paneer, eggs, meat, fish, bread) are calculated from the recipes, scaled to who is
//     eating, added up over all the dishes and rounded UP to 50 g, 100 ml or whole pieces / bunches. They are shown as "about".
//   * Everything else is not calculated exactly: the app suggests the smallest usual pack that covers the need (an item can have its own
//     packs: oil is 1 L or 5 L). Something that cannot be converted counts as one smallest pack.
//   * Staples (salt, oil, spices, curry leaves...) are kept apart, unticked, under "Usually at home".
import { addDays, toISODate, weekStartOf } from './planner'
import { canon, catalogIndex, findExisting, tidy, tidyOrNull, type CatalogItem, type ShopItem, type ShopSection, type ShopUnit } from './shopping'
import { SECTIONS } from './shopping'
import type { RecipeUnit } from './recipes'
import { eatingTotal, familyHeadcount } from './plates'

// ── Which meals, and who is eating ──
export type PlanRange = 'week' | 'next7'

/** "Rest of this week" = tomorrow to the end of the week; "Next 7 days" = tomorrow and the six days after. Empty when tomorrow is already next week. */
export function planRange(kind: PlanRange, today: string, weekStartsOn: number): { from: string; to: string; empty: boolean } {
  const from = addDays(today, 1)
  const weekEnd = addDays(toISODate(weekStartOf(new Date(`${today}T00:00:00`), weekStartsOn)), 6)
  const to = kind === 'next7' ? addDays(from, 6) : weekEnd
  return { from, to, empty: from > to }
}

export type PlanDish = { id: string; name_en: string; name_ta: string | null }
/** One main or side dish of one home meal, with how many people eat that meal. */
export type PlanMeal = { slotId: string; dish: PlanDish; people: number }

type DishRef = { id: string; name: string; dish_names: { language: string; name: string }[] }
type SlotLike = {
  id: string
  source: string
  main_dish: DishRef | null
  meal_slot_sides: { position: number; is_leftover?: boolean; dish: DishRef }[]
  meal_slot_eaters: { profile_id: string }[]
  /** Diet plates: their own dishes are cooked for the people on them, and the family meal for the others. */
  plates?: { main_dish: DishRef | null; sides: { position: number; dish: DishRef }[]; shared_sides: number[]; eater_ids: string[] }[]
  /** Fasting: people who skip this meal are not cooked for. */
  fasting?: { skip: string[]; foods: string[] }
}

const dishOf = (d: { id: string; name: string; dish_names: { language: string; name: string }[] }): PlanDish => ({
  id: d.id, name_en: d.dish_names.find((n) => n.language === 'en')?.name ?? d.name, name_ta: d.dish_names.find((n) => n.language === 'ta')?.name ?? null,
})

/** The home-cooked meals of a range as dishes with head counts. Dine-out and order-in meals need no shopping. Who is eating comes from the
 * meal's own list (the helper is never on it); a meal with no list uses the number of family members. */
export function mealsFromSlots(slots: SlotLike[], familyCount: number): PlanMeal[] {
  const out: PlanMeal[] = []
  for (const s of slots) {
    if (s.source !== 'home') continue
    const total = eatingTotal(s, familyCount)
    if (total <= 0) continue
    // the people on a diet plate eat the plate: the family meal is cooked for the rest, and a shared side for everyone
    const plates = s.plates ?? []
    const skip = new Set(s.fasting?.skip ?? [])
    const people = familyHeadcount(s, familyCount)
    const shared = new Set(plates.flatMap((p) => p.shared_sides))
    if (s.main_dish && people > 0) out.push({ slotId: s.id, dish: dishOf(s.main_dish), people })
    // a leftover is not cooked again, so it needs nothing from the shop
    for (const side of [...s.meal_slot_sides].filter((x) => !x.is_leftover).sort((a, b) => a.position - b.position)) {
      const n = shared.has(side.position) ? total : people
      if (n > 0) out.push({ slotId: s.id, dish: dishOf(side.dish), people: n })
    }
    for (const p of plates) {
      const n = p.eater_ids.filter((id) => !skip.has(id)).length
      if (n === 0) continue
      if (p.main_dish) out.push({ slotId: s.id, dish: dishOf(p.main_dish), people: n })
      for (const side of [...p.sides].sort((a, b) => a.position - b.position)) out.push({ slotId: s.id, dish: dishOf(side.dish), people: n })
    }
  }
  return out
}

// ── Matching a recipe ingredient to a shop item (mirrors ingredient_candidates in scripts/gen-shop-items.py) ──
const LEADING = new Set(['cooked', 'cooled', 'thick', 'thin', 'sour', 'fresh', 'cold', 'hot', 'warm', 'boiled', 'roasted', 'chopped', 'grated', 'sliced', 'mashed', 'finely', 'ripe', 'dry', 'dried', 'whole'])
const IGNORED = new Set(['water', 'cold water', 'hot water', 'warm water', 'ice cube', 'ice', 'cooked rice', 'cooled cooked rice', 'water for grinding', 'water for soaking'].map(canon))

/** The spellings tried, in order, when matching a recipe ingredient name to a shop item: "Onion, chopped" tries "onion"; "Oil for frying" tries "oil". */
export function ingredientCandidates(name: string): string[] {
  const t = name.toLowerCase().replace(/\([^)]*\)/g, ' ')
  const head = t.split(',')[0]!.trim()
  const out = [canon(name), canon(head)]
  if (head.includes(' for ')) out.push(canon(head.split(' for ')[0]!))
  let words = head.split(/\s+/).filter(Boolean)
  while (words.length > 0 && LEADING.has(words[0]!)) {
    words = words.slice(1)
    out.push(canon(words.join(' ')))
  }
  for (const sep of [' and ', ' or ', ' & ', ' + ']) {
    if (!head.includes(sep)) continue
    let w = head.split(sep)[0]!.split(/\s+/).filter(Boolean)
    out.push(canon(w.join(' ')))
    while (w.length > 0 && LEADING.has(w[0]!)) {
      w = w.slice(1)
      out.push(canon(w.join(' ')))
    }
  }
  return [...new Set(out.filter(Boolean))]
}

/** The shop item for a recipe ingredient, 'ignore' for water and the like, or undefined when nothing matches. */
export function matchIngredient(index: Map<string, CatalogItem>, name: string): CatalogItem | 'ignore' | undefined {
  const cands = ingredientCandidates(name)
  if (cands.slice(0, 2).some((c) => IGNORED.has(c))) return 'ignore'
  for (const c of cands) {
    const hit = index.get(c)
    if (hit) return hit
  }
  return undefined
}

// ── Quantities ──
type Base = 'g' | 'ml' | 'pcs' | 'bunch' | 'pack'
const baseOf = (item: CatalogItem): Base => (item.usual_unit === 'kg' || item.usual_unit === 'g' ? 'g' : item.usual_unit === 'L' || item.usual_unit === 'ml' ? 'ml' : item.usual_unit)

const CUP_ML = 240
/** "To taste" / "as needed": a tiny amount, so the item is still listed (and perishables round up to the smallest step). */
const TINY: Record<Base, number> = { g: 1, ml: 1, pcs: 0.25, bunch: 0.25, pack: 0 }
const DEFAULT_CUP_G = 150 // a cup of chopped vegetables, when the item has no weight of its own

/** What one recipe line needs, in the item's base unit (g, ml, pieces or bunches); null when it cannot be converted sensibly. */
export function needFor(item: CatalogItem, quantity: number | null, unit: RecipeUnit): number | null {
  const base = baseOf(item)
  if (quantity === null) return base === 'pack' ? null : TINY[base]
  if (base === 'pack') return null
  const gpc = item.g_per_cup ?? (item.perishable ? DEFAULT_CUP_G : null)
  const cups = unit === 'cup' ? quantity : unit === 'tbsp' ? quantity / 16 : unit === 'tsp' ? quantity / 48 : null
  if (cups !== null) {
    if (base === 'ml') return cups * CUP_ML
    if (base === 'g') return gpc ? cups * gpc : null
    if (base === 'pcs') return gpc && item.g_per_piece ? (cups * gpc) / item.g_per_piece : null
    return null
  }
  switch (unit) {
    case 'g':
    case 'ml':
      if (base === 'g' || base === 'ml') return quantity
      return base === 'pcs' && item.g_per_piece ? quantity / item.g_per_piece : null
    case 'kg':
      return base === 'g' || base === 'ml' ? quantity * 1000 : null
    case 'piece':
    case 'slice':
      if (base === 'pcs') return quantity
      return base === 'g' && item.g_per_piece ? quantity * item.g_per_piece : null
    case 'clove':
      return base === 'g' ? quantity * (item.g_per_piece ?? 4) : base === 'pcs' ? quantity / 10 : null
    case 'inch':
      return base === 'g' ? quantity * 7 : null
    case 'handful':
      return base === 'g' ? quantity * 30 : base === 'bunch' ? quantity * 0.25 : null
    case 'sprig':
      return base === 'bunch' ? quantity / 20 : base === 'g' ? quantity * 0.5 : null
    case 'pinch':
      return base === 'g' ? quantity * 0.3 : TINY[base]
    case 'bunch':
      return base === 'bunch' ? quantity : null
    default:
      return null
  }
}

const WEIGHT_PACKS = [100, 200, 250, 500, 1000, 2000, 5000]
const LIQUID_PACKS = [200, 500, 1000, 2000, 5000]
const ceilTo = (n: number, step: number) => Math.ceil(n / step - 1e-9) * step
const round2 = (n: number) => Math.round(n * 100) / 100

/** A weight in grams / volume in ml as a shop amount: below 1000 in g / ml, from 1000 up in kg / L. */
export function shopAmount(base: 'g' | 'ml', n: number): { amount: number; unit: ShopUnit } {
  if (n >= 1000) return { amount: round2(n / 1000), unit: base === 'g' ? 'kg' : 'L' }
  return { amount: n, unit: base }
}

/** The amount to put on the list for a total need (in the item's base unit). Perishables: rounded up to 50 g / 100 ml / whole pieces or bunches.
 * Others: the smallest pack that covers it (above the largest pack, whole kg or L). `need` 0 or unknown counts as the smallest step or pack. */
export function roundNeed(item: CatalogItem, need: number): { amount: number; unit: ShopUnit; approx: boolean } {
  const base = baseOf(item)
  if (base === 'pack') return { amount: 1, unit: 'pack', approx: false }
  if (base === 'pcs' || base === 'bunch') return { amount: Math.max(1, Math.ceil(need - 1e-9)), unit: base, approx: item.perishable }
  if (item.perishable) {
    const step = base === 'g' ? 50 : 100
    return { ...shopAmount(base, Math.max(step, ceilTo(need, step))), approx: true }
  }
  const packs = item.pack_sizes && item.pack_sizes.length > 0 ? [...item.pack_sizes].sort((a, b) => a - b) : base === 'g' ? WEIGHT_PACKS : LIQUID_PACKS
  const fit = packs.find((p) => p >= need - 1e-9)
  return { ...shopAmount(base, fit ?? ceilTo(need, 1000)), approx: false }
}

// ── The whole calculation ──
export type PlanIngredient = { name: string; quantity: number | null; unit: RecipeUnit }
export type PlanRecipe = { servings: number; ingredients: PlanIngredient[] }

export type PlanLine = {
  key: string
  item: CatalogItem
  amount: number
  unit: ShopUnit
  approx: boolean
  dishes: string[]
}
export type PlanUnmatched = { name: string; dishes: string[] }
export type PlanResult = { lines: PlanLine[]; staples: PlanLine[]; unmatched: PlanUnmatched[]; mealCount: number }

type Acc = { item: CatalogItem; need: number; dishes: Set<string> }

/** Works out the shopping for these meals. `recipes` is keyed by dish id (a home's own version of a recipe wins before it gets here). */
export function planShopping(meals: PlanMeal[], recipes: Map<string, PlanRecipe>, catalog: CatalogItem[], lang: 'en' | 'ta'): PlanResult {
  const index = catalogIndex(catalog)
  const acc = new Map<string, Acc>()
  const unmatched = new Map<string, Set<string>>()
  const slotsWithRecipes = new Set<string>()

  for (const meal of meals) {
    const recipe = recipes.get(meal.dish.id)
    if (!recipe || recipe.servings <= 0) continue
    slotsWithRecipes.add(meal.slotId)
    const factor = meal.people / recipe.servings
    const dishName = lang === 'ta' && meal.dish.name_ta ? meal.dish.name_ta : meal.dish.name_en
    for (const ing of recipe.ingredients) {
      const hit = matchIngredient(index, ing.name)
      if (hit === 'ignore') continue
      if (!hit) {
        const label = ing.name.split(',')[0]!.trim()
        unmatched.set(label, (unmatched.get(label) ?? new Set()).add(dishName))
        continue
      }
      const a = acc.get(hit.key) ?? { item: hit, need: 0, dishes: new Set<string>() }
      const need = needFor(hit, ing.quantity === null ? null : ing.quantity * factor, ing.unit)
      if (need !== null) a.need += need
      a.dishes.add(dishName)
      acc.set(hit.key, a)
    }
  }

  const order = (s: ShopSection) => SECTIONS.indexOf(s)
  const all: PlanLine[] = [...acc.values()].map((a) => {
    const r = roundNeed(a.item, a.need)
    return { key: a.item.key, item: a.item, amount: r.amount, unit: r.unit, approx: r.approx, dishes: [...a.dishes] }
  })
  const byName = (x: PlanLine, y: PlanLine) => order(x.item.section) - order(y.item.section) || x.item.name_en.localeCompare(y.item.name_en)
  return {
    lines: all.filter((l) => !l.item.staple).sort(byName),
    staples: all.filter((l) => l.item.staple).sort(byName),
    unmatched: [...unmatched.entries()].map(([name, dishes]) => ({ name, dishes: [...dishes] })).sort((a, b) => b.dishes.length - a.dishes.length || a.name.localeCompare(b.name)),
    mealCount: slotsWithRecipes.size,
  }
}

// ── Adding to the list ──
type Family = 'g' | 'ml' | 'pcs' | 'bunch' | 'pack'
const familyOf = (unit: ShopUnit): Family => (unit === 'kg' || unit === 'g' ? 'g' : unit === 'L' || unit === 'ml' ? 'ml' : unit)
const inBase = (amount: number, unit: ShopUnit) => (unit === 'kg' || unit === 'L' ? amount * 1000 : amount)

/** An item already on the list plus an amount from the plan: added together when both are the same kind (weight, volume, pieces...), otherwise
 * the amount already on the list stays. An item with no amount takes the new one. */
export function addAmounts(existing: { amount: number | null; unit: ShopUnit | null }, add: { amount: number; unit: ShopUnit }): { amount: number; unit: ShopUnit } | null {
  if (existing.amount === null || existing.unit === null) return add
  const f = familyOf(existing.unit)
  if (f !== familyOf(add.unit)) return null
  const sum = inBase(existing.amount, existing.unit) + inBase(add.amount, add.unit)
  return f === 'g' || f === 'ml' ? shopAmount(f, sum) : { amount: round2(sum), unit: add.unit }
}

export type PlanPick = { name: string; name_ta: string | null; section: ShopSection; amount: number | null; unit: ShopUnit | null; dishes: string[] }
export type PlanRow = { household_id: string; name: string; name_ta: string | null; section: ShopSection; amount: number | null; unit: ShopUnit | null; source: 'plan'; source_dishes: string[]; added_by: string }
export type PlanUpdate = { id: string; patch: { amount?: number | null; unit?: ShopUnit | null; source: 'plan'; source_dishes: string[]; bought_at?: null; bought_by?: null } }

/** The inserts and updates that put the ticked lines on the list. A name already on the list is merged (amounts added, dishes joined, source "plan");
 * a ticked-off or sleeping one comes back with the new amount. */
export function mergePlanIntoList(existing: ShopItem[], picks: PlanPick[], householdId: string, profileId: string): { inserts: PlanRow[]; updates: PlanUpdate[] } {
  const inserts: PlanRow[] = []
  const updates: PlanUpdate[] = []
  for (const p of picks) {
    const ex = findExisting(existing, p.name)
    if (!ex) {
      inserts.push({ household_id: householdId, name: p.name, name_ta: p.name_ta, section: p.section, ...tidyOrNull(p.amount, p.unit), source: 'plan', source_dishes: p.dishes, added_by: profileId })
      continue
    }
    const dishes = [...new Set([...(ex.bought_at === null ? ex.source_dishes : []), ...p.dishes])]
    if (ex.bought_at !== null) {
      updates.push({ id: ex.id, patch: { ...tidyOrNull(p.amount, p.unit), source: 'plan', source_dishes: dishes, bought_at: null, bought_by: null } })
      continue
    }
    const sum = p.amount === null || p.unit === null ? null : addAmounts(ex, { amount: p.amount, unit: p.unit })
    updates.push({ id: ex.id, patch: { ...(sum ? tidy(sum.amount, sum.unit) : {}), source: 'plan', source_dishes: dishes } })
  }
  return { inserts, updates }
}

/** Items still to buy that are needed for the given dishes (by name in either language): "drumstick needed tomorrow" on the Today card. */
export function neededFor(items: ShopItem[], dishNames: string[]): ShopItem[] {
  const wanted = new Set(dishNames.map(canon))
  return items.filter((i) => i.bought_at === null && i.source === 'plan' && i.source_dishes.some((d) => wanted.has(canon(d))))
}
