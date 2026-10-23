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
      // a standard (or home recipe) tag gets its dish and owner from its recipe; a home's own reminder carries them itself
      return (data as unknown as (Record<string, unknown> & { recipes: { dish_id: string; household_id: string | null } | null })[])
        .filter((r) => r.recipes || r.dish_id)
        .map((r) => ({
          id: r.id as string, recipe_id: (r.recipe_id as string | null) ?? null, dish_id: (r.recipes?.dish_id ?? r.dish_id) as string, household_id: r.recipes ? r.recipes.household_id : (r.household_id as string | null),
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

/** The standard reminders this home switched off. Empty, not an error, before migration 0035 is run. */
export function usePrepOff(householdId: string | undefined) {
  return useQuery({
    queryKey: ['prep-off', householdId],
    enabled: Boolean(supabase && householdId),
    retry: false,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase!.from('household_prep_off').select('prep_id').eq('household_id', householdId)
      if (error) return new Set()
      return new Set(data.map((r) => r.prep_id as string))
    },
  })
}

const refreshPrep = async (householdId: string) => {
  await queryClient.invalidateQueries({ queryKey: ['prep-rows'] })
  await queryClient.invalidateQueries({ queryKey: ['prep-off', householdId] })
}

/** Switches a standard reminder off for this home, or back on. Admin or today's Planner (the database checks). */
export async function setDefaultPrepOff(args: { householdId: string; profileId: string; prepId: string; off: boolean }): Promise<void> {
  if (args.off) {
    const { error } = await client().from('household_prep_off').insert({ household_id: args.householdId, prep_id: args.prepId, created_by: args.profileId })
    if (error && error.code !== '23505') throw error
  } else {
    const { error } = await client().from('household_prep_off').delete().eq('household_id', args.householdId).eq('prep_id', args.prepId)
    if (error) throw error
  }
  await refreshPrep(args.householdId)
}

export type OwnPrepInput = { kind: PrepKind; lead: PrepLead; hours: number | null; text: string; textTa: string }

/** What is stored for the wording: a text typed in only one language is kept for both. */
export function ownPrepFields(input: OwnPrepInput): { kind: PrepKind; lead: PrepLead; hours: number | null; text_en: string; text_ta: string | null } {
  const en = input.text.trim()
  const ta = input.textTa.trim()
  return { kind: input.kind, lead: input.lead, hours: input.hours, text_en: en || ta, text_ta: ta || null }
}

/** Adds (no id) or changes (with id) one of the home's own reminders for a dish. */
export async function saveOwnPrep(args: { householdId: string; profileId: string; dishId: string; id?: string; input: OwnPrepInput }): Promise<void> {
  const fields = ownPrepFields(args.input)
  if (args.id) {
    const { error } = await client().from('recipe_prep').update(fields).eq('id', args.id)
    if (error) throw error
  } else {
    const { error } = await client().from('recipe_prep').insert({ ...fields, household_id: args.householdId, dish_id: args.dishId, created_by: args.profileId })
    if (error) throw error
  }
  await refreshPrep(args.householdId)
}

export async function removeOwnPrep(householdId: string, id: string): Promise<void> {
  const { error } = await client().from('recipe_prep').delete().eq('id', id)
  if (error) throw error
  await refreshPrep(householdId)
}
