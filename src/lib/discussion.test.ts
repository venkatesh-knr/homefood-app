import { describe, expect, it } from 'vitest'
import { agreeShare, countsBySlot, formatCommentTime, myVoteOf, nextVote, tallyVotes } from './discussion'

describe('votes', () => {
  it('tallies agree and disagree', () => {
    expect(tallyVotes([{ vote: 'agree' }, { vote: 'agree' }, { vote: 'disagree' }])).toEqual({ agree: 2, disagree: 1, total: 3 })
    expect(tallyVotes([])).toEqual({ agree: 0, disagree: 0, total: 0 })
  })
  it('splits an empty bar evenly, otherwise by the agree share', () => {
    expect(agreeShare({ agree: 0, disagree: 0, total: 0 })).toBe(0.5)
    expect(agreeShare({ agree: 3, disagree: 1, total: 4 })).toBe(0.75)
  })
  it('finds my vote and lets me take it back by tapping it again', () => {
    const votes = [{ profile_id: 'amma', vote: 'agree' as const }, { profile_id: 'appa', vote: 'disagree' as const }]
    expect(myVoteOf(votes, 'appa')).toBe('disagree')
    expect(myVoteOf(votes, 'kavi')).toBeNull()
    expect(nextVote('agree', 'agree')).toBeNull()
    expect(nextVote('agree', 'disagree')).toBe('disagree')
    expect(nextVote(null, 'agree')).toBe('agree')
  })
})

describe('countsBySlot', () => {
  it('folds votes, comments and open suggestions per slot, ignoring other slots', () => {
    const map = countsBySlot(
      ['s1', 's2'],
      [
        { slot_id: 's1', profile_id: 'me', vote: 'agree' },
        { slot_id: 's1', profile_id: 'x', vote: 'disagree' },
        { slot_id: 'other', profile_id: 'x', vote: 'agree' },
      ],
      [{ slot_id: 's1' }, { slot_id: 's1' }, { slot_id: 's2' }],
      [{ slot_id: 's2', status: 'open' }, { slot_id: 's2', status: 'accepted' }],
      'me',
    )
    expect(map.get('s1')).toEqual({ agree: 1, disagree: 1, comments: 2, openSuggestions: 0, myVote: 'agree' })
    expect(map.get('s2')).toEqual({ agree: 0, disagree: 0, comments: 1, openSuggestions: 1, myVote: null })
    expect(map.has('other')).toBe(false)
  })
})

describe('formatCommentTime', () => {
  it('shows only the time for today and the date too for earlier days', () => {
    const now = new Date(2026, 9, 3, 12, 0)
    expect(formatCommentTime(new Date(2026, 9, 3, 8, 10).toISOString(), now, 'en-IN').toLowerCase()).toMatch(/^8:10\s?am$/)
    expect(formatCommentTime(new Date(2026, 8, 30, 9, 5).toISOString(), now, 'en-IN').toLowerCase()).toMatch(/^30 sept?,? 9:05\s?am$/)
  })
})
