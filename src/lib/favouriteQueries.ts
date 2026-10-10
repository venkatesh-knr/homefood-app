import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { countUsage } from './favourites'
import { toISODate } from './planner'

/** The home's favourite dish ids. Empty (not an error) before migration 0022 is run. */
export function useFavourites(householdId: string | undefined) {
  return useQuery({
    queryKey: ['favourites', householdId],
    enabled: Boolean(supabase && householdId),
    retry: false,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase!.from('dish_favourites').select('dish_id').eq('household_id', householdId)
      if (error) return new Set()
      return new Set(data.map((r) => r.dish_id as string))
    },
  })
}

/** How often each dish was planned in the last 120 days, so the dishes a home really cooks float to the top. */
export function useDishUsage(householdId: string | undefined) {
  return useQuery({
    queryKey: ['dish-usage', householdId],
    enabled: Boolean(supabase && householdId),
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Map<string, number>> => {
      const since = new Date()
      since.setDate(since.getDate() - 120)
      const { data, error } = await supabase!
        .from('meal_slots')
        .select('main_dish_id, meal_slot_sides(dish_id)')
        .eq('household_id', householdId)
        .gte('date', toISODate(since))
      if (error) return new Map()
      return countUsage(data as unknown as Parameters<typeof countUsage>[0])
    },
  })
}
