import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Toggle } from './ui'
import { UnitChips } from './ShopRows'
import { chip } from './shopUi'
import { useRevealOnOpen } from '../lib/useRouteFocus'
import { SECTIONS, formatAmount, nudge, type ShopSection, type ShopUnit } from '../lib/shopping'

export type NewItemDraft = { name: string; ta: string; section: ShopSection; amount: number | null; unit: ShopUnit; save: boolean }

/** The form for a name nothing known matches: name, Tamil name, section, usual amount, and whether to keep it for next time. */
export function NewItemForm({ draft, lang, busy, onChange, onSubmit, onCancel }: { draft: NewItemDraft; lang: 'en' | 'ta'; busy: boolean; onChange: (patch: Partial<NewItemDraft>) => void; onSubmit: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
  const formRef = useRevealOnOpen<HTMLFormElement>(true)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (draft.name.trim()) onSubmit()
  }
  const step = (direction: 1 | -1) => {
    const next = nudge(draft.amount, draft.unit, direction)
    onChange({ amount: next.amount, unit: next.unit })
  }
  const input = 'min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-surface px-3.5 text-[15px]'
  return (
    <form ref={formRef} onSubmit={submit} className="flex scroll-mt-24 flex-col gap-3 rounded-2xl border border-saffron/40 bg-saffron-tint p-3.5" aria-label={t('shopping.newTitle')}>
      <h2 className="font-display text-[16px] font-semibold">{t('shopping.newTitle')}</h2>
      <label className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
        {t('shopping.newName')}
        <input value={draft.name} onChange={(e) => onChange({ name: e.target.value })} maxLength={80} autoComplete="off" className={`${input} text-[15px] font-normal text-ink`} />
      </label>
      <label className="flex flex-col gap-1 text-[12.5px] font-semibold text-ink-soft">
        {t('shopping.newNameTa')}
        <input value={draft.ta} onChange={(e) => onChange({ ta: e.target.value })} maxLength={80} lang="ta" autoComplete="off" className={`${input} font-normal text-ink`} />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold text-ink-soft">{t('shopping.sectionLabel')}</span>
        <div role="radiogroup" aria-label={t('shopping.sectionLabel')} className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={draft.section === s} onClick={() => onChange({ section: s })} className={chip(draft.section === s)}>
              {t(`shopping.section.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold text-ink-soft">{t('shopping.newAmount')}</span>
        <div className="flex items-center gap-2.5">
          <button type="button" aria-label={t('shopping.less')} onClick={() => step(-1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">−</button>
          <span aria-live="polite" className="flex-1 text-center font-display text-[20px] font-semibold">{formatAmount(draft.amount, draft.unit, lang) || '—'}</span>
          <button type="button" aria-label={t('shopping.more')} onClick={() => step(1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">+</button>
        </div>
        <UnitChips amount={draft.amount} unit={draft.unit} lang={lang} onPick={(next) => onChange(next)} />
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2">
        <span className="flex flex-1 flex-col">
          <span className="text-[14px] font-semibold">{t('shopping.newSave')}</span>
          <span className="text-[12px] text-muted">{t('shopping.newSaveHint')}</span>
        </span>
        <Toggle checked={draft.save} onChange={(save) => onChange({ save })} label={t('shopping.newSave')} />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-semibold">{t('common.cancel')}</button>
        <button type="submit" disabled={busy || !draft.name.trim()} className="min-h-[48px] flex-1 rounded-xl bg-ink text-[14.5px] font-semibold text-cream disabled:opacity-60">{t('shopping.newAdd')}</button>
      </div>
    </form>
  )
}
