import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateHousehold } from '../lib/mutations'
import { describeError } from '../lib/errors'
import { BALANCE_RANGE, DEFAULT_BALANCE, limitsOf, type BalanceLimits } from '../lib/balance'
import type { Household } from '../lib/people'
import { Card } from './ui'

const FIELD: Record<keyof BalanceLimits, 'balance_same_main' | 'balance_fried' | 'balance_out_run'> = {
  sameMain: 'balance_same_main',
  fried: 'balance_fried',
  outRun: 'balance_out_run',
}

/** Admin-only: the numbers behind the Week tab's gentle balance banner. */
export function BalanceLimitsCard({ household }: { household: Household }) {
  const { t } = useTranslation()
  const limits = limitsOf(household)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function change(key: keyof BalanceLimits, value: number) {
    const { min, max } = BALANCE_RANGE[key]
    if (value < min || value > max) return
    setBusy(true)
    setError(null)
    try {
      await updateHousehold(household.id, { [FIELD[key]]: value })
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('balance.settingsTitle')}</span>
      <Card className="flex flex-col">
        {(Object.keys(FIELD) as (keyof BalanceLimits)[]).map((key) => {
          const label = t(`balance.limit.${key}`)
          return (
            <div key={key} className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5 text-[14px]">
              <span id={`balance-${key}`} className="flex-1">
                {label}
              </span>
              <div role="group" aria-labelledby={`balance-${key}`} className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={t('balance.decrease')}
                  disabled={busy || limits[key] <= BALANCE_RANGE[key].min}
                  onClick={() => void change(key, limits[key] - 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-[20px] disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-7 text-center font-display text-[17px] font-semibold" aria-live="polite">
                  {limits[key]}
                </span>
                <button
                  type="button"
                  aria-label={t('balance.increase')}
                  disabled={busy || limits[key] >= BALANCE_RANGE[key].max}
                  onClick={() => void change(key, limits[key] + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-[20px] disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
        <p className="px-3.5 py-3 text-[12.5px] text-muted">
          {t('balance.settingsHint', { same: DEFAULT_BALANCE.sameMain, fried: DEFAULT_BALANCE.fried, run: DEFAULT_BALANCE.outRun })}
        </p>
      </Card>
      {error && <p role="alert" className="rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}
    </div>
  )
}
