import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { leftoversKey } from './leftoverQueries'
import { lastDayFor, type KeptIn, type Leftover, type LeftoverAmount } from './leftovers'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

const refresh = (householdId: string) => queryClient.invalidateQueries({ queryKey: leftoversKey(householdId) })
/** A meal's sides come from the week queries, so using a leftover in a meal changes them too. */
const refreshMeals = () => Promise.all([queryClient.invalidateQueries({ queryKey: ['week-slots'] }), queryClient.invalidateQueries({ queryKey: ['history-slots'] })])

export type LeftoverPick = { dish_id: string; amount: LeftoverAmount }

/** "Anything left over?" for one meal: the ticked dishes are saved (a dish already recorded for this meal is changed, not repeated) and a dish
 * that was recorded but is no longer ticked is removed. Everything shares one "kept in": the use-by follows from it. */
export async function saveMealLeftovers(args: { householdId: string; profileId: string; slotId: string; cookedOn: string; keptIn: KeptIn; picks: LeftoverPick[]; existing: Leftover[] }): Promise<void> {
  const { householdId, profileId, slotId, cookedOn, keptIn, picks, existing } = args
  const useBy = lastDayFor(cookedOn, keptIn)
  const mine = existing.filter((l) => l.from_slot_id === slotId)
  for (const p of picks) {
    const have = mine.find((l) => l.dish_id === p.dish_id)
    if (have) {
      const { error } = await client().from('leftovers').update({ amount: p.amount, kept_in: keptIn, use_by: useBy, status: have.status === 'gone' ? 'active' : have.status }).eq('id', have.id)
      if (error) throw error
    } else {
      const { error } = await client().from('leftovers').insert({ household_id: householdId, dish_id: p.dish_id, from_slot_id: slotId, amount: p.amount, kept_in: keptIn, cooked_on: cookedOn, use_by: useBy, created_by: profileId })
      if (error) throw error
    }
  }
  const dropped = mine.filter((l) => l.status === 'active' && !picks.some((p) => p.dish_id === l.dish_id))
  if (dropped.length > 0) {
    const { error } = await client().from('leftovers').delete().in('id', dropped.map((l) => l.id))
    if (error) throw error
  }
  await refresh(householdId)
}

export async function markLeftoverGone(householdId: string, id: string): Promise<void> {
  const { error } = await client().from('leftovers').update({ status: 'gone', used_slot_id: null }).eq('id', id)
  if (error) throw error
  await refresh(householdId)
}

/** Any member: puts a leftover into an existing home meal as a side marked leftover (the database function checks the meal and the use-by). */
export async function putLeftoverInMeal(householdId: string, leftoverId: string, slotId: string): Promise<void> {
  const { error } = await client().rpc('use_leftover', { p_leftover: leftoverId, p_slot: slotId })
  if (error) throw error
  await Promise.all([refresh(householdId), refreshMeals()])
}

/** Tidying: leftovers more than a week past their use-by (whatever happened to them) are not needed any more. Quiet, and safe to run by anyone in the home. */
export async function pruneLeftovers(householdId: string, list: Leftover[], today: string): Promise<void> {
  const cutoff = new Date(`${today}T00:00:00`)
  cutoff.setDate(cutoff.getDate() - 7)
  const old = cutoff.toISOString().slice(0, 10)
  const stale = list.filter((l) => l.use_by < old)
  if (stale.length === 0) return
  const { error } = await client().from('leftovers').delete().in('id', stale.map((l) => l.id))
  if (!error) await refresh(householdId)
}
