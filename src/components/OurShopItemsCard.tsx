import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useHouseholdShopItems } from '../lib/shoppingQueries'
import { removeOurItem, renameOurItem } from '../lib/shoppingMutations'
import { formatAmount, type CatalogItem } from '../lib/shopping'
import { describeError } from '../lib/errors'
import { Card } from './ui'

const input = 'min-h-[48px] w-full rounded-xl border border-line-strong bg-surface px-3 text-[16px]'

/** Home tab: the items this home saved for its shopping list. Everyone sees them; the person who saved one, or an Admin, renames or removes it. */
export function OurShopItemsCard({ householdId, profileId, isAdmin, showEmpty = false }: { householdId: string; profileId: string; isAdmin: boolean; showEmpty?: boolean }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { data: items } = useHouseholdShopItems(householdId)
  const [editing, setEditing] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [nameTa, setNameTa] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!items) return null
  if (items.length === 0) return showEmpty ? <p className="rounded-2xl bg-sand px-4 py-3.5 text-[14px] text-ink-soft">{t('shopping.oursEmpty')}</p> : null

  function startEdit(c: CatalogItem) {
    setEditing(c.id)
    setConfirming(null)
    setName(c.name_en)
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
    if (!editing || !name.trim()) return
    void run(async () => {
      await renameOurItem(householdId, editing, { name_en: name, name_ta: nameTa })
      setEditing(null)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-[17px] font-semibold">{t('shopping.oursTitle')}</span>
      <Card className="flex flex-col gap-1 px-3.5 py-3">
        <p className="pb-1 text-[12.5px] text-muted">{t('shopping.oursHint')}</p>
        {items.map((c) => {
          const label = lang === 'ta' && c.name_ta ? c.name_ta : c.name_en
          const canManage = isAdmin || c.created_by === profileId
          return (
            <div key={c.id} className="flex flex-col gap-2 border-t border-line py-2.5">
              {editing === c.id ? (
                <form onSubmit={onRename} className="flex flex-col gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label={t('shopping.newName')} placeholder={t('shopping.newName')} className={input} />
                  <input value={nameTa} onChange={(e) => setNameTa(e.target.value)} maxLength={80} lang="ta" aria-label={t('shopping.oursNameTa')} placeholder={t('shopping.oursNameTa')} className={input} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={busy || !name.trim()} className="min-h-[48px] flex-1 rounded-xl bg-ink text-[14.5px] font-semibold text-cream disabled:opacity-60">{t('common.save')}</button>
                    <button type="button" onClick={() => setEditing(null)} className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-semibold">{t('common.cancel')}</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-semibold">{label}</span>
                    <span className="shrink-0 text-[12.5px] text-muted">{formatAmount(c.usual_amount, c.usual_unit, lang)} · {t(`shopping.section.${c.section}`)}</span>
                  </div>
                  {canManage &&
                    (confirming === c.id ? (
                      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('shopping.oursRemoveAsk', { name: label })}>
                        <span className="text-[13.5px] font-semibold">{t('shopping.oursRemoveAsk', { name: label })}</span>
                        <button type="button" disabled={busy} onClick={() => void run(async () => { await removeOurItem(householdId, c.id); setConfirming(null) })} className="min-h-[44px] rounded-xl bg-alert px-3.5 text-[14px] font-semibold text-on-solid disabled:opacity-60">{t('shopping.oursRemove')}</button>
                        <button type="button" onClick={() => setConfirming(null)} className="min-h-[44px] rounded-xl border border-line-strong px-3.5 text-[14px] font-semibold">{t('common.cancel')}</button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => startEdit(c)} className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong px-3.5 text-[14px] font-semibold">{t('shopping.oursRename')}</button>
                        <button type="button" onClick={() => { setConfirming(c.id); setError(null) }} className="min-h-[44px] rounded-xl border-[1.5px] border-line-strong px-3.5 text-[14px] font-semibold text-alert">{t('shopping.oursRemove')}</button>
                      </div>
                    ))}
                </>
              )}
            </div>
          )
        })}
        {error && <p role="alert" className="rounded-xl bg-alert-tint px-3 py-2 text-[13px] text-alert">{error}</p>}
      </Card>
    </div>
  )
}
