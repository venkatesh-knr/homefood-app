import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Follow } from './dietPlans'

export const planFollowsKey = (householdId: string | undefined) => ['diet-plan-follows', householdId] as const

/** Who follows which diet plan in the home (the whole home may read it). Before migration 0041 is run the table is missing: an empty list. */
export function usePlanFollows(householdId: string | undefined) {
  return useQuery({
    queryKey: planFollowsKey(householdId),
    enabled: Boolean(supabase && householdId),
    retry: false,
    staleTime: 60_000,
    queryFn: async (): Promise<Follow[]> => {
      const { data, error } = await supabase!.from('diet_plan_follows').select('profile_id, plan, since, set_by')
      if (error) return []
      return data as Follow[]
    },
  })
}
