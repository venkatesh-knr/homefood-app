import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useHistorySlots } from '../lib/plannerQueries'
import { useAllNutrition, useNutritionTargets } from '../lib/nutritionQueries'
import { dayTotalsFor, summarisePeriod, targetFor } from '../lib/nutrition'
import { ageBand, avatarColor } from '../lib/people'
import { toISODate } from '../lib/planner'
import { useCanPlanDate } from '../lib/useCanPlan'
import { FullPageMessage } from '../components/ui'
import { PeriodControls, usePeriod } from '../components/PeriodControls'
import { TargetBars } from '../components/TargetBars'
import { BackHeader, NutritionDisclaimer } from './NutritionPage'

/** "Family nutrition": a week or month summary per family member, for Admins and whoever is Planner today. */
export default function FamilyNutritionPage() {
  const { t } = useTranslation()
  const { household } = useHome()
  const allowed = useCanPlanDate(toISODate(new Date()))
  const period = usePeriod('week')
  const { data: members } = useMembers(household.id)
  const { data: slots, isLoading } = useHistorySlots(household.id, period.bounds.from, period.to)
  const { data: byDish } = useAllNutrition()
  const { data: targets } = useNutritionTargets()

  const people = useMemo(() => (members ?? []).filter((m) => m.kind === 'family'), [members])
  const rows = useMemo(
    () =>
      people.map((p, i) => {
        const days = dayTotalsFor(slots ?? [], p.id, byDish ?? new Map(), period.today)
        const resolved = targets && targets.length > 0 ? targetFor(p, targets) : null
        return { p, i, resolved, summary: resolved ? summarisePeriod(days, resolved.target) : null }
      }),
    [people, slots, byDish, targets, period.today],
  )

  if (!allowed) {
    return (
      <FullPageMessage>
        <p className="text-muted">{t('nutrition.familyOnly')}</p>
      </FullPageMessage>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
      <BackHeader title={t('nutrition.family')} subtitle={t('nutrition.familySub')} to="/home" />
      <PeriodControls period={period} />

      {isLoading ? (
        <p className="py-6 text-center text-muted">{t('common.loading')}</p>
      ) : (
        rows.map(({ p, i, resolved, summary }) => (
          <section key={p.id} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold text-white" style={{ background: avatarColor(i, p.kind) }}>
                {p.display_name.trim()[0]?.toUpperCase()}
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-[15.5px] font-semibold">{p.display_name}</span>
                <span className="text-[12.5px] text-muted">{ageBand(p.birth_year) ? t(`people.ageBand.${ageBand(p.birth_year)}`) : t('nutrition.assume.age')}</span>
              </div>
              {summary && summary.dayCount > 0 && (
                <span className="text-right">
                  <span className="block font-display text-[18px] font-bold">{Math.round(summary.average.kcal)}</span>
                  <span className="block text-[11.5px] text-muted">{t('nutrition.kcalPerDay', { percent: summary.percentOfTarget.kcal })}</span>
                </span>
              )}
            </div>
            {!resolved ? (
              <p className="text-[13px] text-muted">{t('nutrition.unavailable')}</p>
            ) : !summary || summary.dayCount === 0 ? (
              <p className="text-[13px] text-muted">{t('nutrition.emptyPerson')}</p>
            ) : (
              <>
                <TargetBars average={summary.average} target={resolved.target} percent={summary.percentOfTarget} compact />
                {summary.tips.map((tip) => (
                  <p key={tip.key} className="text-[13px] text-ink-soft">
                    {t(`nutrition.tip.${tip.key}`, tip.params)}
                  </p>
                ))}
              </>
            )}
          </section>
        ))
      )}
      <NutritionDisclaimer />
    </main>
  )
}
