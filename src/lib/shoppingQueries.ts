import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { ShopItem, ShopSection, ShopSource, ShopUnit } from './shopping'

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v))

export const shoppingKey = (householdId: string | undefined) => ['shopping', householdId] as const

/** Every item of the home's list: still to buy, ticked in the last day, and sleeping regulars (the screen splits them with `splitList`).
 * Checked every 20 seconds while a screen that asks for it is open, so everyone in the home sees ticks and additions soon after they happen.
 * An error (for example before migration 0032 is run) is returned as `isError`, so callers can hide their button instead of showing zeros. */
export function useShoppingItems(householdId: string | undefined, opts: { live?: boolean } = {}) {
  return useQuery({
    queryKey: shoppingKey(householdId),
    enabled: Boolean(supabase && householdId),
    retry: false,
    staleTime: 10_000,
    refetchInterval: opts.live ? 20_000 : false,
    queryFn: async (): Promise<ShopItem[]> => {
      const { data, error } = await supabase!.from('shopping_items').select('*').eq('household_id', householdId).order('created_at')
      if (error) throw error
      return data.map((r) => ({
        id: r.id as string,
        household_id: r.household_id as string,
        name: r.name as string,
        name_ta: (r.name_ta as string | null) ?? null,
        section: r.section as ShopSection,
        amount: num(r.amount),
        unit: (r.unit as ShopUnit | null) ?? null,
        note: (r.note as string | null) ?? null,
        source: r.source as ShopSource,
        source_dishes: (r.source_dishes as string[] | null) ?? [],
        is_regular: Boolean(r.is_regular),
        added_by: (r.added_by as string | null) ?? null,
        bought_at: (r.bought_at as string | null) ?? null,
        bought_by: (r.bought_by as string | null) ?? null,
        created_at: r.created_at as string,
      }))
    },
  })
}
