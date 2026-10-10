import { supabase } from './supabase'
import { queryClient } from './queryClient'

/** Add or remove a dish from the home's favourites. */
export async function setFavourite(householdId: string, dishId: string, on: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  if (on) {
    const { error } = await supabase.from('dish_favourites').upsert({ household_id: householdId, dish_id: dishId }, { onConflict: 'household_id,dish_id' })
    if (error) throw error
  } else {
    const { error } = await supabase.from('dish_favourites').delete().eq('household_id', householdId).eq('dish_id', dishId)
    if (error) throw error
  }
  await queryClient.invalidateQueries({ queryKey: ['favourites', householdId] })
}
