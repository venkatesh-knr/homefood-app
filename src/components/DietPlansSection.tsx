import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { Toggle } from './ui'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { describeError } from '../lib/errors'
import { usePlanFollows } from '../lib/planQueries'
import { startPlan, stopPlan } from '../lib/planMutations'
import { PLAN_KEYS, eligibility, groupByPlan, type PlanKey } from '../lib/dietPlans'
import type { Profile } from '../lib/people'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`
const THIS_YEAR = new Date().getFullYear()

/** The plan rows of Diets and fasting: who follows what, and a panel to start a plan for one person, a couple or a group.
 * A person starts their own; the Admin starts one for a family member nobody has logged in as yet. Guidance, never a diagnosis. */
export function DietPlansSection() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const { data: follows } = usePlanFollows(household.id)
  const family = (members ?? []).filter((m) => m.kind === 'family')
  const nameOf = (id: string | null) => (id ? (members ?? []).find((m) => m.id === id)?.display_name ?? '' : '')
  const canSet = (m: Profile) => m.id === profile.id || (profile.role === 'admin' && m.user_id === null)
  const groups = groupByPlan(follows ?? [])
  const [pick, setPick] = useState<PlanKey>('low_carb')
  const [who, setWho] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [changing, setChanging] = useState<PlanKey | null>(null)
  const dateFmt = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' })

  const planName = (p: PlanKey) => t(`plans.name.${p}`)
  const blockReason = (m: Profile, plan: PlanKey): string | null => {
    if (!canSet(m)) return t('plans.onlyThey', { name: m.display_name })
    const e = eligibility(plan, m.birth_year, THIS_YEAR)
    if (!e.ok) return t(e.reason === 'under18' ? 'plans.under18' : 'plans.noYear', { name: m.display_name })
    return null
  }
  const choosable = (m: Profile) => blockReason(m, pick) === null
  const picked = who.filter((id) => family.some((m) => m.id === id && choosable(m)))
  const reasons = family.map((m) => ({ m, reason: blockReason(m, pick) })).filter((x) => x.reason && canSet(x.m))

  async function onStart() {
    setBusy(true)
    setError(null)
    try {
      await startPlan(household.id, pick, picked)
      setWho([])
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section aria-label={t('plans.title', { home: household.name })} className="flex flex-col gap-2">
        <h2 className="px-1 font-display text-[17px] font-semibold">{t('plans.title', { home: household.name })}</h2>
        {groups.length === 0 && <p className="rounded-2xl bg-sand px-4 py-3.5 text-[14px] text-ink-soft">{t('plans.none')}</p>}
        {groups.map((g) => {
          const names = g.follows.map((f) => nameOf(f.profile_id)).filter(Boolean)
          const first = g.follows[0]!
          const setter = first.set_by && first.set_by !== first.profile_id ? nameOf(first.set_by) : ''
          return (
            <div key={g.plan} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <h3 className="min-w-0 break-words font-display text-[16px] font-semibold">{planName(g.plan)}</h3>
                <span className="rounded-full bg-dinner-tint px-2.5 py-1 text-[12.5px] font-semibold text-dinner-ink">{names.join(' + ')}</span>
              </div>
              <p className="text-[13.5px]"><span className="font-semibold">{t('plans.avoid')}:</span> {t(`plans.avoidText.${g.plan}`)}</p>
              <p className="text-[13.5px]"><span className="font-semibold">{t('plans.focus')}:</span> {t(`plans.focusText.${g.plan}`)}</p>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="min-w-0 text-[12.5px] text-muted">
                  {t('plans.since', { date: dateFmt.format(new Date(`${first.since}T00:00:00`)) })}
                  {setter && ` · ${t('plans.setBy', { name: setter })}`}
                </span>
                <button type="button" onClick={() => setChanging(g.plan)} aria-label={t('plans.changeAria', { plan: planName(g.plan) })} className="min-h-[44px] px-1 text-[13.5px] font-semibold text-saffron-ink underline">{t('plans.change')}</button>
              </div>
            </div>
          )
        })}
      </section>

      <section aria-label={t('plans.startTitle')} className="flex flex-col gap-2">
        <h2 className="px-1 font-display text-[17px] font-semibold">{t('plans.startTitle')}</h2>
        <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-saffron bg-surface p-3.5">
          <div role="radiogroup" aria-label={t('plans.startTitle')} className="flex flex-wrap gap-1.5">
            {PLAN_KEYS.map((p) => (
              <button key={p} type="button" role="radio" aria-checked={pick === p} onClick={() => setPick(p)} className={chip(pick === p)}>{planName(p)}</button>
            ))}
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-sand px-3 py-2.5 text-[13.5px]">
            <p><span className="font-semibold">{t('plans.avoid')}:</span> {t(`plans.avoidText.${pick}`)}</p>
            <p><span className="font-semibold">{t('plans.focus')}:</span> {t(`plans.focusText.${pick}`)}</p>
            <p className="text-ink-soft">{t('plans.fitHint')}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span id="plan-who" className="text-[12.5px] font-semibold text-ink-soft">{t('plans.whoFollows')}</span>
            <div role="group" aria-labelledby="plan-who" className="flex flex-wrap gap-1.5">
              {family.map((m) => {
                const ok = choosable(m)
                const on = picked.includes(m.id)
                return (
                  <button key={m.id} type="button" aria-pressed={on} disabled={!ok} onClick={() => setWho(on ? who.filter((x) => x !== m.id) : [...who, m.id])} className={`${chip(on)} disabled:opacity-40`}>
                    {m.display_name}
                  </button>
                )
              })}
            </div>
            {reasons.map((x) => <p key={x.m.id} className="text-[12.5px] text-ink-soft">{x.reason}</p>)}
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-soft">{t('plans.disclaimer')}</p>
          {error && <p role="alert" className="text-[13px] text-alert">{error}</p>}
          <button type="button" disabled={busy || picked.length === 0} onClick={onStart} className="min-h-[52px] rounded-2xl bg-ink px-3 text-center text-[15px] leading-snug font-semibold text-cream disabled:opacity-50">
            {picked.length === 0 ? t('plans.pickWho') : t('plans.start', { plan: planName(pick), count: picked.length })}
          </button>
        </div>
      </section>

      {changing && <ChangeSheet plan={changing} family={family} follows={follows ?? []} canSet={canSet} blockReason={blockReason} planName={planName(changing)} onClose={() => setChanging(null)} householdId={household.id} />}
    </div>
  )
}

function ChangeSheet({ plan, family, follows, canSet, blockReason, planName, onClose, householdId }: {
  plan: PlanKey; family: Profile[]; follows: { profile_id: string; plan: PlanKey }[]; canSet: (m: Profile) => boolean
  blockReason: (m: Profile, p: PlanKey) => string | null; planName: string; onClose: () => void; householdId: string
}) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const following = (id: string) => follows.some((f) => f.profile_id === id && f.plan === plan)

  async function toggle(m: Profile, on: boolean) {
    setBusy(m.id)
    setError(null)
    try {
      if (on) await startPlan(householdId, plan, [m.id])
      else await stopPlan(householdId, plan, [m.id])
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog title={t('plans.changeTitle', { plan: planName })} onClose={onClose}>
      <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 break-words font-display text-[19px] font-bold leading-tight">{t('plans.changeTitle', { plan: planName })}</h2>
          <button type="button" onClick={onClose} className="min-h-[44px] shrink-0 rounded-xl bg-ink px-4 text-[14px] font-semibold text-cream">{t('shopping.done')}</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {family.map((m, i) => {
            const on = following(m.id)
            const reason = on ? (canSet(m) ? null : t('plans.onlyThey', { name: m.display_name })) : blockReason(m, plan)
            return (
              <div key={m.id} className={`flex flex-col gap-0.5 px-4 py-2 ${i > 0 ? 'border-t border-line' : ''}`}>
                <div className={`flex min-h-[48px] items-center justify-between gap-3 ${busy === m.id ? 'opacity-60' : ''}`}>
                  <span className="min-w-0 break-words text-[15px]">{m.display_name}</span>
                  {reason ? <span className="text-[12px] text-muted">{on ? t('plans.following') : ''}</span> : <Toggle checked={on} onChange={(v) => void toggle(m, v)} label={m.display_name} />}
                </div>
                {reason && <p className="pb-1 text-[12px] text-ink-soft">{reason}</p>}
              </div>
            )
          })}
        </div>
        {error && <p role="alert" className="text-[13px] text-alert">{error}</p>}
        <p className="text-[12.5px] leading-relaxed text-ink-soft">{t('plans.disclaimer')}</p>
      </div>
    </Dialog>
  )
}
