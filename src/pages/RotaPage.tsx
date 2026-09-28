import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { usePlannerTurns } from '../lib/plannerQueries'
import { assignPlannerTurn } from '../lib/plannerMutations'
import { addDays, toISODate, weekDates, weekStartOf, weekdayLetter, type TurnScope } from '../lib/planner'
import { avatarColor } from '../lib/people'
import { Button } from '../components/ui'

const THIS_WEEK_START = toISODate(weekStartOf(new Date()))
const UPCOMING_WEEKS = Array.from({ length: 6 }, (_, i) => addDays(THIS_WEEK_START, i * 7))

export default function RotaPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const navigate = useNavigate()
  const { profile, household } = useHome()
  const isAdmin = profile.role === 'admin'

  const { data: members } = useMembers(household.id)
  const { data: turns } = usePlannerTurns(household.id)
  const canPlan = (members ?? []).filter((m) => m.can_login)
  const memberById = useMemo(() => new Map((members ?? []).map((m, i) => [m.id, { ...m, color: avatarColor(i, m.kind) }])), [members])

  const [assigning, setAssigning] = useState<string | null>(null) // week start being assigned
  const [form, setForm] = useState({ profileId: '', scope: 'week' as TurnScope })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monthLabel = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { month: 'long', year: 'numeric' }).format(new Date())
  const rangeFormatter = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' })

  async function onAssign(weekStart: string) {
    if (!form.profileId) return
    setBusy(true)
    setError(null)
    try {
      const endDate = form.scope === 'day' ? weekStart : form.scope === 'week' ? addDays(weekStart, 6) : addDays(weekStart, 27)
      await assignPlannerTurn(household.id, form.profileId, form.scope, weekStart, endDate)
      setAssigning(null)
      setForm({ profileId: '', scope: 'week' })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8">
      <div className="flex items-center gap-2 pt-3">
        <button type="button" onClick={() => navigate('/week')} aria-label={t('common.back')} className="flex h-11 w-11 items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex flex-col">
          <span className="font-display text-[18px] font-semibold">{t('rota.title')}</span>
          <span className="text-[12px] text-muted">{t('rota.subtitle', { month: monthLabel })}</span>
        </div>
      </div>

      <p className="mt-2.5 rounded-2xl bg-sand px-3.5 py-3 text-[13.5px] leading-relaxed text-ink-soft">{t('rota.explain')}</p>

      <div className="mt-3 flex flex-col gap-2.5">
        {UPCOMING_WEEKS.map((weekStart) => {
          const dates = weekDates(weekStart)
          const assignedByDay = dates.map((d) => turns?.find((tn) => tn.status === 'approved' && d >= tn.start_date && d <= tn.end_date))
          const uniqueAssignees = [...new Set(assignedByDay.map((tn) => tn?.profile_id).filter(Boolean))]
          const isFree = uniqueAssignees.length === 0
          const isThisWeek = weekStart === THIS_WEEK_START
          const tag = isFree
            ? t('rota.free')
            : uniqueAssignees.length === 1
              ? memberById.get(uniqueAssignees[0]!)?.display_name
              : uniqueAssignees.map((id) => memberById.get(id!)?.display_name).join(' · ')

          return (
            <div key={weekStart} className={`flex flex-col gap-2.5 rounded-2xl border bg-white p-3.5 ${isThisWeek ? 'border-2 border-saffron' : isFree ? 'border-dashed border-line-strong' : 'border-line'}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[15px] font-semibold">
                  {rangeFormatter.format(new Date(`${weekStart}T00:00:00`))} – {rangeFormatter.format(new Date(`${addDays(weekStart, 6)}T00:00:00`))}
                </span>
                <span className="text-[12px] font-semibold text-ink-soft">
                  {isThisWeek && !isFree ? `${t('rota.thisWeek')} · ${tag}` : tag}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dates.map((d, i) => {
                  const tn = assignedByDay[i]
                  const member = tn ? memberById.get(tn.profile_id) : undefined
                  return (
                    <span
                      key={d}
                      className="flex h-11 flex-col items-center justify-center gap-0.5 rounded-[10px] text-white"
                      style={{ background: member?.color ?? '#F1E7D6', color: member ? '#FFFFFF' : '#6E6259' }}
                    >
                      <span className="text-[10px] opacity-85">{weekdayLetter(d)}</span>
                      <span className="text-[12px] font-semibold">{member ? member.display_name.trim()[0]?.toUpperCase() : '—'}</span>
                    </span>
                  )
                })}
              </div>

              {isAdmin && (
                <>
                  {assigning === weekStart ? (
                    <div className="flex flex-col gap-2 rounded-xl bg-sand p-2.5">
                      <select
                        value={form.profileId}
                        onChange={(e) => setForm((f) => ({ ...f, profileId: e.target.value }))}
                        className="h-10 rounded-lg border border-line-strong bg-white px-2.5 text-[13.5px]"
                      >
                        <option value="">{t('rota.person')}</option>
                        {canPlan.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.display_name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        {(['day', 'week', 'month'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            aria-pressed={form.scope === s}
                            onClick={() => setForm((f) => ({ ...f, scope: s }))}
                            className={`h-9 flex-1 rounded-lg text-[13px] font-semibold ${form.scope === s ? 'bg-ink text-cream' : 'border border-line-strong bg-white'}`}
                          >
                            {t(`rota.scope${s === 'day' ? 'Day' : s === 'week' ? 'Week' : 'Month'}`)}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setAssigning(null)}>
                          {t('dishes.form.cancel')}
                        </Button>
                        <Button className="flex-1" disabled={busy || !form.profileId} onClick={() => onAssign(weekStart)}>
                          {t('rota.save')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setAssigning(weekStart)} className="self-start text-[13px] font-semibold text-saffron-ink">
                      {t('rota.assign')}
                    </button>
                  )}
                </>
              )}
              {!isAdmin && isFree && <p className="text-[12.5px] text-muted">{t('rota.askAdmin')}</p>}
            </div>
          )
        })}
      </div>

      {error && <p className="mt-3 rounded-xl bg-alert-tint px-4 py-3 text-[14px] text-alert">{error}</p>}
    </main>
  )
}
