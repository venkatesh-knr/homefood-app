import { useTranslation } from 'react-i18next'
import { Card } from './ui'

// Phase 1 only tracks the two steps this build step actually finished (adding
// people and creating the invite link) — the rest are a preview of what's next,
// not yet backed by real progress tracking. That lands properly in Step 6.
const STEPS = ['people', 'invite', 'plan', 'publish', 'poster'] as const
const DONE_COUNT = 2

export function GettingStartedChecklist() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[16px] font-semibold">
        {t('invite.gettingStarted', { done: DONE_COUNT, total: STEPS.length })}
      </span>
      <Card className="flex flex-col px-3.5 py-1">
        {STEPS.map((key, i) => {
          const done = i < DONE_COUNT
          return (
            <div key={key} className="flex items-center gap-3 py-2.5">
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${
                  done ? 'bg-leaf text-white' : 'border-2 border-line-strong'
                }`}
              >
                {done && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </span>
              <span className={`text-[14.5px] ${done ? 'text-muted line-through' : 'text-ink'}`}>{t(`invite.steps.${key}`)}</span>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
