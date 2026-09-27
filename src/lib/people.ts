// Shared types and small pure helpers for households, profiles and invites.
// Kept framework-free so they're easy to unit test.

export type ProfileKind = 'family' | 'helper'
export type MemberRole = 'admin' | 'member'
export type Sex = 'female' | 'male' | 'other'
export type ActivityLevel = 'light' | 'moderate' | 'active'
export type AgeBand = 'child' | 'teen' | 'adult' | 'senior'

export type Household = {
  id: string
  name: string
  week_start: number
  timezone: string
  default_language: 'en' | 'ta'
  snacks_enabled: boolean
  created_at: string
}

export type Profile = {
  id: string
  household_id: string
  user_id: string | null
  display_name: string
  kind: ProfileKind
  role: MemberRole
  can_login: boolean
  birth_year: number | null
  sex: Sex | null
  activity: ActivityLevel | null
  language: 'en' | 'ta'
  photo_path: string | null
  created_at: string
}

export type Invite = {
  id: string
  household_id: string
  token: string
  created_by: string | null
  created_at: string
  expires_at: string
  revoked_at: string | null
}

/** A person still being added on the setup wizard — not saved to the database yet. */
export type PersonDraft = {
  tempId: string
  display_name: string
  kind: ProfileKind
  can_login: boolean
  birth_year: string
  sex: Sex | ''
  activity: ActivityLevel | ''
  allergies: string[]
}

export function newPersonDraft(): PersonDraft {
  return {
    tempId: crypto.randomUUID(),
    display_name: '',
    kind: 'family',
    can_login: true,
    birth_year: '',
    sex: '',
    activity: '',
    allergies: [],
  }
}

/** First letter of the first word, for the round avatar badge. */
export function initials(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed[0]!.toUpperCase() : '?'
}

const AVATAR_PALETTE = ['#8A4B00', '#3B4A9C', '#2F7A3E', '#B3261E', '#4A3F37']
const HELPER_AVATAR_COLOR = '#6B4A3A'

/** Deterministic avatar colour by position, so the same list always looks the same. */
export function avatarColor(index: number, kind: ProfileKind): string {
  if (kind === 'helper') return HELPER_AVATAR_COLOR
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length]!
}

/** Empty (no birth year given) is common and fine — nutrition tips just skip the age band. */
export function ageBand(birthYear: number | null, atYear: number = new Date().getFullYear()): AgeBand | null {
  if (birthYear === null) return null
  const age = atYear - birthYear
  if (age < 13) return 'child'
  if (age < 20) return 'teen'
  if (age >= 60) return 'senior'
  return 'adult'
}

export function invitePath(token: string): string {
  return `/join/${token}`
}

export function inviteUrl(token: string): string {
  return `${window.location.origin}${invitePath(token)}`
}

export type InviteState = 'active' | 'expired' | 'revoked'

export function inviteState(invite: Invite, now: Date = new Date()): InviteState {
  if (invite.revoked_at) return 'revoked'
  if (new Date(invite.expires_at) <= now) return 'expired'
  return 'active'
}

/** Whole days left before an invite expires, floored at 0 (never negative). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const ms = new Date(iso).getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

/** "Paati and Helper" / "Paati, Kavi and Helper" — join a list of names the way people talk. */
export function joinNames(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]!
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

type Translate = (key: string, options?: Record<string, unknown>) => string

/** The small grey line under a person's name, e.g. "Adult · Admin" or "Senior · allergy: soy". */
export function personDetailText(
  t: Translate,
  person: { kind: ProfileKind; role: MemberRole; birth_year: number | null },
  allergens: string[] = [],
): string {
  if (person.kind === 'helper') return t('people.helperDetail')
  const band = ageBand(person.birth_year)
  let text = band ? t(`people.ageBand.${band}`) : t('people.familyMember')
  if (person.role === 'admin') text += ` · ${t('people.admin')}`
  if (allergens.length > 0) text += ` · ${t('people.allergyLabel', { list: allergens.join(', ') })}`
  return text
}
