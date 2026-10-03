import { supabase } from './supabase'
import { queryClient } from './queryClient'
import type { Vote } from './discussion'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function refresh(slotId: string) {
  await queryClient.invalidateQueries({ queryKey: ['discussion', slotId] })
  await queryClient.invalidateQueries({ queryKey: ['discussion-counts'] })
}

/** Pass null to take your vote back. */
export async function setVote(slotId: string, profileId: string, vote: Vote | null): Promise<void> {
  if (vote === null) {
    const { error } = await client().from('meal_slot_votes').delete().eq('slot_id', slotId).eq('profile_id', profileId)
    if (error) throw error
  } else {
    const { error } = await client()
      .from('meal_slot_votes')
      .upsert({ slot_id: slotId, profile_id: profileId, vote, updated_at: new Date().toISOString() }, { onConflict: 'slot_id,profile_id' })
    if (error) throw error
  }
  await refresh(slotId)
}

export async function addComment(slotId: string, profileId: string, body: string): Promise<void> {
  const { error } = await client().from('meal_slot_comments').insert({ slot_id: slotId, profile_id: profileId, body: body.trim() })
  if (error) throw error
  await refresh(slotId)
}

export async function deleteComment(slotId: string, commentId: string): Promise<void> {
  const { error } = await client().from('meal_slot_comments').delete().eq('id', commentId)
  if (error) throw error
  await refresh(slotId)
}

export async function addSuggestion(slotId: string, profileId: string, pick: { dishId: string } | { freeText: string }): Promise<void> {
  const row = 'dishId' in pick ? { dish_id: pick.dishId } : { free_text: pick.freeText.trim() }
  const { error } = await client().from('meal_slot_suggestions').insert({ slot_id: slotId, profile_id: profileId, ...row })
  if (error) throw error
  await refresh(slotId)
}

export async function withdrawSuggestion(slotId: string, suggestionId: string): Promise<void> {
  const { error } = await client().from('meal_slot_suggestions').delete().eq('id', suggestionId)
  if (error) throw error
  await refresh(slotId)
}

async function closeSuggestion(suggestionId: string, status: 'accepted' | 'declined') {
  const { error } = await client().from('meal_slot_suggestions').update({ status, resolved_at: new Date().toISOString() }).eq('id', suggestionId)
  if (error) throw error
}

async function refreshSlots(slotId: string, householdId: string) {
  await queryClient.invalidateQueries({ queryKey: ['week-slots'] })
  await queryClient.invalidateQueries({ queryKey: ['history-slots', householdId] })
  await refresh(slotId)
}

/** Planner says yes to a suggestion. A catalogue dish replaces the meal's main dish (and the old votes, which were about
 * the old dish, are cleared); a few-words suggestion is just marked accepted, for the Planner to act on by hand. */
export async function acceptSuggestion(slotId: string, householdId: string, suggestion: { id: string; dish_id: string | null }): Promise<void> {
  if (suggestion.dish_id) {
    const { error } = await client()
      .from('meal_slots')
      .update({ main_dish_id: suggestion.dish_id, source: 'home', place_name: null, kept_despite_disagree: false, updated_at: new Date().toISOString() })
      .eq('id', slotId)
    if (error) throw error
    const { error: votesError } = await client().from('meal_slot_votes').delete().eq('slot_id', slotId)
    if (votesError) throw votesError
  }
  await closeSuggestion(suggestion.id, 'accepted')
  await refreshSlots(slotId, householdId)
}

/** Planner keeps the dish even if people disagreed ("the Planner has the final say"). */
export async function keepDish(slotId: string, householdId: string, suggestionId: string): Promise<void> {
  const { error } = await client().from('meal_slots').update({ kept_despite_disagree: true, updated_at: new Date().toISOString() }).eq('id', slotId)
  if (error) throw error
  await closeSuggestion(suggestionId, 'declined')
  await refreshSlots(slotId, householdId)
}
