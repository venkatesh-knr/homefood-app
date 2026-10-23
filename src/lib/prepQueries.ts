import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { taskKey, type PrepKind, type PrepLead, type PrepRow } from './prep'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

/** Every prep tag the home can see (the standard recipes' and its own). Empty, not an error, before migration 0034 is run. */
export function usePrepRows() {
  return useQuery({
    queryKey: ['prep-rows'],
    enabled: Boolean(supabase),
    staleTime: 60 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<PrepRow[]> => {
      const { data, error } = await supabase!.from('recipe_prep').select('*, recipes(dish_id, household_id)')
      if (error) return []
      return (data as unknown as (Record<string, unknown> & { recipes: { dish_id: string; household_id: string | null } | null })[])
        .filter((r) => r.recipes)
        .map((r) => ({
          id: r.id as string, recipe_id: r.recipe_id as string, dish_id: r.recipes!.dish_id, household_id: r.recipes!.household_id,
          kind: r.kind as PrepKind, lead: r.lead as PrepLead, hours: r.hours === null ? null : Number(r.hours), text_en: r.text_en as string, text_ta: (r.text_ta as string | null) ?? null,
        }))
    },
  })
}

export type PrepDone = { by: string | null; at: string }

/** Who ticked which task done for the given meals (keyed by `taskKey(slotId, prepId)`). */
export function usePrepDone(slotIds: string[]) {
  const ids = [...new Set(slotIds)].sort()
  return useQuery({
    queryKey: ['prep-done', ids],
    enabled: Boolean(supabase) && ids.length > 0,
    retry: false,
    refetchInterval: 30_000,
    queryFn: async (): Promise<Map<string, PrepDone>> => {
      const { data, error } = await supabase!.from('prep_done').select('slot_id, prep_id, done_by, done_at').in('slot_id', ids)
      if (error) return new Map()
      return new Map(data.map((r) => [taskKey(r.slot_id as string, r.prep_id as string), { by: (r.done_by as string | null) ?? null, at: r.done_at as string }]))
    },
  })
}

/** Ticks a task done (as this person), or undoes it. Anyone in the home can do either. */
export async function setPrepDone(args: { householdId: string; slotId: string; prepId: string; profileId: string; done: boolean }): Promise<void> {
  if (args.done) {
    const { error } = await client().from('prep_done').insert({ slot_id: args.slotId, prep_id: args.prepId, household_id: args.householdId, done_by: args.profileId })
    if (error && error.code !== '23505') throw error
  } else {
    const { error } = await client().from('prep_done').delete().eq('slot_id', args.slotId).eq('prep_id', args.prepId)
    if (error) throw error
  }
  await queryClient.invalidateQueries({ queryKey: ['prep-done'] })
}
