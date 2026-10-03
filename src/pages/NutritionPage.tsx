import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useHistorySlots } from '../lib/plannerQueries'
import { useAllNutrition, useNutritionTargets } from '../lib/nutritionQueries'
import { dayTotalsFor, summarisePeriod, targetFor } from '../lib/nutrition'
import { Card } from '../components/ui'
import { PeriodControls, usePeriod } from '../components/PeriodControls'
import { TargetBars } from '../components/TargetBars'

export function NutritionDisclaimer() {
  const { t } = useTranslation()
  return <p className="rounded-2xl bg-sand px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-soft">{t('nutrition.disclaimer')}</p>
}

export function BackHeader({ title, subtitle, to }: { title: string; subtitle?: string; to: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2 pt-3">
      <button type="button" onClick={() => navigate(to)} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="flex flex-col">
        <span className="font-display text-[18px] font-semibold">{title}</span>
        {subtitle && <span className="text-[12px] text-muted">{subtitle}</span>}
      </div>
    </div>
  )
}

/** "My nutrition": what the meals you are marked as eating add up to, against a target for your age, sex and activity. */
export default function NutritionPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ta' ? 'ta-IN' : 'en-IN'
  const { profile, household } = useHome()
  const period = usePeriod('week')
  const { data: slots, isLoading } = useHistorySlots(household.id, period.bounds.from, period.to)
  const { data: byDish } = useAllNutrition()
  const { data: targets } = useNutritionTargets()

  const days = useMemo(() => dayTotalsFor(slots ?? [], profile.id, byDish ?? new Map(), period.today), [slots, profile.id, byDish, period.today])
  const resolved = targets && targets.length > 0 ? targetFor(profile, targets) : null
  const summary = resolved ? summarisePeriod(days, resolved.target) : null
  const unknown = days.reduce((n, d) => n + d.unknownMeals, 0)
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
      <BackHeader title={t('nutrition.mine')} subtitle={t('nutrition.mineSub')} to="/home" />
      <PeriodControls period={period} />

      {!resolved ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('nutrition.unavailable')}</p>
      ) : (
        <>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t('nutrition.yourTarget')}</span>
            <span className="font-display text-[22px] font-bold">{t('nutrition.targetKcal', { kcal: Math.round(resolved.target.kcal) })}</span>
            {resolved.assumed.length > 0 && (
              <span className="text-[12.5px] text-muted">
                {t('nutrition.assumed', { what: resolved.assumed.map((a) => t(`nutrition.assume.${a}`)).join(', ') })}
              </span>
            )}
          </Card>

          {isLoading ? (
            <p className="py-6 text-center text-muted">{t('common.loading')}</p>
          ) : !summary || summary.dayCount === 0 ? (
            <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('nutrition.empty')}</p>
          ) : (
            <>
              <Card className="flex flex-col gap-3 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[26px] font-bold">{Math.round(summary.average.kcal)}</span>
                  <span className="text-[12.5px] text-ink-soft">{t('nutrition.kcalPerDay', { percent: summary.percentOfTarget.kcal })}</span>
                </div>
                <TargetBars average={summary.average} target={resolved.target} percent={summary.percentOfTarget} />
                <span className="text-[12px] text-muted">{t('nutrition.basedOnDays', { count: summary.dayCount })}</span>
              </Card>

              {summary.tips.length > 0 && (
                <section className="flex flex-col gap-1.5">
                  <h2 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('nutrition.tips')}</h2>
                  {summary.tips.map((tip) => (
                    <p key={tip.key} className="rounded-2xl border border-line bg-white px-3.5 py-3 text-[14px]">
                      {t(`nutrition.tip.${tip.key}`, tip.params)}
                    </p>
                  ))}
                </section>
              )}

              <section className="flex flex-col gap-1.5">
                <h2 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('nutrition.byDay')}</h2>
                {[...days].reverse().map((d) => (
                  <div key={d.date} className="flex items-center justify-between rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[14px]">
                    <span className="font-semibold">{dayFmt.format(new Date(`${d.date}T00:00:00`))}</span>
                    <span className="text-ink-soft">
                      {Math.round(d.totals.kcal)} kcal · {Math.round(d.totals.protein_g)} g {t('nutrition.n.protein_g').toLowerCase()}
                    </span>
                  </div>
                ))}
              </section>
            </>
          )}
          {unknown > 0 && <p className="text-[12.5px] text-muted">{t('nutrition.unknownMeals', { count: unknown })}</p>}
        </>
      )}
      <NutritionDisclaimer />
    </main>
  )
}
