import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { shoppingKey } from './shoppingQueries'
import { findExisting, isTamil, sleepingRegulars, type ShopItem, type ShopSection, type ShopUnit } from './shopping'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

const refresh = (householdId: string) => queryClient.invalidateQueries({ queryKey: shoppingKey(householdId) })

export type NewItem = { name: string; name_ta?: string | null; section?: ShopSection; amount?: number | null; unit?: ShopUnit | null }

/** What adding a typed item did: it made a new row, or it found the same name already there (on the list → just open it; ticked or asleep → put it back). */
export type AddResult = { kind: 'added' | 'opened' | 'restored'; id: string }

/** Adds an item, or finds the one with the same name. An amount and unit the person typed go with it. */
export async function addShoppingItem(args: { householdId: string; profileId: string; items: ShopItem[]; item: NewItem }): Promise<AddResult> {
  const { householdId, profileId, items, item } = args
  const name = item.name.trim()
  const existing = findExisting(items, name)
  if (existing) {
    if (existing.bought_at === null) return { kind: 'opened', id: existing.id }
    const patch: Record<string, unknown> = { bought_at: null, bought_by: null, source: 'manual' }
    if (item.amount != null && item.unit) Object.assign(patch, { amount: item.amount, unit: item.unit })
    const { error } = await client().from('shopping_items').update(patch).eq('id', existing.id)
    if (error) throw error
    await refresh(householdId)
    return { kind: 'restored', id: existing.id }
  }
  const row = {
    household_id: householdId,
    name,
    name_ta: item.name_ta ?? (isTamil(name) ? name : null),
    section: item.section ?? 'other',
    amount: item.amount ?? null,
    unit: item.amount != null ? (item.unit ?? 'pcs') : null,
    added_by: profileId,
  }
  const { data, error } = await client().from('shopping_items').insert(row).select('id').single()
  if (error) {
    if (error.code === '23505') {
      // someone else added the same name a moment ago: open theirs
      await refresh(householdId)
      const again = findExisting(queryClient.getQueryData<ShopItem[]>(shoppingKey(householdId)) ?? [], name)
      if (again) return { kind: 'opened', id: again.id }
    }
    throw error
  }
  await refresh(householdId)
  return { kind: 'added', id: data.id as string }
}

export type ItemPatch = Partial<Pick<ShopItem, 'amount' | 'unit' | 'section' | 'note' | 'is_regular' | 'name' | 'name_ta'>>

/** Shows a change on screen straight away (so − and + feel instant), and puts the old list back if the database refuses it. */
async function optimistic(householdId: string, id: string, patch: Partial<ShopItem>, write: () => PromiseLike<{ error: unknown }>): Promise<void> {
  const key = shoppingKey(householdId)
  const before = queryClient.getQueryData<ShopItem[]>(key)
  if (before) queryClient.setQueryData(key, before.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  const { error } = await write()
  if (error) {
    if (before) queryClient.setQueryData(key, before)
    throw error
  }
  void refresh(householdId)
}

export async function updateShoppingItem(householdId: string, id: string, patch: ItemPatch): Promise<void> {
  await optimistic(householdId, id, patch, () => client().from('shopping_items').update(patch).eq('id', id))
}

/** Ticks an item as bought by this person, or puts it back on the list. */
export async function setBought(householdId: string, id: string, by: string | null): Promise<void> {
  const patch = by ? { bought_at: new Date().toISOString(), bought_by: by } : { bought_at: null, bought_by: null }
  await optimistic(householdId, id, patch, () => client().from('shopping_items').update(patch).eq('id', id))
}

export async function removeShoppingItem(householdId: string, id: string): Promise<void> {
  const { error } = await client().from('shopping_items').delete().eq('id', id)
  if (error) throw error
  await refresh(householdId)
}

/** The Regulars button: wakes every sleeping regular. Returns how many came back. */
export async function addRegulars(householdId: string, items: ShopItem[]): Promise<number> {
  const asleep = sleepingRegulars(items)
  if (asleep.length === 0) return 0
  const { error } = await client()
    .from('shopping_items')
    .update({ bought_at: null, bought_by: null, source: 'regular' })
    .in('id', asleep.map((i) => i.id))
  if (error) throw error
  await refresh(householdId)
  return asleep.length
}

/** Admin only (the database checks): clears the list; regulars are kept and put to sleep. */
export async function clearShoppingList(householdId: string): Promise<void> {
  const { error } = await client().rpc('clear_shopping_list')
  if (error) throw error
  await refresh(householdId)
}

/** Tidying: ticked items older than a day that are not regulars have no use any more. Quiet, and safe to run by anyone in the home. */
export async function pruneBought(householdId: string, items: ShopItem[]): Promise<void> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const stale = items.filter((i) => !i.is_regular && i.bought_at !== null && new Date(i.bought_at).getTime() < cutoff)
  if (stale.length === 0) return
  const { error } = await client().from('shopping_items').delete().in('id', stale.map((i) => i.id))
  if (!error) await refresh(householdId)
}

