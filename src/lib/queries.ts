import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { useAuth } from './auth'
import type { Household, Invite, Profile } from './people'

export function useMyProfile() {
  const { session } = useAuth()
  const userId = session?.user.id
  return useQuery({
    queryKey: ['me', userId],
    enabled: Boolean(supabase && userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase!.from('profiles').select('*').eq('user_id', userId).maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useHousehold(householdId: string | undefined) {
  return useQuery({
    queryKey: ['household', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<Household> => {
      const { data, error } = await supabase!.from('households').select('*').eq('id', householdId).single()
      if (error) throw error
      return data
    },
  })
}

export function useMembers(householdId: string | undefined) {
  return useQuery({
    queryKey: ['members', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

export type AllergyRow = { profile_id: string; allergen: string }

export function useAllergies(profileIds: string[]) {
  return useQuery({
    queryKey: ['allergies', ...profileIds],
    enabled: Boolean(supabase) && profileIds.length > 0,
    queryFn: async (): Promise<AllergyRow[]> => {
      const { data, error } = await supabase!.from('profile_allergies').select('*').in('profile_id', profileIds)
      if (error) throw error
      return data
    },
  })
}

export function useInvites(householdId: string | undefined) {
  return useQuery({
    queryKey: ['invites', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<Invite[]> => {
      const { data, error } = await supabase!
        .from('invites')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export type InvitePerson = { id: string; name: string; birth_year: number | null; joined: boolean }
export type InvitePreview = {
  household_name: string
  invited_by: string | null
  member_count: number
  people: InvitePerson[]
}

/** Works signed out — the RPC is security-definer and granted to `anon`. */
export function useInvitePreview(token: string | undefined) {
  return useQuery({
    queryKey: ['invite-preview', token],
    enabled: Boolean(supabase && token),
    queryFn: async (): Promise<InvitePreview | null> => {
      const { data, error } = await supabase!.rpc('get_invite', { p_token: token })
      if (error) throw error
      return (data as InvitePreview[])[0] ?? null
    },
  })
}
