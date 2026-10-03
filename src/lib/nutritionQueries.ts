import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { totalsOf, type NutritionRow, type TargetRow, type Totals } from './nutrition'

/** One dish's estimate, or null when there is none (or the table isn't there yet) — the panel simply stays hidden. */
export function useDishNutrition(dishId: string | undefined) {
  return useQuery({
    queryKey: ['dish-nutrition', dishId],
    enabled: Boolean(supabase && dishId),
    retry: false,
    queryFn: async (): Promise<NutritionRow | null> => {
      const { data, error } = await supabase!.from('dish_nutrition').select('*').eq('dish_id', dishId).maybeSingle()
      if (error) return null
      return data ? ({ ...data, ...totalsOf(data) } as NutritionRow) : null
    },
  })
}

/** Every estimate at once (a few hundred small rows) so "My nutrition" can add up a week without a query per dish. */
export function useAllNutrition() {
  return useQuery({
    queryKey: ['dish-nutrition-all'],
    enabled: Boolean(supabase),
    staleTime: 30 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<Map<string, Totals>> => {
      const { data, error } = await supabase!.from('dish_nutrition').select('*')
      if (error) return new Map()
      return new Map(data.map((r) => [r.dish_id as string, totalsOf(r)]))
    },
  })
}

export function useNutritionTargets() {
  return useQuery({
    queryKey: ['nutrition-targets'],
    enabled: Boolean(supabase),
    staleTime: 60 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<TargetRow[]> => {
      const { data, error } = await supabase!.from('nutrition_targets').select('*')
      if (error) return []
      return data.map((r) => ({ ...totalsOf(r), age_band: r.age_band, sex: r.sex, activity: r.activity })) as TargetRow[]
    },
  })
}
