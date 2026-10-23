import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Toggle } from './ui'
import { SECTIONS, TABS, UNITS, changeUnit, formatAmount, itemsOfTab, nudge, unitLabel, type CatalogItem, type ShopSection, type ShopTab, type ShopUnit } from '../lib/shopping'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`

const names = (c: CatalogItem, lang: 'en' | 'ta') => ({ main: lang === 'ta' && c.name_ta ? c.name_ta : c.name_en, other: lang === 'ta' ? c.name_en : c.name_ta })

/** Matches shown under the type box while typing, plus "Add '<name>' as a new item" when nothing known fits. */
export function SuggestionList({ suggestions, newName, lang, onPick, onNew }: { suggestions: CatalogItem[]; newName: string | null; lang: 'en' | 'ta'; onPick: (c: CatalogItem) => void; onNew: () => void }) {
  const { t } = useTranslation()
  if (suggestions.length === 0 && !newName) return null
  return (
    <div role="listbox" aria-label={t('shopping.suggestions')} className="overflow-hidden rounded-2xl border border-line bg-surface">
      {suggestions.map((c, i) => {
        const n = names(c, lang)
        return (
          <button key={c.key} type="button" role="option" aria-selected="false" onClick={() => onPick(c)} className={`flex min-h-[48px] w-full items-center gap-3 px-3.5 py-2 text-left ${i > 0 ? 'border-t border-line' : ''}`}>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px] font-medium">
                {n.main}
                {n.other && <span lang={lang === 'ta' ? 'en' : 'ta'} className="ml-1.5 text-[12.5px] font-normal text-muted">{n.other}</span>}
                {c.source === 'ours' && <span className="ml-2 rounded-full bg-dinner-tint px-2 py-0.5 text-[11px] font-semibold text-dinner-ink">{t('shopping.ourItem')}</span>}
              </span>
              <span className="text-[12px] text-muted">{t('shopping.suggestionLine', { amount: formatAmount(c.usual_amount, c.usual_unit, lang), section: t(`shopping.section.${c.section}`) })}</span>
            </span>
          </button>
        )
      })}
      {newName && (
        <button type="button" onClick={onNew} className={`flex min-h-[48px] w-full items-center gap-2 px-3.5 py-2 text-left text-[14.5px] font-semibold text-saffron-ink ${suggestions.length > 0 ? 'border-t border-line' : ''}`}>
          <span aria-hidden="true" className="text-[18px] leading-none">+</span>
          {t('shopping.newOption', { name: newName })}
        </button>
      )}
    </div>
  )
}

/** "Browse common items": tabs and a three-column grid; tapping adds the usual amount. */
export function BrowseCommon({ items, lang, isOnList, onPick }: { items: CatalogItem[]; lang: 'en' | 'ta'; isOnList: (c: CatalogItem) => boolean; onPick: (c: CatalogItem) => void }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ShopTab>('vegetables')
  const shown = itemsOfTab(items, tab)
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
      <div role="radiogroup" aria-label={t('shopping.browseShow')} className="flex flex-wrap gap-1.5">
        {TABS.map((id) => (
          <button key={id} type="button" role="radio" aria-checked={tab === id} onClick={() => setTab(id)} className={chip(tab === id)}>
            {t(`shopping.tab.${id}`)}
          </button>
        ))}
      </div>
      <div tabIndex={0} role="group" aria-label={t(`shopping.tab.${tab}`)} className="max-h-[340px] overflow-y-auto overscroll-contain rounded-xl focus-visible:outline-2">
      <div className="grid grid-cols-3 gap-1.5">
        {shown.map((c) => {
          const on = isOnList(c)
          const n = names(c, lang)
          const amount = formatAmount(c.usual_amount, c.usual_unit, lang)
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={on}
              aria-label={on ? t('shopping.browseOnList', { name: n.main }) : t('shopping.browseAdd', { name: n.main, amount })}
              onClick={() => onPick(c)}
              className={`flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 text-center ${on ? 'border-[1.5px] border-leaf bg-leaf-tint' : 'border border-line bg-surface'}`}
            >
              <span className="text-[13.5px] font-semibold leading-tight">{n.main}</span>
              {n.other && <span lang={lang === 'ta' ? 'en' : 'ta'} className="text-[11px] leading-tight text-muted">{n.other}</span>}
              <span className={`text-[11.5px] font-semibold ${on ? 'text-leaf' : 'text-saffron-ink'}`}>{on ? t('shopping.onList') : `+ ${amount}`}</span>
              {c.source === 'ours' && <span className="rounded-full bg-dinner-tint px-2 text-[10.5px] font-semibold text-dinner-ink">{t('shopping.ourItem')}</span>}
            </button>
          )
        })}
      </div>
      </div>
      <p className="text-[12px] leading-relaxed text-muted">{t('shopping.browseHint')}</p>
    </div>
  )
}

export type NewItemDraft = { name: string; ta: string; section: ShopSection; amount: number | null; unit: ShopUnit; save: boolean }

/** The form for a name nothing known matches: name, Tamil name, section, usual amount, and whether to keep it for next time. */
export function NewItemForm({ draft, lang, busy, onChange, onSubmit, onCancel }: { draft: NewItemDraft; lang: 'en' | 'ta'; busy: boolean; onChange: (patch: Partial<NewItemDraft>) => void; onSubmit: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
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
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-saffron/40 bg-saffron-tint p-3.5" aria-label={t('shopping.newTitle')}>
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
        <div role="radiogroup" aria-label={t('shopping.unit')} className="flex flex-wrap gap-1.5">
          {UNITS.map((u) => (
            <button key={u} type="button" role="radio" aria-checked={draft.unit === u} onClick={() => onChange({ unit: u, amount: changeUnit(draft.amount, draft.unit, u) })} className={chip(draft.unit === u)}>
              {unitLabel(u, lang, 2)}
            </button>
          ))}
        </div>
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
