import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useHome } from '../lib/homeContext'
import { useCanEditPrep } from '../lib/useCanPlan'
import { leadNote, prepOptions, taskText, type PrepKind, type PrepLead, type PrepRow } from '../lib/prep'
import { removeOwnPrep, saveOwnPrep, setDefaultPrepOff, usePrepOff, usePrepRows, type OwnPrepInput } from '../lib/prepQueries'
import { describeError } from '../lib/errors'
import { Toggle } from './ui'

const KINDS: PrepKind[] = ['soak', 'batter_ferment', 'set_curd', 'thaw', 'marinate', 'other']
const chip = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`
const field = 'min-h-[48px] w-full rounded-xl border-[1.5px] border-line-strong bg-surface px-3.5 text-[15px] font-normal text-ink'

type FormState = { id?: string; input: OwnPrepInput }
const blank = (): FormState => ({ input: { kind: 'other', lead: 'night_before', hours: null, text: '', textTa: '' } })

/** A dish's prep reminders: the standard ones (each can be switched off for this home), this home's own (add, edit, remove). Everyone in the home sees them;
 * the Admin, or whoever is the Planner today, changes them. */
export function PrepSection({ dishId }: { dishId: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const canEdit = useCanEditPrep()
  const { data: rows } = usePrepRows()
  const { data: off } = usePrepOff(household.id)
  const { active, hidden } = useMemo(() => prepOptions(rows ?? [], dishId, household.id, off), [rows, dishId, household.id, off])
  const [form, setForm] = useState<FormState | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canEdit && active.length === 0) return null

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  const note = (r: PrepRow) => {
    const n = leadNote(r)
    return n ? (n.key === 'overnight' ? t('prep.overnight') : t(`prep.${n.key}`, { count: n.hours })) : t(r.lead === 'night_before' ? 'prep.lead.night_before' : 'prep.lead.hours_before')
  }
  const isStandard = (r: PrepRow) => r.household_id === null
  const isOwn = (r: PrepRow) => r.recipe_id === null

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    const f = form
    if (!f.input.text.trim() && !f.input.textTa.trim()) return setError(t('prep.needText'))
    void run(async () => {
      await saveOwnPrep({ householdId: household.id, profileId: profile.id, dishId, id: f.id, input: f.input })
      setForm(null)
    })
  }

  const row = (r: PrepRow, switchedOff: boolean) => (
    <div key={r.id} className="flex flex-col gap-2 border-t border-line py-3">
      <div className="flex items-start gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={`text-[15px] font-semibold leading-snug ${switchedOff ? 'text-muted line-through' : ''}`}>
            {taskText({ text: { en: r.text_en, ta: r.text_ta } }, lang)}
            {isOwn(r) && <span className="ml-2 rounded-full bg-dinner-tint px-2 py-0.5 align-middle text-[11px] font-semibold text-dinner-ink">{t('prep.ours')}</span>}
          </span>
          <span className="text-[12.5px] text-muted">{switchedOff ? t('prep.offNote') : note(r)}</span>
        </span>
        {canEdit && isStandard(r) && (
          <Toggle
            checked={!switchedOff}
            label={t('prep.remindAria', { task: taskText({ text: { en: r.text_en, ta: r.text_ta } }, lang) })}
            onChange={(on) => void run(() => setDefaultPrepOff({ householdId: household.id, profileId: profile.id, prepId: r.id, off: !on }))}
          />
        )}
      </div>
      {canEdit && isOwn(r) &&
        (confirming === r.id ? (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('prep.removeAsk', { task: taskText({ text: { en: r.text_en, ta: r.text_ta } }, lang) })}>
            <span className="text-[13.5px] font-semibold">{t('prep.removeAsk', { task: taskText({ text: { en: r.text_en, ta: r.text_ta } }, lang) })}</span>
            <button type="button" disabled={busy} onClick={() => void run(async () => { await removeOwnPrep(household.id, r.id); setConfirming(null) })} className="min-h-[44px] rounded-xl bg-alert px-3.5 text-[14px] font-semibold text-on-solid disabled:opacity-60">{t('prep.remove')}</button>
            <button type="button" onClick={() => setConfirming(null)} className="min-h-[44px] rounded-xl border border-line-strong px-3.5 text-[14px] font-semibold">{t('common.cancel')}</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setForm({ id: r.id, input: { kind: r.kind, lead: r.lead, hours: r.hours, text: r.text_en, textTa: r.text_ta ?? '' } }); setError(null) }} className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong px-3.5 text-[14px] font-semibold">{t('prep.edit')}</button>
            <button type="button" onClick={() => { setConfirming(r.id); setError(null) }} className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong px-3.5 text-[14px] font-semibold text-alert">{t('prep.remove')}</button>
          </div>
        ))}
    </div>
  )

  const setInput = (patch: Partial<OwnPrepInput>) => form && setForm({ ...form, input: { ...form.input, ...patch } })
  const stepHours = (d: 1 | -1) => {
    if (!form) return
    const { lead, hours } = form.input
    const min = lead === 'hours_before' ? 1 : 0 // 0 means "not set" for a night-before task
    const next = hours === null ? (d === 1 ? (lead === 'hours_before' ? 2 : 8) : null) : Math.max(min, Math.min(lead === 'hours_before' ? 24 : 72, hours + d))
    setInput({ hours: next === 0 ? null : next })
  }
  const pickLead = (lead: PrepLead) => form && setForm({ ...form, input: { ...form.input, lead, hours: lead === 'hours_before' ? (form.input.hours ?? 2) : form.input.hours } })

  return (
    <section aria-label={t('prep.sectionTitle')} className="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <h2 className="font-display text-[17px] font-semibold">{t('prep.sectionTitle')}</h2>
      <p className="text-[12.5px] text-muted">{t('prep.sectionHint')}</p>
      {active.length === 0 && hidden.length === 0 && <p className="pt-2 text-[14px] text-ink-soft">{t('prep.none')}</p>}
      {active.map((r) => row(r, false))}
      {hidden.map((r) => row(r, true))}

      {canEdit && !form && (
        <button type="button" onClick={() => { setForm(blank()); setError(null) }} className="mt-2 min-h-[48px] rounded-xl border-[1.5px] border-dashed border-saffron/60 px-4 text-[14px] font-semibold text-saffron-ink">
          {t('prep.add')}
        </button>
      )}
      {!canEdit && <p className="pt-2 text-[12.5px] text-muted">{t('prep.readOnly')}</p>}

      {canEdit && form && (
        <form onSubmit={submit} aria-label={t('prep.formTitle')} className="mt-2 flex flex-col gap-3 rounded-2xl border border-saffron/40 bg-saffron-tint p-3.5">
          <h3 className="font-display text-[16px] font-semibold">{t('prep.formTitle')}</h3>
          <label className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
            {t('prep.what')}
            <input value={form.input.text} onChange={(e) => setInput({ text: e.target.value })} maxLength={160} autoComplete="off" className={field} />
          </label>
          <label className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
            {t('prep.whatTa')}
            <input value={form.input.textTa} onChange={(e) => setInput({ textTa: e.target.value })} maxLength={160} lang="ta" autoComplete="off" className={field} />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-ink-soft">{t('prep.kindLabel')}</span>
            <div role="radiogroup" aria-label={t('prep.kindLabel')} className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={form.input.kind === k} onClick={() => setInput({ kind: k })} className={chip(form.input.kind === k)}>{t(`prep.kind.${k}`)}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-ink-soft">{t('prep.whenLabel')}</span>
            <div role="radiogroup" aria-label={t('prep.whenLabel')} className="flex flex-wrap gap-1.5">
              {(['night_before', 'hours_before'] as const).map((l) => (
                <button key={l} type="button" role="radio" aria-checked={form.input.lead === l} onClick={() => pickLead(l)} className={chip(form.input.lead === l)}>{t(`prep.lead.${l}`)}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-ink-soft">{t(form.input.lead === 'hours_before' ? 'prep.hoursBeforeLabel' : 'prep.hoursNeedsLabel')}</span>
            <div className="flex items-center gap-2.5">
              <button type="button" aria-label={t('shopping.less')} onClick={() => stepHours(-1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">−</button>
              <span aria-live="polite" className="flex-1 text-center font-display text-[20px] font-semibold">{form.input.hours ?? '—'}</span>
              <button type="button" aria-label={t('shopping.more')} onClick={() => stepHours(1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">+</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setForm(null); setError(null) }} className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-semibold">{t('common.cancel')}</button>
            <button type="submit" disabled={busy} className="min-h-[48px] flex-1 rounded-xl bg-ink text-[14.5px] font-semibold text-cream disabled:opacity-60">{t('common.save')}</button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="mt-2 rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}
    </section>
  )
}
