import { useQuery } from '@tanstack/react-query'
import type { PlanRecipe } from './shoppingPlan'
import { supabase } from './supabase'
import type { RecipeRow } from './recipes'

/** The recipe to show for a dish: this home's own version if it has one, else the standard one. */
export function useRecipe(dishId: string | undefined) {
  return useQuery({
    queryKey: ['recipe', dishId],
    enabled: Boolean(supabase && dishId),
    queryFn: async (): Promise<RecipeRow | null> => {
      const { data, error } = await supabase!.from('recipes').select('*, recipe_ingredients(*), recipe_steps(*)').eq('dish_id', dishId)
      if (error) throw error
      const rows = data as unknown as RecipeRow[]
      const row = rows.find((r) => r.household_id !== null) ?? rows[0]
      if (!row) return null
      return {
        ...row,
        recipe_ingredients: [...row.recipe_ingredients].sort((a, b) => a.position - b.position),
        recipe_steps: [...row.recipe_steps].sort((a, b) => a.position - b.position),
      }
    },
  })
}

/** Which dishes have a recipe, so cards only offer a Recipe button where there is one. Any failure just means "none". */
export function useRecipeDishIds() {
  return useQuery({
    queryKey: ['recipe-dish-ids'],
    enabled: Boolean(supabase),
    staleTime: 10 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase!.from('recipes').select('dish_id')
      if (error) return new Set()
      return new Set(data.map((r) => r.dish_id as string))
    },
  })
}

/** The recipes (ingredients and servings only) of several dishes at once, for "From this week's meals": this home's own version if it has one,
 * else the standard one. A dish with no recipe is simply missing from the map. */
export function useRecipesForDishes(dishIds: string[]) {
  const key = [...new Set(dishIds)].sort()
  return useQuery({
    queryKey: ['recipes-for-dishes', key],
    enabled: Boolean(supabase) && key.length > 0,
    queryFn: async (): Promise<Map<string, PlanRecipe>> => {
      const { data, error } = await supabase!.from('recipes').select('dish_id, household_id, servings, recipe_ingredients(name, quantity, unit)').in('dish_id', key)
      if (error) throw error
      const best = new Map<string, { household_id: string | null; recipe: PlanRecipe }>()
      for (const r of data as unknown as { dish_id: string; household_id: string | null; servings: number; recipe_ingredients: { name: string; quantity: number | null; unit: PlanRecipe['ingredients'][number]['unit'] }[] }[]) {
        const have = best.get(r.dish_id)
        if (have && (have.household_id !== null || r.household_id === null)) continue
        best.set(r.dish_id, { household_id: r.household_id, recipe: { servings: Number(r.servings), ingredients: r.recipe_ingredients.map((i) => ({ name: i.name, quantity: i.quantity === null ? null : Number(i.quantity), unit: i.unit })) } })
      }
      return new Map([...best].map(([id, v]) => [id, v.recipe]))
    },
  })
}
