import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { fastingKey } from './fastingQueries'
import type { FastingRule } from './fasting'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

/** Everything that shows meals depends on who fasts, so the week and history reads are refreshed too. */
const refresh = (householdId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: fastingKey(householdId) }),
    queryClient.invalidateQueries({ queryKey: ['week-slots'] }),
    queryClient.invalidateQueries({ queryKey: ['history-slots'] }),
  ])

/** Saves a person's fasting rule (the database checks who may set it, and refuses anyone under 18 or without a birth year). */
export async function saveFastingRule(householdId: string, rule: FastingRule): Promise<void> {
  const row = {
    profile_id: rule.profile_id,
    mode: rule.mode,
    skip_meals: rule.mode === 'skip_meals' ? rule.skip_meals : [],
    one_meal: rule.mode === 'one_meal' ? rule.one_meal : null,
    weekdays: [...rule.weekdays].sort(),
    dates: [...new Set(rule.dates)].sort(),
  }
  const { error } = await client().from('fasting_rules').upsert(row)
  if (error) throw error
  await refresh(householdId)
}

export async function stopFasting(householdId: string, profileId: string): Promise<void> {
  const { error } = await client().from('fasting_rules').delete().eq('profile_id', profileId)
  if (error) throw error
  await refresh(householdId)
}
