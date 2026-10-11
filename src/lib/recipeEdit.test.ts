import { describe, expect, it } from 'vitest'
import { draftFromRecipe, emptyIngredient, emptyStep, moveItem, parseQuantity, quantityToInput, toPayload, validateDraft, type RecipeDraft } from './recipeEdit'
import type { RecipeRow } from './recipes'

describe('parseQuantity', () => {
  it('reads decimals, fractions and mixed numbers', () => {
    expect(parseQuantity('2')).toBe(2)
    expect(parseQuantity('1.5')).toBe(1.5)
    expect(parseQuantity('1,5')).toBe(1.5)
    expect(parseQuantity('1/2')).toBe(0.5)
    expect(parseQuantity('1 1/2')).toBe(1.5)
    expect(parseQuantity('1½')).toBe(1.5)
    expect(parseQuantity('½')).toBe(0.5)
    expect(parseQuantity('3/4')).toBe(0.75)
    expect(parseQuantity('1/3')).toBe(0.333)
  })
  it('gives null for an empty box and NaN for nonsense or zero', () => {
    expect(parseQuantity('')).toBeNull()
    expect(parseQuantity('  ')).toBeNull()
    expect(parseQuantity('abc')).toBeNaN()
    expect(parseQuantity('0')).toBeNaN()
    expect(parseQuantity('-2')).toBeNaN()
    expect(parseQuantity('1/0')).toBeNaN()
  })
  it('writes an amount back without trailing zeros', () => {
    expect(quantityToInput(2)).toBe('2')
    expect(quantityToInput(0.125)).toBe('0.125')
    expect(quantityToInput(null)).toBe('')
  })
})

const recipe: RecipeRow = {
  id: 'r', dish_id: 'd', household_id: null, servings: 4, prep_minutes: 20, cook_minutes: null, credit: null, note: 'Serve hot.', note_ta: null,
  recipe_ingredients: [
    { position: 1, name: 'Rice', name_ta: 'அரிசி', quantity: 2, unit: 'cup' },
    { position: 2, name: 'Salt', name_ta: null, quantity: null, unit: 'to_taste' },
  ],
  recipe_steps: [{ position: 1, body: 'Soak.', body_ta: null }, { position: 2, body: 'Steam.', body_ta: 'ஆவியில் வேகவை.' }],
}

describe('draftFromRecipe / toPayload', () => {
  it('turns a recipe into an editable draft and back without changing it', () => {
    const draft = draftFromRecipe(recipe)
    expect(draft.servings).toBe(4)
    expect(draft.prep).toBe('20')
    expect(draft.cook).toBe('')
    expect(draft.ingredients.map((i) => [i.name, i.name_ta, i.quantity, i.unit])).toEqual([['Rice', 'அரிசி', '2', 'cup'], ['Salt', '', '', 'to_taste']])
    expect(toPayload(draft)).toEqual({
      servings: 4, prep: 20, cook: null, note: 'Serve hot.', note_ta: null,
      ingredients: [{ name: 'Rice', name_ta: 'அரிசி', quantity: 2, unit: 'cup' }, { name: 'Salt', name_ta: null, quantity: null, unit: 'to_taste' }],
      steps: [{ body: 'Soak.', body_ta: null }, { body: 'Steam.', body_ta: 'ஆவியில் வேகவை.' }],
    })
  })
  it('starts a new recipe with one empty ingredient and step', () => {
    const d = draftFromRecipe(null, 5)
    expect(d.servings).toBe(5)
    expect(d.ingredients).toHaveLength(1)
    expect(d.steps).toHaveLength(1)
  })
  it('keeps a name or step typed in only one language usable in both fields', () => {
    const d = draftFromRecipe(null)
    d.ingredients = [{ ...emptyIngredient(), name_ta: 'உப்பு', unit: 'to_taste' }]
    d.steps = [{ ...emptyStep(), body_ta: 'கலக்கவும்.' }]
    const p = toPayload(d)
    expect(p.ingredients[0]).toEqual({ name: 'உப்பு', name_ta: 'உப்பு', quantity: null, unit: 'to_taste' })
    expect(p.steps[0]).toEqual({ body: 'கலக்கவும்.', body_ta: 'கலக்கவும்.' })
  })
  it('ignores a typed amount for "to taste" and "as needed"', () => {
    const d = draftFromRecipe(recipe)
    d.ingredients[1]!.quantity = '3'
    expect(toPayload(d).ingredients[1]!.quantity).toBeNull()
  })
})

describe('validateDraft', () => {
  const good = (): RecipeDraft => draftFromRecipe(recipe)

  it('accepts the draft of a good recipe', () => {
    expect(validateDraft(good()).any).toBe(false)
  })
  it('wants a name, an amount for measured ingredients, and text in every step', () => {
    const d = good()
    d.ingredients.push({ ...emptyIngredient(), name: '', quantity: '' }, { ...emptyIngredient(), name: 'Ghee', quantity: 'lots', unit: 'tbsp' })
    d.steps.push(emptyStep())
    const p = validateDraft(d)
    expect(p.any).toBe(true)
    expect(p.ingredientName.size).toBe(1)
    expect(p.ingredientQuantity.size).toBe(2)
    expect(p.step.size).toBe(1)
  })
  it('needs at least one ingredient and one step, and sensible servings and minutes', () => {
    const d = good()
    d.ingredients = []
    d.steps = []
    d.servings = 0
    d.prep = '9999'
    const p = validateDraft(d)
    expect(p).toMatchObject({ noIngredients: true, noSteps: true, servings: true, minutes: true })
  })
  it('refuses names and steps longer than the database allows', () => {
    const d = good()
    d.ingredients[0]!.name = 'x'.repeat(81)
    d.steps[0]!.body = 'y'.repeat(601)
    const p = validateDraft(d)
    expect(p.ingredientName.size).toBe(1)
    expect(p.step.size).toBe(1)
  })
})

describe('moveItem', () => {
  it('moves up and down, and stays put at the ends', () => {
    expect(moveItem([1, 2, 3], 1, -1)).toEqual([2, 1, 3])
    expect(moveItem([1, 2, 3], 1, 1)).toEqual([1, 3, 2])
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
    expect(moveItem([1, 2, 3], 2, 1)).toEqual([1, 2, 3])
  })
})
