import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useShopCatalogue, useShoppingItems } from '../lib/shoppingQueries'
import { addRegulars, addShoppingItem, clearShoppingList, pruneBought, removeShoppingItem, saveOurItem, setBought, updateShoppingItem, type NewItem } from '../lib/shoppingMutations'
import {
  SECTIONS, SECTION_COLOR, UNITS, canon, changeUnit, findExisting, formatAmount, groupBySection, isTamil, itemName, matchCatalog, nudge, parseTyped, secondName, shareText, splitList, suggestItems, unitLabel, whatsappLink,
  type CatalogItem, type ShopItem, type ShopSection, type ShopUnit, type TypedItem,
} from '../lib/shopping'
import { describeError } from '../lib/errors'
import { BackHeader } from '../components/BackHeader'
import { Dialog } from '../components/Dialog'
import { BrowseSheet, NewItemForm, SuggestionList, type NewItemDraft } from '../components/ShopCatalogue'

const chip = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${on ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`

/** The home's shared shopping list. Anyone with a login adds, edits and ticks; only the Admin can clear it. */
export default function ShoppingPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const { data: items, isLoading, isError } = useShoppingItems(household.id, { live: true })
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [browse, setBrowse] = useState(false)
  const [newDraft, setNewDraft] = useState<NewItemDraft | null>(null)
  const { items: catalog, index } = useShopCatalogue(household.id)
  const isAdmin = profile.role === 'admin'
  const navigate = useNavigate()
  const added = (useLocation().state as { added?: number } | null)?.added

  const nameOf = useMemo(() => new Map((members ?? []).map((m) => [m.id, m.display_name])), [members])
  const { toBuy, bought } = useMemo(() => splitList(items ?? []), [items])
  const groups = useMemo(() => groupBySection(toBuy), [toBuy])
  const onListNames = useMemo(() => new Set(toBuy.flatMap((i) => [canon(i.name), canon(i.name_ta ?? '')])), [toBuy])

  const typed = useMemo(() => parseTyped(draft), [draft])
  const suggestions = useMemo(() => suggestItems(catalog, typed.name), [catalog, typed.name])
  const knownName = typed.name.length >= 2 && (matchCatalog(index, typed.name) !== undefined || findExisting(items ?? [], typed.name) !== undefined)
  const newName = typed.name.length >= 2 && !knownName && !newDraft ? typed.name : null

  // Ticked items older than a day that are not regulars have no use any more: tidy them away, quietly.
  useEffect(() => {
    if (items) void pruneBought(household.id, items)
  }, [items, household.id])

  const fail = (err: unknown) => setMessage(describeError(err, t))

  /** Adds the item (or finds the one already there) and opens it so the amount or section can be changed. */
  async function runAdd(item: NewItem, quiet = false): Promise<boolean> {
    setBusy(true)
    setMessage(null)
    try {
      const result = await addShoppingItem({ householdId: household.id, profileId: profile.id, items: items ?? [], item })
      if (quiet) return true
      setDraft('')
      setEditing(result.id)
      if (result.kind === 'opened') setMessage(t('shopping.openedExisting', { name: item.name }))
      else if (result.kind === 'restored') setMessage(t('shopping.restored', { name: item.name }))
      return true
    } catch (err) {
      fail(err)
      return false
    } finally {
      setBusy(false)
    }
  }

  /** A known item: its own section and Tamil name, and the amount typed, or its usual amount. */
  function addFromCatalog(c: CatalogItem, t0?: TypedItem, quiet = false) {
    const amountTyped = t0?.amount != null
    void runAdd({
      name: c.name_en, name_ta: c.name_ta, section: c.section,
      amount: amountTyped ? t0!.amount : c.usual_amount, unit: amountTyped ? (t0!.unit ?? c.usual_unit) : c.usual_unit, amountIsDefault: !amountTyped,
    }, quiet)
  }

  function openNewForm(t0: TypedItem) {
    setNewDraft({ name: t0.name, ta: isTamil(t0.name) ? t0.name : '', section: 'other', amount: t0.amount ?? 1, unit: t0.unit ?? 'pcs', save: true })
  }

  async function onAdd(e: FormEvent) {
    e.preventDefault()
    if (!typed.name || busy) return
    const match = matchCatalog(index, typed.name)
    if (match) return addFromCatalog(match, typed)
    if (findExisting(items ?? [], typed.name)) {
      await runAdd({ name: typed.name, amount: typed.amount, unit: typed.unit })
      return
    }
    openNewForm(typed)
  }

  async function onNewSubmit() {
    if (!newDraft) return
    const d = newDraft
    const ok = await runAdd({ name: d.name, name_ta: d.ta.trim() || null, section: d.section, amount: d.amount, unit: d.unit })
    if (!ok) return
    setNewDraft(null)
    if (d.save) {
      try {
        await saveOurItem({ householdId: household.id, profileId: profile.id, item: { name: d.name, name_ta: d.ta, section: d.section, amount: d.amount, unit: d.unit } })
      } catch (err) {
        fail(err)
      }
    }
  }

  async function onSaveOurs(item: ShopItem) {
    try {
      await saveOurItem({ householdId: household.id, profileId: profile.id, item: { name: item.name, name_ta: item.name_ta, section: item.section, amount: item.amount, unit: item.unit } })
    } catch (err) {
      fail(err)
    }
  }

  async function onRegulars() {
    setMessage(null)
    try {
      const n = await addRegulars(household.id, items ?? [])
      setMessage(n > 0 ? t('shopping.regularsAdded', { count: n }) : t('shopping.regularsNone'))
    } catch (err) {
      fail(err)
    }
  }

  const dateLabel = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date())
  const text = () => shareText(toBuy, lang, { title: t('shopping.shareTitle', { date: dateLabel }), section: { veg_fruit: t('shopping.section.veg_fruit'), grocery: t('shopping.section.grocery'), dairy_eggs: t('shopping.section.dairy_eggs'), other: t('shopping.section.other') } })

  async function onShare() {
    if (toBuy.length === 0) return setMessage(t('shopping.shareEmpty'))
    const body = text()
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: body })
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) window.open(whatsappLink(body), '_blank', 'noopener')
      }
      return
    }
    window.open(whatsappLink(body), '_blank', 'noopener')
  }

  async function onCopy() {
    if (toBuy.length === 0) return setMessage(t('shopping.shareEmpty'))
    try {
      await navigator.clipboard.writeText(text())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      fail(err)
    }
  }

  async function onClear() {
    setBusy(true)
    try {
      await clearShoppingList(household.id)
      setConfirmClear(false)
      setEditing(null)
      setMessage(t('shopping.cleared'))
    } catch (err) {
      setConfirmClear(false)
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const noteFor = (item: ShopItem): string => {
    if (item.source === 'plan' && item.source_dishes.length > 0) return t('shopping.noteFromPlan', { dishes: item.source_dishes.join(', ') })
    if (item.is_regular || item.source === 'regular') return t('shopping.noteRegular')
    if (item.added_by === profile.id) return t('shopping.noteAddedByYou')
    const who = item.added_by ? nameOf.get(item.added_by) : undefined
    return who ? t('shopping.noteAddedBy', { name: who }) : ''
  }

  // Back goes to wherever the list was opened from (Today or Week); a direct visit goes to Today.
  const back: string | number = typeof window !== 'undefined' && (window.history.state as { idx?: number } | null)?.idx ? -1 : '/today'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
      <BackHeader title={t('shopping.title')} subtitle={items ? t('shopping.summary', { toBuy: toBuy.length, bought: bought.length }) : undefined} to={back} />

      {isError ? (
        <p role="alert" className="rounded-2xl bg-alert-tint px-4 py-3.5 text-[14px] text-alert">{t('shopping.unavailable')}</p>
      ) : (
        <>
          <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/shopping/plan')} className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-saffron px-3 text-[14.5px] font-semibold text-on-saffron">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M4 10h16M9 3v4M15 3v4" />
            </svg>
            {t('shopping.fromPlan')}
          </button>
          <button type="button" onClick={onRegulars} className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-line-strong bg-surface px-4 text-[14.5px] font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
            </svg>
            {t('shopping.regulars')}
          </button>
          </div>

          <div className="sticky top-0 z-10 -mx-5 flex flex-col gap-2 bg-cream px-5 py-2">
          <form onSubmit={onAdd} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={t('shopping.inputLabel')}
              placeholder={t('shopping.placeholder')}
              maxLength={80}
              enterKeyHint="done"
              autoComplete="off"
              className="min-h-[52px] min-w-0 flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface px-4 text-[15px]"
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label={t('shopping.addItem')} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-ink text-cream disabled:opacity-50">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </form>

          <SuggestionList suggestions={suggestions} newName={newName} lang={lang} onPick={(c) => addFromCatalog(c)} onNew={() => openNewForm(typed)} />
          </div>

          {newDraft && <NewItemForm draft={newDraft} lang={lang} busy={busy} onChange={(patch) => setNewDraft({ ...newDraft, ...patch })} onSubmit={onNewSubmit} onCancel={() => setNewDraft(null)} />}

          {added ? <p role="status" className="rounded-2xl bg-leaf-tint px-3.5 py-2.5 text-[13.5px] font-semibold text-leaf">{t('shopping.planAdded', { count: added })}</p> : null}
          {message && <p role="status" className="rounded-2xl bg-sand px-3.5 py-2.5 text-[13.5px] text-ink-soft">{message}</p>}

          {catalog.length > 0 && (
            <button type="button" onClick={() => setBrowse(true)} className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron/60 px-4 text-[14px] font-semibold text-saffron-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
                <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
                <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
                <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
              </svg>
              {t('shopping.browseShow')}
            </button>
          )}

          {isLoading ? (
            <p className="py-6 text-center text-muted">{t('common.loading')}</p>
          ) : groups.length === 0 ? (
            <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('shopping.empty')}</p>
          ) : (
            groups.map((g) => (
              <section key={g.section} className="flex flex-col gap-1.5" aria-label={t(`shopping.section.${g.section}`)}>
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SECTION_COLOR[g.section] }} aria-hidden="true" />
                  <h2 className="font-display text-[16px] font-semibold">{t(`shopping.section.${g.section}`)}</h2>
                  <span className="ml-auto text-[12px] text-muted">{t('shopping.sectionCount', { count: g.items.length })}</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                  {g.items.map((item, i) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      first={i === 0}
                      lang={lang}
                      note={noteFor(item)}
                      canSave={catalog.length > 0 && !matchCatalog(index, item.name) && !(item.name_ta && matchCatalog(index, item.name_ta))}
                      onSaveOurs={() => onSaveOurs(item)}
                      open={editing === item.id}
                      onToggleOpen={() => setEditing(editing === item.id ? null : item.id)}
                      onTick={() => void setBought(household.id, item.id, profile.id).catch(fail)}
                      onPatch={(patch) => void updateShoppingItem(household.id, item.id, patch).catch(fail)}
                      onRemove={() => {
                        setEditing(null)
                        void removeShoppingItem(household.id, item.id).catch(fail)
                      }}
                    />
                  ))}
                </div>
              </section>
            ))
          )}

          {bought.length > 0 && (
            <section className="rounded-2xl bg-sand px-3.5 py-1" aria-label={t('shopping.bought', { count: bought.length })}>
              <div className="flex min-h-[44px] items-center justify-between">
                <h2 className="text-[14px] font-semibold text-ink-soft">{t('shopping.bought', { count: bought.length })}</h2>
                <span className="text-[12px] text-muted">{t('shopping.clearsAfterDay')}</span>
              </div>
              {bought.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked="true"
                  aria-label={t('shopping.untick', { name: itemName(item, lang) })}
                  onClick={() => void setBought(household.id, item.id, null).catch(fail)}
                  className="flex min-h-[44px] w-full items-center gap-3 border-t border-line py-1 text-left"
                >
                  <Tick on />
                  <span className="flex-1 text-[14.5px] text-muted line-through">
                    {itemName(item, lang)}
                    {item.amount !== null && ` · ${formatAmount(item.amount, item.unit, lang)}`}
                  </span>
                  <span className="text-[12px] text-muted">{item.bought_by ? nameOf.get(item.bought_by) : ''}</span>
                </button>
              ))}
            </section>
          )}

          <div className="mt-auto flex flex-col items-center gap-1 pt-2">
            <p className="text-center text-[12px] text-muted">{t('shopping.shareNote', { home: household.name })}</p>
            {isAdmin && (items?.length ?? 0) > 0 && (
              <button type="button" onClick={() => setConfirmClear(true)} className="min-h-[44px] rounded-xl px-3 text-[13.5px] font-semibold text-alert">
                {t('shopping.clearList')}
              </button>
            )}
          </div>

          <div className="sticky bottom-16 -mx-5 flex gap-2 border-t border-line bg-cream px-5 pb-3 pt-3">
            <button type="button" onClick={onShare} className="flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-2xl bg-ink px-4 text-[15px] font-semibold text-cream">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z" />
              </svg>
              {t('shopping.share')}
            </button>
            <button type="button" onClick={onCopy} className="min-h-[52px] rounded-2xl border-[1.5px] border-line-strong bg-surface px-4 text-[14.5px] font-semibold">
              {copied ? t('shopping.copied') : t('shopping.copy')}
            </button>
          </div>
        </>
      )}

      {browse && <BrowseSheet items={catalog} lang={lang} isOnList={(c) => onListNames.has(canon(c.name_en))} onPick={(c) => addFromCatalog(c, undefined, true)} onClose={() => setBrowse(false)} />}

      {confirmClear && (
        <Dialog title={t('shopping.clearTitle')} onClose={() => setConfirmClear(false)}>
          <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-5 pt-5">
            <h2 className="font-display text-[19px] font-bold leading-tight">{t('shopping.clearTitle')}</h2>
            <p className="text-[14.5px] text-ink-soft">{t('shopping.clearBody', { home: household.name })}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmClear(false)} className="min-h-[48px] flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface text-[14.5px] font-semibold">
                {t('common.cancel')}
              </button>
              <button type="button" onClick={onClear} disabled={busy} className="min-h-[48px] flex-1 rounded-2xl bg-alert text-[14.5px] font-semibold text-on-solid disabled:opacity-60">
                {t('shopping.clearConfirm')}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </main>
  )
}

function Tick({ on }: { on: boolean }) {
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

type Patch = Partial<Pick<ShopItem, 'amount' | 'unit' | 'section' | 'is_regular'>>

function ItemRow({ item, first, lang, note, canSave, onSaveOurs, open, onToggleOpen, onTick, onPatch, onRemove }: { item: ShopItem; first: boolean; lang: 'en' | 'ta'; note: string; canSave: boolean; onSaveOurs: () => Promise<void>; open: boolean; onToggleOpen: () => void; onTick: () => void; onPatch: (p: Patch) => void; onRemove: () => void }) {
  const { t } = useTranslation()
  const name = itemName(item, lang)
  const other = secondName(item, lang)
  const amount = formatAmount(item.amount, item.unit, lang)
  const [saved, setSaved] = useState(false)

  function step(direction: 1 | -1) {
    const next = nudge(item.amount, item.unit, direction)
    onPatch({ amount: next.amount, unit: next.amount === null ? null : next.unit })
  }

  function pickUnit(unit: ShopUnit) {
    onPatch({ unit, amount: item.amount === null ? null : changeUnit(item.amount, item.unit, unit) })
  }

  return (
    <div className={first ? '' : 'border-t border-line'}>
      <div className="flex items-center gap-1 px-1.5 py-1">
        <button type="button" role="checkbox" aria-checked="false" aria-label={t('shopping.tick', { name })} onClick={onTick} className="flex h-11 w-11 shrink-0 items-center justify-center">
          <Tick on={false} />
        </button>
        <span className="flex min-w-0 flex-1 flex-col gap-px py-1">
          <span className="text-[15px] font-medium">
            {name}
            {other && <span lang={lang === 'ta' ? 'en' : 'ta'} className="ml-1.5 text-[12.5px] font-normal text-muted">{other}</span>}
          </span>
          {note && <span className="text-[12px] text-muted">{note}</span>}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-label={amount ? t('shopping.editAmount', { name, amount }) : t('shopping.setAmount', { name })}
          onClick={onToggleOpen}
          className={`flex min-h-[44px] min-w-16 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] px-2.5 text-[13.5px] font-semibold ${open ? 'border-saffron bg-saffron-tint' : 'border-line bg-surface'}`}
        >
          {amount || t('shopping.amountButton')}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="mx-2.5 mb-3 flex flex-col gap-2.5 rounded-2xl border border-saffron/40 bg-saffron-tint p-3">
          <div className="flex items-center gap-2.5">
            <button type="button" aria-label={t('shopping.less')} onClick={() => step(-1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">−</button>
            <span aria-live="polite" className="flex-1 text-center font-display text-[20px] font-semibold">{amount || '—'}</span>
            <button type="button" aria-label={t('shopping.more')} onClick={() => step(1)} className="h-11 w-11 rounded-xl border-[1.5px] border-line-strong bg-surface text-[22px] font-semibold">+</button>
          </div>

          <div role="radiogroup" aria-label={t('shopping.unit')} className="flex flex-wrap gap-1.5">
            {UNITS.map((u) => (
              <button key={u} type="button" role="radio" aria-checked={item.unit === u} onClick={() => pickUnit(u)} className={chip(item.unit === u)}>
                {unitLabel(u, lang, 2)}
              </button>
            ))}
            <button type="button" role="radio" aria-checked={item.amount === null} onClick={() => onPatch({ amount: null, unit: null })} className={chip(item.amount === null)}>
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

          {canSave && !saved && (
            <button type="button" onClick={() => void onSaveOurs().then(() => setSaved(true))} className="min-h-[44px] rounded-xl border-[1.5px] border-dashed border-saffron/60 bg-surface px-3 text-[13.5px] font-semibold text-saffron-ink">
              {t('shopping.saveOurs')}
            </button>
          )}
          {saved && <span role="status" className="text-[12.5px] font-semibold text-leaf">{t('shopping.savedOurs')}</span>}

          <button type="button" role="switch" aria-checked={item.is_regular} onClick={() => onPatch({ is_regular: !item.is_regular })} className={`min-h-[44px] rounded-xl border-[1.5px] px-3 text-[13.5px] font-semibold ${item.is_regular ? 'border-saffron bg-surface text-saffron-ink' : 'border-dashed border-line-strong bg-surface text-ink'}`}>
            {item.is_regular ? t('shopping.regularOn') : t('shopping.regularToggle')}
          </button>

          <div className="flex gap-2">
            <button type="button" onClick={onRemove} className="min-h-[44px] rounded-xl border-[1.5px] border-alert/50 bg-surface px-3.5 text-[13.5px] font-semibold text-alert">{t('shopping.remove')}</button>
            <button type="button" onClick={onToggleOpen} className="min-h-[44px] flex-1 rounded-xl bg-ink text-[14px] font-semibold text-cream">{t('shopping.done')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
