import { useQuery } from '@tanstack/react-query'
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
