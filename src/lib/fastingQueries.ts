import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { FastingRule } from './fasting'

export const fastingKey = (householdId: string | undefined) => ['fasting-rules', householdId] as const

type Row = Omit<FastingRule, 'weekdays'> & { weekdays: number[] | null }

/** Everyone's fasting rules in the home (the whole home may read them). Empty before migration 0043 is run. */
export async function fetchFastingRules(): Promise<FastingRule[]> {
  const { data, error } = await supabase!.from('fasting_rules').select('profile_id, mode, skip_meals, one_meal, weekdays, dates')
  if (error || !data) return []
  return (data as Row[]).map((r) => ({ ...r, weekdays: (r.weekdays ?? []).map(Number), skip_meals: r.skip_meals ?? [], dates: r.dates ?? [] }))
}

export function useFastingRules(householdId: string | undefined) {
  return useQuery({
    queryKey: fastingKey(householdId),
    enabled: Boolean(supabase && householdId),
    retry: false,
    staleTime: 60_000,
    queryFn: fetchFastingRules,
  })
}
