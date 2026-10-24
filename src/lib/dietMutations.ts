import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { dietPrefsKey } from './dietQueries'
import type { Preferences } from './diets'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

/** Saves one person's preferences. Nothing set at all removes the row, so "no preferences" is simply no row. */
export async function savePreferences(args: { householdId: string; by: string; prefs: Preferences }): Promise<void> {
  const { householdId, by, prefs } = args
  const empty = prefs.diet === null && !prefs.no_onion_garlic && !prefs.low_oil && !prefs.low_salt && !prefs.low_sugar
  if (empty) {
    const { error } = await client().from('profile_preferences').delete().eq('profile_id', prefs.profile_id)
    if (error) throw error
  } else {
    const { error } = await client().from('profile_preferences').upsert({ ...prefs, updated_by: by, updated_at: new Date().toISOString() })
    if (error) throw error
  }
  await queryClient.invalidateQueries({ queryKey: dietPrefsKey(householdId) })
}
