import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { AddFoodSheet } from './AddFoodSheet'
import { useHome } from '../lib/homeContext'
import { useExtrasPeople } from '../lib/useExtrasPeople'
import { ProteinCard } from './ProteinCard'
import { useIntake } from '../lib/intakeQueries'
import { changeIntakeAmount, removeIntake } from '../lib/intakeMutations'
import { sumIntake, stepQuantity, type IntakeRow } from '../lib/intake'
import { amountText, timeText } from '../lib/intakeUi'
import { describeError } from '../lib/errors'

/** "My extras today": what a person ate outside the planned meals. Private to them; the Admin can also keep it for family members with no login. */
export function ExtrasSection({ date }: { date: string }) {
  const { t } = useTranslation()
  const { profile } = useHome()
  const people = useExtrasPeople()
  const [personId, setPersonId] = useState(profile.id)
  const person = people.find((p) => p.id === personId) ?? profile
  const mine = person.id === profile.id
  const { data: rows } = useIntake(person.id, date, date)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<IntakeRow | null>(null)
  const items = rows ?? []
  const day = sumIntake(items)

  return (
    <section className="flex flex-col gap-2.5 pt-1" aria-labelledby="extras-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="extras-title" className="font-display text-[16px] font-semibold">
          {t('extras.title')}
        </h2>
        {people.length > 1 && (
          <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
            {t('extras.for')}
            <select value={person.id} onChange={(e) => setPersonId(e.target.value)} className="min-h-[44px] rounded-xl border border-line bg-surface px-2 text-[14px] text-ink">
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === profile.id ? t('extras.me') : p.display_name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <ProteinCard person={person} date={date} />

      {items.length === 0 ? (
        <p className="rounded-2xl bg-sand px-4 py-3 text-[13.5px] text-ink-soft">{t('extras.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => setEditing(r)} className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-3.5 py-2 text-left">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold">{r.food_name}</span>
                  <span className="text-[12.5px] text-muted">
                    {amountText(t, r.unit, r.quantity)}
                    {r.eaten_at ? ` · ${timeText(r.eaten_at)}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-right text-[13px] text-ink-soft">
                  {r.kcal === null ? t('extras.noCalories') : `${Math.round(r.kcal)} kcal`}
                  {r.protein_g !== null && r.protein_g > 0 ? <span className="block text-[12px] text-muted">{Math.round(r.protein_g * 10) / 10} g</span> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <p className="px-1 text-[13px] text-ink-soft">
          {t('extras.total', { kcal: Math.round(day.totals.kcal), protein: Math.round(day.totals.protein_g * 10) / 10 })}
          {day.unknownItems > 0 ? ` · ${t('extras.unknown', { count: day.unknownItems })}` : ''}
        </p>
      )}

      <button type="button" onClick={() => setAdding(true)} className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron-ink/60 text-[14.5px] font-semibold text-saffron-ink">
        <span aria-hidden="true">+</span>
        {t('extras.add')}
      </button>
      <p className="px-1 text-[12px] text-muted">{mine ? t('extras.privateMine') : t('extras.privateAdmin', { name: person.display_name })}</p>

      {adding && <AddFoodSheet personId={person.id} personName={mine ? t('extras.me') : person.display_name} date={date} onClose={() => setAdding(false)} />}
      {editing && <EditItemSheet row={editing} onClose={() => setEditing(null)} />}
    </section>
  )
}

function EditItemSheet({ row, onClose }: { row: IntakeRow; onClose: () => void }) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(row.quantity)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
      onClose()
    } catch (err) {
      setError(describeError(err, t))
      setBusy(false)
    }
  }

  return (
    <Dialog title={row.food_name} onClose={onClose}>
      <div className="flex flex-col gap-3 px-5 pb-5 pt-5">
        <h2 className="font-display text-[19px] font-bold leading-tight">{row.food_name}</h2>
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-3.5">
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold">{t('extras.amount')}</span>
            <span className="text-[13px] text-muted" aria-live="polite">{amountText(t, row.unit, quantity)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" aria-label={t('recipe.fewer')} onClick={() => setQuantity(stepQuantity(row.unit, quantity, -1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-[22px]">
              −
            </button>
            <span className="w-10 text-center font-display text-[22px] font-bold">{quantity}</span>
            <button type="button" aria-label={t('recipe.more')} onClick={() => setQuantity(stepQuantity(row.unit, quantity, 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-[22px]">
              +
            </button>
          </div>
        </div>
        {error && <p role="alert" className="rounded-xl bg-alert-tint px-3.5 py-2.5 text-[13.5px] text-alert">{error}</p>}
        <div className="flex gap-2.5">
          <button type="button" disabled={busy} onClick={() => void run(() => removeIntake(row.id))} className="min-h-[52px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[15px] font-semibold text-alert">
            {t('extras.remove')}
          </button>
          <button type="button" disabled={busy || quantity === row.quantity} onClick={() => void run(() => changeIntakeAmount(row, quantity))} className="min-h-[52px] flex-[2] rounded-2xl bg-ink text-[15px] font-semibold text-cream disabled:opacity-50">
            {t('extras.save')}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
