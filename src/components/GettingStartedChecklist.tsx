import { useTranslation } from 'react-i18next'
import { useInvites } from '../lib/queries'
import { useHasPlannedMeals, useHasPublishedWeek } from '../lib/plannerQueries'
import { usePosterOpened } from '../lib/onboarding'
import { Card } from './ui'

const STEPS = ['people', 'invite', 'plan', 'publish', 'poster'] as const

export function GettingStartedChecklist({ householdId }: { householdId: string }) {
  const { t } = useTranslation()
  const { data: invites } = useInvites(householdId)
  const { data: hasPlanned } = useHasPlannedMeals(householdId)
  const { data: hasPublished } = useHasPublishedWeek(householdId)
  const [posterOpened] = usePosterOpened(householdId)

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

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[16px] font-semibold">{t('invite.gettingStarted', { done: doneCount, total: STEPS.length })}</span>
      <Card className="flex flex-col px-3.5 py-1">
        {STEPS.map((key) => (
          <div key={key} className="flex items-center gap-3 py-2.5">
            <span
              className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${
                done[key] ? 'bg-leaf text-white' : 'border-2 border-line-strong'
              }`}
            >
              {done[key] && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              )}
            </span>
            <span className={`text-[14.5px] ${done[key] ? 'text-muted line-through' : 'text-ink'}`}>{t(`invite.steps.${key}`)}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
