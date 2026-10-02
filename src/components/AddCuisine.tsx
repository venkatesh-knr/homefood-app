import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { addCuisine } from '../lib/dishMutations'
import { describeError } from '../lib/errors'
import { isValidCuisineName } from '../lib/validation'
import { Button } from './ui'

/** Admin-only: a new cuisine is just a row owned by this home (spec: "cuisine is a data row, not code"). */
export function AddCuisine({ householdId }: { householdId: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [nameTa, setNameTa] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidCuisineName(name)) return
    setBusy(true)
    setError(null)
    try {
      await addCuisine(householdId, name, nameTa)
      setName('')
      setNameTa('')
      setOpen(false)
    } catch (err) {
      setError(describeError(err, t))
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-full border-[1.5px] border-dashed border-saffron-ink/60 px-3.5 py-1.5 text-[13px] font-semibold text-saffron-ink"
      >
        + {t('dishes.addCuisine')}
      </button>
    )
  }

  const inputClass = 'h-11 rounded-xl border border-line-strong bg-white px-3 text-[15px]'
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-3.5">
      <span className="text-[13px] font-semibold">{t('dishes.addCuisine')}</span>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('dishes.cuisineNamePlaceholder')} maxLength={40} autoFocus className={inputClass} />
      <input value={nameTa} onChange={(e) => setNameTa(e.target.value)} placeholder={t('dishes.cuisineNameTaPlaceholder')} maxLength={40} className={`${inputClass} font-tamil`} />
      <p className="text-[12.5px] text-muted">{t('dishes.cuisineHint')}</p>
      {error && <p className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !isValidCuisineName(name)} className="flex-1">
          {t('common.save')}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
