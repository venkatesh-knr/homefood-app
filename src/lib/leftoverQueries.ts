import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Leftover } from './leftovers'

export const leftoversKey = (householdId: string | undefined) => ['leftovers', householdId] as const

/** The home's leftovers (active, used and gone; the screens pick what they show). Before migration 0038 is run the table is missing: that
 * comes back as `null` (not available), so the leftover cards simply do not appear. Checked every minute while a screen that asks for it is open. */
export function useLeftovers(householdId: string | undefined, opts: { live?: boolean } = {}) {
  return useQuery({
    queryKey: leftoversKey(householdId),
    enabled: Boolean(supabase && householdId),
    retry: false,
    staleTime: 20_000,
    refetchInterval: opts.live ? 60_000 : false,
    queryFn: async (): Promise<Leftover[] | null> => {
      const { data, error } = await supabase!
        .from('leftovers')
        .select('*, dish:dishes(id, name, diet, allergens, photo_path, cuisine_id, tags, dish_names(language, name))')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
      if (error) return null
      return data as unknown as Leftover[]
    },
  })
}
