import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { setVote } from '../lib/discussionMutations'
import { nextVote, type SlotDiscussionCounts, type Vote } from '../lib/discussion'
import { describeError } from '../lib/errors'
import { VoteIcon } from './ui'

/** Agree / Disagree for one meal straight from a card (Today), plus the comments and "suggest" links into the thread.
 * `full` is the big next-up card, `compact` the smaller rest-of-day rows. */
export function VoteRow({
  slotId,
  counts,
  variant,
  onDiscuss,
}: {
  slotId: string
  counts: SlotDiscussionCounts
  variant: 'full' | 'compact'
  onDiscuss: () => void
}) {
  const { t } = useTranslation()
  const { profile } = useHome()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function vote(v: Vote) {
    setBusy(true)
    setError(null)
    try {
      await setVote(slotId, profile.id, nextVote(counts.myVote, v))
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  const button = (v: Vote) => {
    const on = counts.myVote === v
    const agree = v === 'agree'
    const n = agree ? counts.agree : counts.disagree
    const tone = on ? (agree ? 'border-leaf bg-leaf-tint text-leaf' : 'border-alert bg-alert-tint text-alert') : 'border-line-strong bg-white'
    return variant === 'full' ? (
      <button
        type="button"
        aria-pressed={on}
        disabled={busy}
        onClick={() => void vote(v)}
        className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border-[1.5px] text-[14.5px] font-semibold ${tone}`}
      >
        <VoteIcon kind={v} size={17} />
        {t(agree ? 'discussion.agree' : 'discussion.disagree')} · {n}
      </button>
    ) : (
      <button
        type="button"
        aria-pressed={on}
        aria-label={t(agree ? 'discussion.agree' : 'discussion.disagree')}
        disabled={busy}
        onClick={() => void vote(v)}
        className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold ${tone}`}
      >
        <VoteIcon kind={v} size={15} />
        {n}
      </button>
    )
  }

  const commentsText = t(counts.comments === 1 ? 'discussion.commentsOne' : 'discussion.commentsOther', { count: counts.comments })

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      {variant === 'full' ? (
        <>
          <div className="flex gap-2.5">
            {button('agree')}
            {button('disagree')}
          </div>
          <div className="flex items-center justify-between text-[13px] font-semibold text-saffron-ink">
            <button type="button" onClick={onDiscuss} className="underline">
              {commentsText}
              {counts.openSuggestions > 0 ? ` · ${t('discussion.suggestion').toLowerCase()} ${counts.openSuggestions}` : ''}
            </button>
            <button type="button" onClick={onDiscuss} className="underline">
              {t('discussion.suggestLink')}
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          {button('agree')}
          {button('disagree')}
          <button type="button" onClick={onDiscuss} className="ml-auto text-[13px] font-semibold text-saffron-ink underline">
            {commentsText}
          </button>
        </div>
      )}
      {error && <p className="text-[12.5px] text-alert">{error}</p>}
    </div>
  )
}
