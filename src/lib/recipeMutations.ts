import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { toPayload, type RecipeDraft } from './recipeEdit'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function refresh(dishId: string) {
  await queryClient.invalidateQueries({ queryKey: ['recipe', dishId] })
  await queryClient.invalidateQueries({ queryKey: ['recipe-dish-ids'] })
}

/** Saves the home's own copy of a recipe in one go (Admin). All or nothing: see migration 0025. */
export async function saveHouseholdRecipe(dishId: string, draft: RecipeDraft): Promise<void> {
  const p = toPayload(draft)
  const { error } = await client().rpc('save_household_recipe', {
    p_dish: dishId,
    p_servings: p.servings,
    p_prep: p.prep,
    p_cook: p.cook,
    p_note: p.note,
    p_note_ta: p.note_ta,
    p_ingredients: p.ingredients,
    p_steps: p.steps,
  })
  if (error) throw error
  await refresh(dishId)
}

/** "Back to the original": removes the home's copy, so the standard recipe shows again. */
export async function resetHouseholdRecipe(householdId: string, dishId: string): Promise<void> {
  const { error } = await client().from('recipes').delete().eq('dish_id', dishId).eq('household_id', householdId)
  if (error) throw error
  await refresh(dishId)
}
