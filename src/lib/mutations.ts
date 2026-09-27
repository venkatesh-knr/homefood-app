// Plain async functions that write to Supabase and then invalidate the
// react-query caches that could be stale afterwards. Components call these
// directly (usually from a button handler) and track their own busy/error
// state — phase 1 doesn't need optimistic updates.
import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { normaliseAllergen } from './validation'
import type { ActivityLevel, Household, PersonDraft, ProfileKind, Sex } from './people'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function createHousehold(input: {
  homeName: string
  displayName: string
  language: 'en' | 'ta'
  snacksEnabled: boolean
}): Promise<string> {
  const { data, error } = await client().rpc('create_household', {
    p_name: input.homeName,
    p_display_name: input.displayName,
    p_language: input.language,
    p_snacks_enabled: input.snacksEnabled,
  })
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['me'] })
  return data as string
}

/** Saves every pending person from the setup wizard, one at a time, after the home exists. */
export async function saveDraftPeople(householdId: string, drafts: PersonDraft[]): Promise<void> {
  for (const draft of drafts) {
    const { data, error } = await client()
      .from('profiles')
      .insert({
        household_id: householdId,
        display_name: draft.display_name.trim(),
        kind: draft.kind,
        can_login: draft.kind === 'helper' ? false : draft.can_login,
        birth_year: draft.birth_year.trim() === '' ? null : Number(draft.birth_year),
        sex: draft.sex || null,
        activity: draft.activity || null,
      })
      .select('id')
      .single()
    if (error) throw error
    if (draft.allergies.length > 0) {
      const { error: allergyError } = await client()
        .from('profile_allergies')
        .insert(draft.allergies.map((allergen) => ({ profile_id: data.id, allergen: normaliseAllergen(allergen) })))
      if (allergyError) throw allergyError
    }
  }
  await queryClient.invalidateQueries({ queryKey: ['members', householdId] })
}

export type PersonInput = {
  display_name: string
  kind: ProfileKind
  can_login: boolean
  birth_year: string
  sex: Sex | ''
  activity: ActivityLevel | ''
  allergies: string[]
}

export async function addPerson(householdId: string, input: PersonInput): Promise<void> {
  const { data, error } = await client()
    .from('profiles')
    .insert({
      household_id: householdId,
      display_name: input.display_name.trim(),
      kind: input.kind,
      can_login: input.kind === 'helper' ? false : input.can_login,
      birth_year: input.birth_year.trim() === '' ? null : Number(input.birth_year),
      sex: input.sex || null,
      activity: input.activity || null,
    })
    .select('id')
    .single()
  if (error) throw error
  if (input.allergies.length > 0) {
    const { error: allergyError } = await client()
      .from('profile_allergies')
      .insert(input.allergies.map((allergen) => ({ profile_id: data.id, allergen: normaliseAllergen(allergen) })))
    if (allergyError) throw allergyError
  }
  await queryClient.invalidateQueries({ queryKey: ['members', householdId] })
}

export async function updatePerson(profileId: string, householdId: string, input: PersonInput): Promise<void> {
  const { error } = await client()
    .from('profiles')
    .update({
      display_name: input.display_name.trim(),
      kind: input.kind,
      can_login: input.kind === 'helper' ? false : input.can_login,
      birth_year: input.birth_year.trim() === '' ? null : Number(input.birth_year),
      sex: input.sex || null,
      activity: input.activity || null,
    })
    .eq('id', profileId)
  if (error) throw error
  // Simplest correct approach: replace the whole allergy list rather than diff it.
  const { error: clearError } = await client().from('profile_allergies').delete().eq('profile_id', profileId)
  if (clearError) throw clearError
  if (input.allergies.length > 0) {
    const { error: insertError } = await client()
      .from('profile_allergies')
      .insert(input.allergies.map((allergen) => ({ profile_id: profileId, allergen: normaliseAllergen(allergen) })))
    if (insertError) throw insertError
  }
  await queryClient.invalidateQueries({ queryKey: ['members', householdId] })
  await queryClient.invalidateQueries({ queryKey: ['allergies'] })
}

export async function removePerson(profileId: string, householdId: string): Promise<void> {
  const { error } = await client().from('profiles').delete().eq('id', profileId)
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['members', householdId] })
}

export async function updateHousehold(
  householdId: string,
  patch: Partial<Pick<Household, 'name' | 'default_language' | 'snacks_enabled'>>,
): Promise<void> {
  const { error } = await client().from('households').update(patch).eq('id', householdId)
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['household', householdId] })
}

export async function createInvite(householdId: string, createdBy: string): Promise<void> {
  const { error } = await client().from('invites').insert({ household_id: householdId, created_by: createdBy })
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['invites', householdId] })
}

export async function revokeInvite(inviteId: string, householdId: string): Promise<void> {
  const { error } = await client().from('invites').update({ revoked_at: new Date().toISOString() }).eq('id', inviteId)
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['invites', householdId] })
}

export async function claimProfile(token: string, profileId: string): Promise<void> {
  const { error } = await client().rpc('claim_profile', { p_token: token, p_profile_id: profileId })
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['me'] })
  await queryClient.invalidateQueries({ queryKey: ['invite-preview', token] })
}
