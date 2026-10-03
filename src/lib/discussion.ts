// Pure helpers for votes / comments / suggestions on a meal. Framework-free so they're unit-tested without a database.

export type Vote = 'agree' | 'disagree'
export type SuggestionStatus = 'open' | 'accepted' | 'declined'

export type VoteRow = { slot_id: string; profile_id: string; vote: Vote }

export type Tally = { agree: number; disagree: number; total: number }

export function tallyVotes(votes: { vote: Vote }[]): Tally {
  const agree = votes.filter((v) => v.vote === 'agree').length
  const disagree = votes.length - agree
  return { agree, disagree, total: votes.length }
}

/** How much of the bar is green (0–1). An empty bar is split evenly so it doesn't look like a result. */
export function agreeShare(t: Tally): number {
  return t.total === 0 ? 0.5 : t.agree / t.total
}

export function myVoteOf(votes: { profile_id: string; vote: Vote }[], profileId: string): Vote | null {
  return votes.find((v) => v.profile_id === profileId)?.vote ?? null
}

/** What happens to my vote when I tap `tapped`: tapping the vote I already have takes it back. */
export function nextVote(current: Vote | null, tapped: Vote): Vote | null {
  return current === tapped ? null : tapped
}

export type SlotDiscussionCounts = { agree: number; disagree: number; comments: number; openSuggestions: number; myVote: Vote | null }

export const EMPTY_COUNTS: SlotDiscussionCounts = { agree: 0, disagree: 0, comments: 0, openSuggestions: 0, myVote: null }

/** Fold the three flat result lists into one summary per slot (the cards on Week and Today show these). */
export function countsBySlot(
  slotIds: string[],
  votes: VoteRow[],
  comments: { slot_id: string }[],
  suggestions: { slot_id: string; status: SuggestionStatus }[],
  myProfileId: string,
): Map<string, SlotDiscussionCounts> {
  const map = new Map<string, SlotDiscussionCounts>(slotIds.map((id) => [id, { ...EMPTY_COUNTS }]))
  for (const v of votes) {
    const c = map.get(v.slot_id)
    if (!c) continue
    if (v.vote === 'agree') c.agree += 1
    else c.disagree += 1
    if (v.profile_id === myProfileId) c.myVote = v.vote
  }
  for (const cm of comments) {
    const c = map.get(cm.slot_id)
    if (c) c.comments += 1
  }
  for (const s of suggestions) {
    const c = map.get(s.slot_id)
    if (c && s.status === 'open') c.openSuggestions += 1
  }
  return map
}

/** Comment timestamp: just the time for today, otherwise the date and time ("30 Sept, 8:10 am"). */
export function formatCommentTime(iso: string, now: Date, locale: string): string {
  const d = new Date(iso)
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(d)
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  if (sameDay) return time
  return `${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d)}, ${time}`
}
