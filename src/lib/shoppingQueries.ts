import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { catalogIndex, type CatalogItem, type ShopItem, type ShopSection, type ShopSource, type ShopTab, type ShopUnit } from './shopping'

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

const numArray = (v: unknown): number[] | null => (Array.isArray(v) ? v.map(Number) : null)

function catalogRow(r: Record<string, unknown>, source: 'common' | 'ours'): CatalogItem {
  return {
    key: `${source}:${r.id as string}`,
    source,
    id: r.id as string,
    name_en: r.name_en as string,
    name_ta: (r.name_ta as string | null) ?? null,
    aliases: (r.aliases as string[] | null) ?? [],
    section: r.section as ShopSection,
    tab: r.browse_tab as ShopTab,
    usual_amount: Number(r.usual_amount),
    usual_unit: r.usual_unit as ShopUnit,
    perishable: Boolean(r.perishable),
    staple: Boolean(r.staple),
    pack_sizes: numArray(r.pack_sizes),
    g_per_cup: num(r.g_per_cup),
    g_per_piece: num(r.g_per_piece),
    created_by: (r.created_by as string | null) ?? null,
  }
}

/** The shared common items. Empty (not an error) before migration 0033 is run, so the list still works without them. */
export function useCommonShopItems() {
  return useQuery({
    queryKey: ['common-shop-items'],
    enabled: Boolean(supabase),
    staleTime: 60 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<CatalogItem[]> => {
      const { data, error } = await supabase!.from('common_shop_items').select('*').order('name_en')
      if (error) return []
      return data.map((r) => catalogRow(r, 'common'))
    },
  })
}

/** The home's own items ("Our item"). */
export function useHouseholdShopItems(householdId: string | undefined) {
  return useQuery({
    queryKey: ['household-shop-items', householdId],
    enabled: Boolean(supabase && householdId),
    retry: false,
    queryFn: async (): Promise<CatalogItem[]> => {
      const { data, error } = await supabase!.from('household_shop_items').select('*').eq('household_id', householdId).order('name_en')
      if (error) return []
      return data.map((r) => catalogRow(r, 'ours'))
    },
  })
}

/** Common and own items together, with the lookup used to match typed names. */
export function useShopCatalogue(householdId: string | undefined): { items: CatalogItem[]; index: Map<string, CatalogItem> } {
  const { data: common } = useCommonShopItems()
  const { data: ours } = useHouseholdShopItems(householdId)
  return useMemo(() => {
    const items = [...(common ?? []), ...(ours ?? [])]
    return { items, index: catalogIndex(items) }
  }, [common, ours])
}

