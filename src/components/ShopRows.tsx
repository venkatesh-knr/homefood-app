import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './Dialog'
import { chip } from './shopUi'
import {
  SECTIONS, UNIT_CHIPS, changeChip, chipOf, formatAmount, itemName, nudge, secondName, unitLabel,
  type ShopItem, type ShopSection, type ShopUnit, type UnitChip,
} from '../lib/shopping'

/** The tick box: only this marks something bought. */
export function Tick({ on }: { on: boolean }) {
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] ${on ? 'bg-leaf text-on-solid' : 'border-2 border-line-strong bg-surface'}`}>
      {on && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12l5 5 9-10" />
        </svg>
      )}
    </span>
  )
}

/** − amount +: the minus and plus change the amount straight away; the amount in the middle opens the sheet (when `onOpen` is given). */
export function AmountStepper({ name, amount, unit, lang, tone = 'plain', onLess, onMore, onOpen }: {
  name: string; amount: number | null; unit: ShopUnit | null; lang: 'en' | 'ta'; tone?: 'plain' | 'green'
  onLess: () => void; onMore: () => void; onOpen?: () => void
}) {
  const { t } = useTranslation()
  const text = formatAmount(amount, unit, lang) || '—'
  const frame = tone === 'green' ? 'border-leaf bg-leaf-tint text-leaf' : 'border-line bg-cream text-ink'
  const middle = 'flex min-h-[44px] w-[3.5rem] items-center justify-center whitespace-nowrap px-0.5 text-[13.5px] font-semibold'
  return (
    <span className={`inline-flex shrink-0 items-center rounded-[12px] border-[1.5px] ${frame}`}>
      <button type="button" aria-label={t('shopping.lessOf', { name })} onClick={onLess} className="flex min-h-[44px] w-11 items-center justify-center text-[20px] font-semibold">−</button>
      {onOpen ? (
        <button type="button" aria-label={amount !== null ? t('shopping.editAmount', { name, amount: text }) : t('shopping.setAmount', { name })} onClick={onOpen} className={middle}>{text}</button>
      ) : (
        <span aria-live="polite" className={middle}>{text}</span>
      )}
      <button type="button" aria-label={t('shopping.moreOf', { name })} onClick={onMore} className="flex min-h-[44px] w-11 items-center justify-center text-[20px] font-semibold">+</button>
    </span>
  )
}

/** The unit chips: weight (g / kg), volume (ml / L), pieces, bunch, pack. Which of g and kg (ml and L) shows follows the amount. */
export function UnitChips({ amount, unit, lang, onPick }: { amount: number | null; unit: ShopUnit | null; lang: 'en' | 'ta'; onPick: (next: { amount: number; unit: ShopUnit }) => void }) {
  const { t } = useTranslation()
  const label = (c: UnitChip) => (c === 'weight' ? `${unitLabel('g', lang)} / ${unitLabel('kg', lang)}` : c === 'volume' ? `${unitLabel('ml', lang)} / ${unitLabel('L', lang)}` : unitLabel(c, lang, 2))
  return (
    <div role="radiogroup" aria-label={t('shopping.unit')} className="flex flex-wrap gap-1.5">
      {UNIT_CHIPS.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={chipOf(unit) === c} onClick={() => onPick(changeChip(amount, unit, c))} className={chip(chipOf(unit) === c)}>
          {label(c)}
        </button>
      ))}
    </div>
  )
}

/** The other language's name, small, after the main one. */
export function SecondName({ text, lang, block = false }: { text: string | null; lang: 'en' | 'ta'; block?: boolean }) {
  if (!text) return null
  return <span lang={lang === 'ta' ? 'en' : 'ta'} className={`${block ? 'block' : 'ml-1.5'} text-[12.5px] font-normal text-muted`}>{text}</span>
}

export type ItemPatch = Partial<Pick<ShopItem, 'amount' | 'unit' | 'section' | 'is_regular'>>

/** A row of the To buy tab: tick box, name, and the − amount + stepper. */
export function ListRow({ item, first, lang, note, onTick, onPatch, onOpen }: { item: ShopItem; first: boolean; lang: 'en' | 'ta'; note: string; onTick: () => void; onPatch: (p: ItemPatch) => void; onOpen: () => void }) {
  const { t } = useTranslation()
  const name = itemName(item, lang)
  const step = (direction: 1 | -1) => {
    const next = nudge(item.amount, item.unit, direction)
    onPatch({ amount: next.amount, unit: next.amount === null ? null : next.unit })
  }
  return (
    <div className={`flex items-center gap-0.5 px-1 py-1.5 ${first ? '' : 'border-t border-line'}`}>
      <button type="button" role="checkbox" aria-checked="false" aria-label={t('shopping.tick', { name })} onClick={onTick} className="flex h-11 w-11 shrink-0 items-center justify-center">
        <Tick on={false} />
      </button>
      <span className="flex min-w-0 flex-1 flex-col gap-px py-1 pr-0.5">
        <span className="break-words text-[15px] font-medium leading-snug ta:text-[14px]">
          {name}
          <SecondName text={secondName(item, lang)} lang={lang} block />
        </span>
        {note && <span className="text-[12px] text-muted">{note}</span>}
      </span>
      <AmountStepper name={name} amount={item.amount} unit={item.unit} lang={lang} onLess={() => step(-1)} onMore={() => step(1)} onOpen={onOpen} />
    </div>
  )
}

/** A row of the Add items tab (a common or own item): its usual amount and an Add button, which becomes a green stepper once it is on the list. */
export function AddRow({ title, other, ours, caption, onList, lang, busy, onAdd, onLess, onMore, regular, onToggleRegular }: {
  title: string; other: string | null; ours: boolean; caption: string
  onList: { amount: number | null; unit: ShopUnit | null } | null; lang: 'en' | 'ta'; busy: boolean
  onAdd: () => void; onLess: () => void; onMore: () => void
  /** The star: this item is kept as a regular. Left out when the row has no star. */
  regular?: boolean; onToggleRegular?: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-1 px-3 py-1.5">
      <span className="flex min-w-0 flex-1 flex-col gap-px py-1">
        <span className="break-words text-[15px] font-medium leading-snug ta:text-[14px]">
          {title}
          <SecondName text={other} lang={lang} />
          {ours && <span className="ml-2 rounded-full bg-dinner-tint px-2 py-0.5 align-middle text-[11px] font-semibold text-dinner-ink">{t('shopping.ourItem')}</span>}
        </span>
        <span className="text-[12px] text-muted">{caption}</span>
      </span>
      {onToggleRegular && (
        <button
          type="button"
          aria-pressed={Boolean(regular)}
          aria-label={regular ? t('shopping.stopRegular', { name: title }) : t('shopping.makeRegular', { name: title })}
          title={regular ? t('shopping.stopRegular', { name: title }) : t('shopping.makeRegular', { name: title })}
          onClick={onToggleRegular}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${regular ? 'text-saffron-ink' : 'text-muted'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={regular ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z" /></svg>
        </button>
      )}
      {onList ? (
        <AmountStepper name={title} amount={onList.amount} unit={onList.unit} lang={lang} tone="green" onLess={onLess} onMore={onMore} />
      ) : (
        <button type="button" disabled={busy} aria-label={t('shopping.addNamed', { name: title })} onClick={onAdd} className="min-h-[44px] shrink-0 rounded-[12px] bg-ink px-5 text-[14px] font-semibold text-cream disabled:opacity-60">
          {t('shopping.add')}
        </button>
      )}
    </div>
  )
}

/** Tapping an amount opens this sheet: amount, unit, section, Regular, save for next time, and Remove. */
export function AmountSheet({ item, lang, canSave, onSaveOurs, onPatch, onRemove, onClose }: {
  item: ShopItem; lang: 'en' | 'ta'; canSave: boolean; onSaveOurs: () => Promise<void>
  onPatch: (p: ItemPatch) => void; onRemove: () => void; onClose: () => void
}) {
  const { t } = useTranslation()
  const name = itemName(item, lang)
  const [saved, setSaved] = useState(false)
  const step = (direction: 1 | -1) => {
    const next = nudge(item.amount, item.unit, direction)
    onPatch({ amount: next.amount, unit: next.amount === null ? null : next.unit })
  }
  const text = formatAmount(item.amount, item.unit, lang)
  return (
    <Dialog title={name} onClose={onClose}>
      <div className="flex flex-col gap-3.5 overflow-y-auto px-5 pb-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 break-words font-display text-[19px] font-bold leading-tight">
            {name}
            <SecondName text={secondName(item, lang)} lang={lang} />
          </h2>
          <button type="button" onClick={onClose} className="min-h-[44px] shrink-0 rounded-xl bg-ink px-4 text-[14px] font-semibold text-cream">{t('shopping.done')}</button>
        </div>

        <div className="flex items-center gap-2.5">
          <button type="button" aria-label={t('shopping.less')} onClick={() => step(-1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">−</button>
          <span aria-live="polite" className="flex-1 text-center font-display text-[20px] font-semibold">{text || '—'}</span>
          <button type="button" aria-label={t('shopping.more')} onClick={() => step(1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">+</button>
        </div>

        <div className="flex flex-col gap-1.5">
          <UnitChips amount={item.amount} unit={item.unit} lang={lang} onPick={(next) => onPatch(next)} />
          <button type="button" role="radio" aria-checked={item.amount === null} onClick={() => onPatch({ amount: null, unit: null })} className={`${chip(item.amount === null)} self-start`}>
            {t('shopping.noAmount')}
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-ink-soft">{t('shopping.sectionLabel')}</span>
          <div role="radiogroup" aria-label={t('shopping.sectionLabel')} className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s: ShopSection) => (
              <button key={s} type="button" role="radio" aria-checked={item.section === s} onClick={() => onPatch({ section: s })} className={chip(item.section === s)}>
                {t(`shopping.section.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <button type="button" role="switch" aria-checked={item.is_regular} onClick={() => onPatch({ is_regular: !item.is_regular })} className={`min-h-[44px] rounded-xl border-[1.5px] px-3 text-[13.5px] font-semibold ${item.is_regular ? 'border-saffron bg-saffron-tint text-saffron-ink' : 'border-dashed border-line-strong bg-surface text-ink'}`}>
          {item.is_regular ? t('shopping.regularOn') : t('shopping.regularToggle')}
        </button>

        {canSave && !saved && (
          <button type="button" onClick={() => void onSaveOurs().then(() => setSaved(true))} className="min-h-[44px] rounded-xl border-[1.5px] border-dashed border-saffron/60 bg-surface px-3 text-[13.5px] font-semibold text-saffron-ink">
            {t('shopping.saveOurs')}
          </button>
        )}
        {saved && <span role="status" className="text-[12.5px] font-semibold text-leaf">{t('shopping.savedOurs')}</span>}

        <button type="button" onClick={onRemove} className="min-h-[44px] self-start rounded-xl border-[1.5px] border-alert/50 bg-surface px-3.5 text-[13.5px] font-semibold text-alert">{t('shopping.remove')}</button>
      </div>
    </Dialog>
  )
}

