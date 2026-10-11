import { useMemo } from 'react'
import { useHome } from './homeContext'
import { useMembers } from './queries'
import type { Profile } from './people'

/** Whose extras and goals this person may keep: themselves, and (for an Admin) family members with no login of their own. Never the helper. */
export function useExtrasPeople(): Profile[] {
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  return useMemo(() => [profile, ...(profile.role === 'admin' ? (members ?? []).filter((m) => m.kind === 'family' && !m.can_login && m.id !== profile.id) : [])], [profile, members])
}
