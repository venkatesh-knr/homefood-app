import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { planFollowsKey } from './planQueries'
import type { PlanKey } from './dietPlans'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

const refresh = (householdId: string) => queryClient.invalidateQueries({ queryKey: planFollowsKey(householdId) })

/** Starts a plan for these people (the database checks who may set it for whom, and the age rule for the restrictive plans). Already following is fine. */
export async function startPlan(householdId: string, plan: PlanKey, profileIds: string[]): Promise<void> {
  if (profileIds.length === 0) return
  const { error } = await client().from('diet_plan_follows').upsert(profileIds.map((profile_id) => ({ profile_id, plan })), { onConflict: 'profile_id,plan', ignoreDuplicates: true })
  if (error) throw error
  await refresh(householdId)
}

/** Stops a plan for these people. */
export async function stopPlan(householdId: string, plan: PlanKey, profileIds: string[]): Promise<void> {
  if (profileIds.length === 0) return
  const { error } = await client().from('diet_plan_follows').delete().eq('plan', plan).in('profile_id', profileIds)
  if (error) throw error
  await refresh(householdId)
}
