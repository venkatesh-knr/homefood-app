import { describe, expect, it } from 'vitest'
import {
  ageBand,
  avatarColor,
  daysUntil,
  initials,
  inviteState,
  invitePath,
  joinNames,
  personDetailText,
} from './people'

describe('initials', () => {
  it('takes the first letter of the first word, upper-cased', () => {
    expect(initials('amma')).toBe('A')
    expect(initials('  paati')).toBe('P')
    expect(initials('')).toBe('?')
  })
})

describe('avatarColor', () => {
  it('gives helpers a fixed colour regardless of position', () => {
    expect(avatarColor(0, 'helper')).toBe(avatarColor(4, 'helper'))
  })
  it('cycles through the palette for family members', () => {
    expect(avatarColor(0, 'family')).not.toBe(avatarColor(1, 'family'))
  })
})

describe('ageBand', () => {
  it('is null when no birth year is given', () => {
    expect(ageBand(null)).toBeNull()
  })
  it('bands ages the way the mockups describe them', () => {
    expect(ageBand(2020, 2026)).toBe('child') // 6
    expect(ageBand(2010, 2026)).toBe('teen') // 16
    expect(ageBand(1990, 2026)).toBe('adult') // 36
    expect(ageBand(1950, 2026)).toBe('senior') // 76
  })
})

describe('joinNames', () => {
  it('joins the way people talk', () => {
    expect(joinNames([])).toBe('')
    expect(joinNames(['Paati'])).toBe('Paati')
    expect(joinNames(['Paati', 'Helper'])).toBe('Paati and Helper')
    expect(joinNames(['Paati', 'Kavi', 'Helper'])).toBe('Paati, Kavi and Helper')
  })
})

describe('invitePath', () => {
  it('builds the /join/<token> route', () => {
    expect(invitePath('abc123')).toBe('/join/abc123')
  })
})

describe('inviteState', () => {
  const now = new Date('2026-09-28T00:00:00Z')
  const base = { id: '1', household_id: 'h', token: 't', created_by: null, created_at: '' }
  it('is revoked when cancelled, even if not expired', () => {
    expect(inviteState({ ...base, expires_at: '2026-10-05', revoked_at: '2026-09-27' }, now)).toBe('revoked')
  })
  it('is expired once past expires_at', () => {
    expect(inviteState({ ...base, expires_at: '2026-09-01', revoked_at: null }, now)).toBe('expired')
  })
  it('is active otherwise', () => {
    expect(inviteState({ ...base, expires_at: '2026-10-05', revoked_at: null }, now)).toBe('active')
  })
})

describe('daysUntil', () => {
  it('never goes negative', () => {
    expect(daysUntil('2020-01-01', new Date('2026-01-01'))).toBe(0)
  })
  it('rounds up so "expires today" still reads as 1 day left', () => {
    const now = new Date('2026-09-28T10:00:00Z')
    expect(daysUntil('2026-09-28T20:00:00Z', now)).toBe(1)
  })
})

describe('personDetailText', () => {
  const t = (key: string, opts?: Record<string, unknown>) => {
    const leaf = key.split('.').pop()!
    return opts?.list ? `allergy: ${opts.list}` : opts?.year !== undefined ? `${leaf} ${opts.year}` : leaf
  }
  it('describes a helper without an age band', () => {
    expect(personDetailText(t, { kind: 'helper', role: 'member', birth_year: null })).toBe('helperDetail')
  })
  it('adds the Admin suffix', () => {
    expect(personDetailText(t, { kind: 'family', role: 'admin', birth_year: 1990 })).toBe('adult · admin')
  })
  it('falls back to a generic label with no birth year', () => {
    expect(personDetailText(t, { kind: 'family', role: 'member', birth_year: null })).toBe('familyMember')
  })
  it('appends allergies', () => {
    expect(personDetailText(t, { kind: 'family', role: 'member', birth_year: 1950 }, ['soy'])).toBe('senior · allergy: soy')
  })
})
