// Pure helpers for editing a home's own copy of a recipe: the editable draft, how quantities are typed, and the checks that mirror the
// database's rules (migration 0011 and 0025), so mistakes are caught before saving. Framework-free, so unit-tested without a database.
import type { RecipeRow, RecipeUnit } from './recipes'

export const RECIPE_UNITS: RecipeUnit[] = ['cup', 'tbsp', 'tsp', 'g', 'ml', 'kg', 'piece', 'sprig', 'pinch', 'clove', 'inch', 'bunch', 'handful', 'slice', 'to_taste', 'as_needed']
export const UNMEASURED: RecipeUnit[] = ['to_taste', 'as_needed']

export type IngredientDraft = { key: string; name: string; name_ta: string; quantity: string; unit: RecipeUnit }
export type StepDraft = { key: string; body: string; body_ta: string }
export type RecipeDraft = { servings: number; prep: string; cook: string; note: string; note_ta: string; ingredients: IngredientDraft[]; steps: StepDraft[] }

let counter = 0
export const newKey = () => `k${++counter}`

export const emptyIngredient = (): IngredientDraft => ({ key: newKey(), name: '', name_ta: '', quantity: '', unit: 'cup' })
export const emptyStep = (): StepDraft => ({ key: newKey(), body: '', body_ta: '' })

const FRACTION_CHARS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 }

/** What a person types for an amount: "2", "1.5", "1/2", "1 1/2", "1½", "½". Empty gives null; anything else that is not a positive number gives NaN. */
export function parseQuantity(text: string): number | null {
  const s = text.trim().replace(',', '.')
  if (s === '') return null
  let value: number
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) value = Number(m[1]) + Number(m[2]) / Number(m[3])
  else if ((m = s.match(/^(\d+)\/(\d+)$/))) value = Number(m[1]) / Number(m[2])
  else if ((m = s.match(/^(\d*)\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/))) value = Number(m[1] || 0) + FRACTION_CHARS[m[2]!]!
  else if (/^\d+(\.\d+)?$/.test(s)) value = Number(s)
  else return NaN
  if (!Number.isFinite(value) || value <= 0) return NaN
  return Math.round(value * 1000) / 1000
}

/** An amount written back into the box for editing (plain decimals, no trailing zeros). */
export function quantityToInput(q: number | null): string {
  return q === null ? '' : String(Math.round(q * 1000) / 1000)
}

export function draftFromRecipe(r: RecipeRow | null | undefined, defaultServings = 4): RecipeDraft {
  if (!r) return { servings: defaultServings, prep: '', cook: '', note: '', note_ta: '', ingredients: [emptyIngredient()], steps: [emptyStep()] }
  return {
    servings: r.servings,
    prep: r.prep_minutes === null ? '' : String(r.prep_minutes),
    cook: r.cook_minutes === null ? '' : String(r.cook_minutes),
    note: r.note ?? '',
    note_ta: r.note_ta ?? '',
    ingredients: r.recipe_ingredients.map((i) => ({ key: newKey(), name: i.name, name_ta: i.name_ta ?? '', quantity: quantityToInput(i.quantity), unit: i.unit })),
    steps: r.recipe_steps.map((s) => ({ key: newKey(), body: s.body, body_ta: s.body_ta ?? '' })),
  }
}

export type DraftProblems = {
  servings: boolean
  minutes: boolean
  noIngredients: boolean
  noSteps: boolean
  /** Ingredient rows (by key) with a missing / too long name, or a missing / invalid amount. */
  ingredientName: Set<string>
  ingredientQuantity: Set<string>
  step: Set<string>
  any: boolean
}

const MAX_QUANTITY = 99_999
const minutesOk = (s: string) => s.trim() === '' || (/^\d+$/.test(s.trim()) && Number(s) <= 600)

export function validateDraft(d: RecipeDraft): DraftProblems {
  const ingredientName = new Set<string>()
  const ingredientQuantity = new Set<string>()
  const step = new Set<string>()
  for (const i of d.ingredients) {
    const name = (i.name.trim() || i.name_ta.trim()).trim()
    if (name.length < 1 || name.length > 80 || i.name.trim().length > 80 || i.name_ta.trim().length > 80) ingredientName.add(i.key)
    if (!UNMEASURED.includes(i.unit)) {
      const q = parseQuantity(i.quantity)
      if (q === null || Number.isNaN(q) || q > MAX_QUANTITY) ingredientQuantity.add(i.key)
    }
  }
  for (const s of d.steps) {
    const body = s.body.trim() || s.body_ta.trim()
    if (body.length < 1 || s.body.trim().length > 600 || s.body_ta.trim().length > 600) step.add(s.key)
  }
  const problems: DraftProblems = {
    servings: !Number.isInteger(d.servings) || d.servings < 1 || d.servings > 50,
    minutes: !minutesOk(d.prep) || !minutesOk(d.cook),
    noIngredients: d.ingredients.length === 0,
    noSteps: d.steps.length === 0,
    ingredientName,
    ingredientQuantity,
    step,
    any: false,
  }
  problems.any = problems.servings || problems.minutes || problems.noIngredients || problems.noSteps || ingredientName.size > 0 || ingredientQuantity.size > 0 || step.size > 0
  return problems
}

/** What the save function takes. A name or step written in only one language is kept in both fields, so every screen can show it. */
export function toPayload(d: RecipeDraft) {
  return {
    servings: d.servings,
    prep: d.prep.trim() === '' ? null : Number(d.prep),
    cook: d.cook.trim() === '' ? null : Number(d.cook),
    note: d.note.trim() || null,
    note_ta: d.note_ta.trim() || null,
    ingredients: d.ingredients.map((i) => ({
      name: i.name.trim() || i.name_ta.trim(),
      name_ta: i.name_ta.trim() || null,
      quantity: UNMEASURED.includes(i.unit) ? null : parseQuantity(i.quantity),
      unit: i.unit,
    })),
    steps: d.steps.map((s) => ({ body: s.body.trim() || s.body_ta.trim(), body_ta: s.body_ta.trim() || null })),
  }
}

/** Moves the item at `index` up (-1) or down (+1); out-of-range moves leave the list as it was. */
export function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const to = index + delta
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(to, 0, item!)
  return next
}
