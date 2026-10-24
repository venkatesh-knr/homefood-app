import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useHistorySlots } from '../lib/plannerQueries'
import { useAllNutrition, useNutritionTargets } from '../lib/nutritionQueries'
import { useAttendance } from '../lib/attendanceQueries'
import { dayTotalsFor, summarisePeriod, targetFor } from '../lib/nutrition'
import { Card } from '../components/ui'
import { BackHeader } from '../components/BackHeader'
import { PeriodControls, usePeriod } from '../components/PeriodControls'
import { TargetBars } from '../components/TargetBars'
import { ProteinCard } from '../components/ProteinCard'
import { PlanFocus } from '../components/PlanFocus'
import { useIntake } from '../lib/intakeQueries'
import { extrasByDay, mergeMealsAndExtras } from '../lib/intake'

export function NutritionDisclaimer() {
  const { t } = useTranslation()
  return (
    <p className="rounded-2xl bg-sand px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-soft">
      {t('nutrition.disclaimer')} {t('attendance.nutritionNote')} {t('outsideNutrition.note')}
    </p>
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
  const { data: attendance } = useAttendance(period.bounds.from, period.to)

  const { data: intake } = useIntake(profile.id, period.bounds.from, period.to)
  const mealDays = useMemo(() => dayTotalsFor(slots ?? [], profile.id, byDish ?? new Map(), period.today, attendance ?? []), [slots, profile.id, byDish, period.today, attendance])
  const merged = useMemo(() => mergeMealsAndExtras(mealDays, extrasByDay(intake ?? [])), [mealDays, intake])
  const days = merged.days
  const resolved = targets && targets.length > 0 ? targetFor(profile, targets) : null
  const summary = resolved ? summarisePeriod(days, resolved.target) : null
  const unknown = mealDays.reduce((n, d) => n + d.unknownMeals, 0)
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
      <BackHeader title={t('nutrition.mine')} subtitle={t('nutrition.mineSub')} to="/home" />
      <PeriodControls period={period} />
      <ProteinCard person={profile} date={period.today} />

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
          <PlanFocus profileId={profile.id} usualProteinG={resolved.target.protein_g} />

          {isLoading ? (
            <p className="py-6 text-center text-muted">{t('common.loading')}</p>
          ) : !summary || (summary.dayCount === 0 && summary.fastingDays === 0) ? (
            <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('nutrition.empty')}</p>
          ) : (
            <>
              {summary.dayCount === 0 ? (
                <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('nutrition.onlyFasting')}</p>
              ) : (
              <Card className="flex flex-col gap-3 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[26px] font-bold">{Math.round(summary.average.kcal)}</span>
                  <span className="text-[12.5px] text-ink-soft">{t('nutrition.kcalPerDay', { percent: summary.percentOfTarget.kcal })}</span>
                </div>
                <TargetBars average={summary.average} target={resolved.target} percent={summary.percentOfTarget} />
                <span className="text-[12px] text-muted">{t('nutrition.basedOnDays', { count: summary.dayCount })}</span>
                {summary.fastingDays > 0 && <span className="text-[12px] text-muted">{t('nutrition.fastingDaysNote', { count: summary.fastingDays })}</span>}
              </Card>
              )}

              {summary.tips.length > 0 && (
                <section className="flex flex-col gap-1.5">
                  <h2 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('nutrition.tips')}</h2>
                  {summary.tips.map((tip) => (
                    <p key={tip.key} className="rounded-2xl border border-line bg-surface px-3.5 py-3 text-[14px]">
                      {t(`nutrition.tip.${tip.key}`, tip.params)}
                    </p>
                  ))}
                </section>
              )}

              <section className="flex flex-col gap-1.5">
                <h2 className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{t('nutrition.byDay')}</h2>
                {[...days].reverse().map((d) => (
                  <div key={d.date} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-[14px] ta:flex-col ta:items-start">
                    <span className="font-semibold">{dayFmt.format(new Date(`${d.date}T00:00:00`))}</span>
                    <span className="text-right text-ink-soft ta:text-left">
                      {(d.fastedMeals ?? 0) > 0 && <span className="mb-0.5 block text-[12.5px] font-semibold text-saffron-ink">{t('nutrition.fastingDayNote')}</span>}
                      {d.meals > 0 && <>{Math.round(d.totals.kcal)} kcal · {Math.round(d.totals.protein_g)} g {t('nutrition.n.protein_g').toLowerCase()}</>}
                      {(merged.parts.get(d.date)?.extraItems ?? 0) > 0 && (
                        <span className="block text-[12px] text-muted">
                          {t('extras.partsLine', { meals: Math.round(merged.parts.get(d.date)!.meals.kcal), extras: Math.round(merged.parts.get(d.date)!.extras.kcal) })}
                        </span>
                      )}
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
