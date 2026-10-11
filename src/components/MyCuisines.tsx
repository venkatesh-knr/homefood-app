import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useCuisines, useDishes } from '../lib/dishQueries'
import { countDishesByCuisine } from '../lib/dishes'
import { deleteCuisine, renameCuisine } from '../lib/dishMutations'
import { describeError } from '../lib/errors'
import { isValidCuisineName } from '../lib/validation'
import type { Cuisine } from '../lib/dishes'
import { Button } from './ui'

const inputClass = 'min-h-[48px] w-full rounded-xl border border-line-strong bg-surface px-3 text-[16px]'

/** Admin-only: rename or delete the cuisines this home added. The shared ones cannot be changed, and a cuisine that dishes still use cannot be deleted. */
export function MyCuisines({ householdId }: { householdId: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { data: cuisines } = useCuisines()
  const { data: dishes } = useDishes(householdId)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [nameTa, setNameTa] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const own = (cuisines ?? []).filter((c) => c.household_id === householdId)
  if (own.length === 0) return null
  const counts = countDishesByCuisine(dishes ?? [])

  function startEdit(c: Cuisine) {
    setEditing(c.id)
    setConfirming(null)
    setName(c.name)
    setNameTa(c.name_ta ?? '')
    setError(null)
  }

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

  const onRename = (e: FormEvent) => {
    e.preventDefault()
    if (!editing || !isValidCuisineName(name)) return
    void run(async () => {
      await renameCuisine(editing, name, nameTa)
      setEditing(null)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="min-h-[44px] self-start rounded-full border-[1.5px] border-line-strong px-3.5 text-[13px] font-semibold text-ink-soft"
      >
        {t('cuisines.manage')}
      </button>
      {open && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
          <p className="text-[12.5px] text-muted">{t('cuisines.hint')}</p>
          {own.map((c) => {
            const used = counts.get(c.id) ?? 0
            const label = (lang === 'ta' && c.name_ta) || c.name
            return (
              <div key={c.id} className="flex flex-col gap-2 border-t border-line pt-2.5">
                {editing === c.id ? (
                  <form onSubmit={onRename} className="flex flex-col gap-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-label={t('dishes.cuisineNamePlaceholder')} placeholder={t('dishes.cuisineNamePlaceholder')} className={inputClass} />
                    <input value={nameTa} onChange={(e) => setNameTa(e.target.value)} maxLength={40} aria-label={t('dishes.cuisineNameTaPlaceholder')} placeholder={t('dishes.cuisineNameTaPlaceholder')} lang="ta" className={`${inputClass} font-tamil`} />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={busy || !isValidCuisineName(name)} className="flex-1">
                        {t('common.save')}
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-semibold">{label}</span>
                      <span className="shrink-0 text-[12.5px] text-muted">{used === 0 ? t('cuisines.unused') : t(used === 1 ? 'cuisines.usedOne' : 'cuisines.usedOther', { count: used })}</span>
                    </div>
                    {confirming === c.id ? (
                      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('cuisines.confirm', { name: label })}>
                        <span className="text-[13.5px] font-semibold">{t('cuisines.confirm', { name: label })}</span>
                        <button type="button" disabled={busy} onClick={() => void run(async () => { await deleteCuisine(c.id); setConfirming(null) })} className="min-h-[44px] rounded-xl bg-alert px-3.5 text-[14px] font-semibold text-white">
                          {t('cuisines.confirmYes')}
                        </button>
                        <button type="button" onClick={() => setConfirming(null)} className="min-h-[44px] rounded-xl border border-line-strong px-3.5 text-[14px] font-semibold">
                          {t('cuisines.confirmNo')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => startEdit(c)} className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong px-3.5 text-[14px] font-semibold">
                          {t('cuisines.rename')}
                        </button>
                        <button
                          type="button"
                          disabled={used > 0}
                          aria-describedby={used > 0 ? `cuisine-block-${c.id}` : undefined}
                          onClick={() => {
                            setConfirming(c.id)
                            setError(null)
                          }}
                          className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong px-3.5 text-[14px] font-semibold text-alert disabled:opacity-40"
                        >
                          {t('cuisines.delete')}
                        </button>
                      </div>
                    )}
                    {used > 0 && confirming !== c.id && (
                      <p id={`cuisine-block-${c.id}`} className="text-[12.5px] text-muted">
                        {t('cuisines.inUse', { count: used })}
                      </p>
                    )}
                  </>
                )}
              </div>
            )
          })}
          {error && <p className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}
        </div>
      )}
    </div>
  )
}
