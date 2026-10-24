import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { CorrectionsByDish } from './dishTags'

export const dishTagsKey = (householdId: string | undefined) => ['dish-tag-corrections', householdId] as const

/** Fetches a home's tag corrections (nothing before migration 0040 is run). */
export async function fetchCorrections(householdId: string): Promise<CorrectionsByDish> {
  const { data, error } = await supabase!.from('household_dish_tags').select('dish_id, tag, present').eq('household_id', householdId)
  const out: CorrectionsByDish = new Map()
  if (error || !data) return out
  for (const r of data as { dish_id: string; tag: string; present: boolean }[]) {
    const m = out.get(r.dish_id) ?? new Map<string, boolean>()
    m.set(r.tag, r.present)
    out.set(r.dish_id, m)
  }
  return out
}

/** The home's corrections of dish tags, by dish. */
export function useDishTagCorrections(householdId: string | undefined) {
  return useQuery({
    queryKey: dishTagsKey(householdId),
    enabled: Boolean(supabase && householdId),
    retry: false,
    staleTime: 60_000,
    queryFn: () => fetchCorrections(householdId!),
  })
}
