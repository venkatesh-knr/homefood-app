// Pure helpers for recipes: scaling quantities to the people eating and writing them the way a cook reads them
// (1¼ cup, ¾ tbsp, 250 g). Framework-free so they're unit-tested without a database.

export type RecipeUnit =
  | 'cup' | 'tbsp' | 'tsp' | 'g' | 'ml' | 'kg' | 'piece' | 'sprig' | 'pinch' | 'clove' | 'inch' | 'bunch' | 'handful' | 'slice'
  | 'to_taste' | 'as_needed'

export type IngredientRow = { position: number; name: string; name_ta: string | null; quantity: number | null; unit: RecipeUnit }
export type StepRow = { position: number; body: string; body_ta: string | null }
export type RecipeRow = {
  id: string
  dish_id: string
  household_id: string | null
  servings: number
  prep_minutes: number | null
  cook_minutes: number | null
  credit: string | null
  note: string | null
  note_ta: string | null
  recipe_ingredients: IngredientRow[]
  recipe_steps: StepRow[]
}

export const MIN_SERVINGS = 1
export const MAX_SERVINGS = 30

export function clampServings(n: number): number {
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(n)))
}

/** Quantity written for `base` people, rewritten for `servings` people. */
export function scaleQuantity(quantity: number, base: number, servings: number): number {
  return (quantity * servings) / base
}

const FRACTIONS: Record<number, string> = { 0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞' }
const WEIGHT_UNITS = new Set(['g', 'ml', 'kg'])
const COUNT_UNITS = new Set(['piece', 'sprig', 'pinch', 'clove', 'slice', 'handful', 'bunch'])

function withFraction(value: number, step: number): string {
  const rounded = Math.round(value / step) * step
  const whole = Math.floor(rounded + 1e-9)
  const frac = Math.round((rounded - whole) * 1000) / 1000
  const fracText = frac > 0 ? (FRACTIONS[frac] ?? '') : ''
  if (whole === 0) return fracText || '0'
  return `${whole}${fracText}`
}

/** "1¼", "¾", "250", "13" — rounded to something a person would actually measure. */
export function formatQuantity(value: number, unit: RecipeUnit): string {
  if (WEIGHT_UNITS.has(unit)) {
    if (unit === 'kg') return String(Math.round(value * 100) / 100)
    return String(value >= 100 ? Math.round(value / 5) * 5 : Math.max(1, Math.round(value)))
  }
  if (COUNT_UNITS.has(unit)) return withFraction(Math.max(0.5, value), 0.5)
  return withFraction(Math.max(0.125, value), value < 1 ? 0.125 : 0.25)
}

/** True when the unit reads as plural for this quantity ("1 cup" but "1¼ cups" — anything over 1). */
export function isPlural(value: number): boolean {
  return value > 1.0001
}
