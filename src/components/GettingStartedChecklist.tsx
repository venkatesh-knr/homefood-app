import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInvites } from '../lib/queries'
import { useHasPlannedMeals, useHasPublishedWeek } from '../lib/plannerQueries'
import { usePosterOpened } from '../lib/onboarding'
import { Card } from './ui'

const STEPS = ['people', 'invite', 'plan', 'publish', 'poster'] as const

/** `compact` (the Home tab): one line that opens the list, and nothing at all once every step is done. */
export function GettingStartedChecklist({ householdId, compact = false }: { householdId: string; compact?: boolean }) {
  const { t } = useTranslation()
  const { data: invites } = useInvites(householdId)
  const { data: hasPlanned } = useHasPlannedMeals(householdId)
  const { data: hasPublished } = useHasPublishedWeek(householdId)
  const [posterOpened] = usePosterOpened(householdId)
  const [open, setOpen] = useState(false)

  // "people" is always true by the time this renders — reaching it needs a
  // household with at least the Admin already set up.
  const done: Record<(typeof STEPS)[number], boolean> = {
    people: true,
    invite: (invites?.length ?? 0) > 0,
    plan: Boolean(hasPlanned),
    publish: Boolean(hasPublished),
    poster: posterOpened,
  }
  const doneCount = STEPS.filter((s) => done[s]).length
  if (compact && doneCount === STEPS.length) return null
  const title = t('invite.gettingStarted', { done: doneCount, total: STEPS.length })

  return (
    <div className="flex flex-col gap-2">
      {compact ? (
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 text-left">
          <span className="font-display text-[15.5px] font-semibold">{title}</span>
          <span aria-hidden="true" className={`text-[20px] leading-none text-muted transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
        </button>
      ) : (
        <span className="font-display text-[16px] font-semibold">{title}</span>
      )}
      {(!compact || open) && <Card className="flex flex-col px-3.5 py-1">
        {STEPS.map((key) => (
          <div key={key} className="flex items-center gap-3 py-2.5">
            <span
              className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${
                done[key] ? 'bg-leaf text-on-solid' : 'border-2 border-line-strong'
              }`}
            >
              {done[key] && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              )}
            </span>
            <span className="text-[14.5px] text-ink">{t(`invite.steps.${key}`)}</span>
          </div>
        ))}
      </Card>}
    </div>
  )
}
