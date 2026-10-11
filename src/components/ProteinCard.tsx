import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useHistorySlots } from '../lib/plannerQueries'
import { useAllNutrition, useNutritionTargets } from '../lib/nutritionQueries'
import { useAttendance } from '../lib/attendanceQueries'
import { useIntake, usePersonalGoals } from '../lib/intakeQueries'
import { dayTotalsFor, targetFor } from '../lib/nutrition'
import { goalFor, progressOf, sumIntake } from '../lib/intake'
import type { Profile } from '../lib/people'

/** "Protein today: 52 of 60 g": the planned meals plus the extras, against the person's own goal or the suggested daily value. Gentle: it never warns. */
export function ProteinCard({ person, date }: { person: Profile; date: string }) {
  const { t } = useTranslation()
  const { household } = useHome()
  const { data: slots } = useHistorySlots(household.id, date, date)
  const { data: byDish } = useAllNutrition()
  const { data: targets } = useNutritionTargets()
  const { data: attendance } = useAttendance(date, date)
  const { data: intake } = useIntake(person.id, date, date)
  const { data: goals } = usePersonalGoals(person.id)

  const resolved = targets && targets.length > 0 ? targetFor(person, targets) : null
  if (!resolved) return null
  const meals = dayTotalsFor(slots ?? [], person.id, byDish ?? new Map(), date, attendance ?? [])[0]?.totals.protein_g ?? 0
  const eaten = meals + sumIntake(intake ?? []).totals.protein_g
  const goal = goalFor(goals, resolved.target).protein
  const p = progressOf(eaten, goal.value)

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink-soft">{t('protein.title')}</span>
        <span className="text-[12px] text-muted">{goal.personal ? t('protein.yourGoal') : t('protein.suggestedGoal')}</span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-[20px] font-bold">{t('protein.of', { eaten: p.eaten, goal: p.goal })}</span>
        <span className="text-[13px] text-ink-soft">{p.reached ? t('protein.reached') : t('protein.toGo', { n: p.remaining })}</span>
      </div>
      <div role="progressbar" aria-label={t('protein.title')} aria-valuemin={0} aria-valuemax={p.goal} aria-valuenow={Math.min(p.eaten, p.goal)} className="h-2.5 overflow-hidden rounded-full bg-sand">
        <div className={`h-full rounded-full ${p.reached ? 'bg-leaf' : 'bg-saffron'}`} style={{ width: `${p.percent}%` }} />
      </div>
      <span className="text-[11.5px] text-muted">{t('protein.mealsAndExtras')}</span>
    </div>
  )
}
