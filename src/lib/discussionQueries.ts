import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { countsBySlot, type SlotDiscussionCounts, type SuggestionStatus, type VoteRow } from './discussion'
import type { SlotDish } from './plannerQueries'

export type CommentRow = { id: string; slot_id: string; profile_id: string; body: string; created_at: string }
export type SuggestionRow = {
  id: string
  slot_id: string
  profile_id: string
  dish_id: string | null
  free_text: string | null
  status: SuggestionStatus
  created_at: string
  dish: SlotDish | null
}

const DISH_FIELDS = 'id, name, diet, allergens, photo_path, cuisine_id, dish_names(language, name)'

export function useSlotVotes(slotId: string | undefined) {
  return useQuery({
    queryKey: ['discussion', slotId, 'votes'],
    enabled: Boolean(supabase && slotId),
    queryFn: async (): Promise<VoteRow[]> => {
      const { data, error } = await supabase!.from('meal_slot_votes').select('slot_id, profile_id, vote').eq('slot_id', slotId)
      if (error) throw error
      return data as VoteRow[]
    },
  })
}

export function useSlotComments(slotId: string | undefined) {
  return useQuery({
    queryKey: ['discussion', slotId, 'comments'],
    enabled: Boolean(supabase && slotId),
    queryFn: async (): Promise<CommentRow[]> => {
      const { data, error } = await supabase!.from('meal_slot_comments').select('*').eq('slot_id', slotId).order('created_at')
      if (error) throw error
      return data as CommentRow[]
    },
  })
}

export function useSlotSuggestions(slotId: string | undefined) {
  return useQuery({
    queryKey: ['discussion', slotId, 'suggestions'],
    enabled: Boolean(supabase && slotId),
    queryFn: async (): Promise<SuggestionRow[]> => {
      const { data, error } = await supabase!
        .from('meal_slot_suggestions')
        .select(`*, dish:dishes(${DISH_FIELDS})`)
        .eq('slot_id', slotId)
        .order('created_at')
      if (error) throw error
      return data as unknown as SuggestionRow[]
    },
  })
}

/** Vote / comment / open-suggestion counts for a set of meals (the cards on Week and Today).
 * Fetched separately from the slots on purpose, and any failure just means "no counts": the planner keeps working
 * even before the discussion tables exist in the database. */
export function useDiscussionCounts(slotIds: string[], myProfileId: string) {
  const key = [...slotIds].sort().join(',')
  return useQuery({
    queryKey: ['discussion-counts', myProfileId, key],
    enabled: Boolean(supabase && slotIds.length > 0),
    retry: false,
    queryFn: async (): Promise<Map<string, SlotDiscussionCounts>> => {
      const client = supabase!
      const [votes, comments, suggestions] = await Promise.all([
        client.from('meal_slot_votes').select('slot_id, profile_id, vote').in('slot_id', slotIds),
        client.from('meal_slot_comments').select('slot_id').in('slot_id', slotIds),
        client.from('meal_slot_suggestions').select('slot_id, status').in('slot_id', slotIds),
      ])
      if (votes.error || comments.error || suggestions.error) return countsBySlot(slotIds, [], [], [], myProfileId)
      return countsBySlot(slotIds, votes.data as VoteRow[], comments.data, suggestions.data as { slot_id: string; status: SuggestionStatus }[], myProfileId)
    },
  })
}
