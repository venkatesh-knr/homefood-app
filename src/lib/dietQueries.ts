import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Preferences } from './diets'

export const dietPrefsKey = (householdId: string | undefined) => ['diet-preferences', householdId] as const

/** Everyone's everyday preferences in the home (the whole home may read them), by person. Before migration 0039 is run the table is missing:
 * that comes back as an empty map, so nothing changes in the app. */
export function useDietPreferences(householdId: string | undefined) {
  return useQuery({
    queryKey: dietPrefsKey(householdId),
    enabled: Boolean(supabase && householdId),
    retry: false,
    staleTime: 60_000,
    queryFn: async (): Promise<Map<string, Preferences>> => {
      const { data, error } = await supabase!.from('profile_preferences').select('profile_id, diet, no_onion_garlic, low_oil, low_salt, low_sugar')
      if (error) return new Map()
      return new Map((data as Preferences[]).map((p) => [p.profile_id, p]))
    },
  })
}
