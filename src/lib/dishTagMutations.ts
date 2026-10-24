import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { dishTagsKey } from './dishTagQueries'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

/** Says whether this home thinks a dish has a tag. `catalogueHas` is what the catalogue says: when the home agrees with it, the correction is removed. */
export async function setDishTag(args: { householdId: string; dishId: string; tag: string; present: boolean; catalogueHas: boolean; by: string }): Promise<void> {
  const { householdId, dishId, tag, present, catalogueHas, by } = args
  if (present === catalogueHas) {
    const { error } = await client().from('household_dish_tags').delete().eq('household_id', householdId).eq('dish_id', dishId).eq('tag', tag)
    if (error) throw error
  } else {
    const { error } = await client().from('household_dish_tags').upsert({ household_id: householdId, dish_id: dishId, tag, present, updated_by: by, updated_at: new Date().toISOString() })
    if (error) throw error
  }
  await Promise.all([queryClient.invalidateQueries({ queryKey: dishTagsKey(householdId) }), queryClient.invalidateQueries({ queryKey: ['dishes'] })])
}
