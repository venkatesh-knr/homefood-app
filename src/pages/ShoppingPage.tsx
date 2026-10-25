import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useHome } from '../lib/homeContext'
import { useMembers } from '../lib/queries'
import { useShopCatalogue, useShoppingItems } from '../lib/shoppingQueries'
import { addRegulars, addShoppingItem, clearShoppingList, pruneBought, removeShoppingItem, saveOurItem, setBought, updateShoppingItem, type NewItem } from '../lib/shoppingMutations'
import {
  ADD_TABS, SECTION_COLOR, atMinimum, canon, findExisting, formatAmount, groupBySection, isTamil, itemName, itemsOfAddTab, matchCatalog, nudge, parseTyped, regularsToAdd, secondName, shareText, splitList, suggestItems, whatsappLink,
  type AddTab, type CatalogItem, type ShopItem, type TypedItem,
} from '../lib/shopping'
import { describeError } from '../lib/errors'
import { BackHeader } from '../components/BackHeader'
import { Dialog } from '../components/Dialog'
import { NewItemForm, type NewItemDraft } from '../components/ShopCatalogue'
import { AddRow, AmountSheet, ListRow, Tick, type ItemPatch } from '../components/ShopRows'
import { catalogNames } from '../components/shopUi'

type Tab = 'buy' | 'add'

/** The home's shared shopping list, in two tabs: To buy (tick, change amounts) and Add items (the whole common list, with the usual amounts).
 * Anyone with a login adds, edits and ticks; only the Admin can clear it. */
export default function ShoppingPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ta'
  const { profile, household } = useHome()
  const { data: members } = useMembers(household.id)
  const { data: items, isLoading, isError } = useShoppingItems(household.id, { live: true })
  const [tab, setTab] = useState<Tab>('buy')
  const [addTab, setAddTab] = useState<AddTab | null>(null)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [newDraft, setNewDraft] = useState<NewItemDraft | null>(null)
  const { items: catalog, index } = useShopCatalogue(household.id)
  const isAdmin = profile.role === 'admin'
  const navigate = useNavigate()
  const added = (useLocation().state as { added?: number } | null)?.added

  const nameOf = useMemo(() => new Map((members ?? []).map((m) => [m.id, m.display_name])), [members])
  const { toBuy, bought } = useMemo(() => splitList(items ?? []), [items])
  const groups = useMemo(() => groupBySection(toBuy), [toBuy])
  const regulars = useMemo(() => (items ?? []).filter((i) => i.is_regular).sort((a, b) => itemName(a, lang).localeCompare(itemName(b, lang))), [items, lang])
  const regularsWaiting = useMemo(() => regularsToAdd(items ?? []), [items])
  const onListByName = useMemo(() => {
    const m = new Map<string, ShopItem>()
    for (const i of toBuy) {
      m.set(canon(i.name), i)
      if (i.name_ta) m.set(canon(i.name_ta), i)
    }
    return m
  }, [toBuy])
  const onListOf = (c: CatalogItem): ShopItem | undefined => onListByName.get(canon(c.name_en)) ?? (c.name_ta ? onListByName.get(canon(c.name_ta)) : undefined)
  const editingItem = editing ? toBuy.find((i) => i.id === editing) : undefined

  const typed = useMemo(() => parseTyped(draft), [draft])
  const searching = typed.name.length >= 2
  const results = useMemo(() => (searching ? suggestItems(catalog, typed.name, 40) : []), [catalog, typed.name, searching])
  const knownName = searching && (matchCatalog(index, typed.name) !== undefined || findExisting(items ?? [], typed.name) !== undefined)
  const activeAddTab: AddTab = addTab ?? (regulars.length > 0 ? 'regulars' : 'vegetables')

  // Ticked items older than a day that are not regulars have no use any more: tidy them away, quietly.
  useEffect(() => {
    if (items) void pruneBought(household.id, items)
  }, [items, household.id])

  const fail = (err: unknown) => setMessage(describeError(err, t))

  /** Adds the item (or finds the one already there). Quiet adds (the Add buttons) say nothing: the row turns into a stepper. */
  async function runAdd(item: NewItem, quiet = false): Promise<boolean> {
    setBusy(true)
    setMessage(null)
    try {
      const result = await addShoppingItem({ householdId: household.id, profileId: profile.id, items: items ?? [], item })
      if (quiet) return true
      setDraft('')
      if (result.kind === 'opened') setMessage(t('shopping.openedExisting', { name: item.name }))
      else if (result.kind === 'restored') setMessage(t('shopping.restored', { name: item.name }))
      else setMessage(t('shopping.added', { name: item.name }))
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

  /** One tap of − or + on an item that is on the list. In the Add items tab, a − at the smallest amount takes the item off the list. */
  function stepItem(item: ShopItem, direction: 1 | -1, removeAtMinimum: boolean) {
    if (direction === -1 && removeAtMinimum && atMinimum(item.amount, item.unit)) {
      void removeShoppingItem(household.id, item.id).catch(fail)
      return
    }
    const next = nudge(item.amount, item.unit, direction)
    void updateShoppingItem(household.id, item.id, { amount: next.amount, unit: next.amount === null ? null : next.unit }).catch(fail)
  }

  const dateLabel = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date())
  const text = () => shareText(toBuy, lang, { title: t('shopping.shareTitle', { date: dateLabel }), section: { veg_fruit: t('shopping.section.veg_fruit'), grocery: t('shopping.section.grocery'), dairy_eggs: t('shopping.section.dairy_eggs'), other: t('shopping.section.other') } })

  async function onShare() {
    if (toBuy.length === 0) return setMessage(t('shopping.shareEmpty'))
    const body = text()
    setShareOpen(false)
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
  const otherLang = lang === 'ta' ? 'en' : 'ta'

  const shareButton = (
    <button type="button" aria-expanded={shareOpen} onClick={() => setShareOpen((o) => !o)} className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border-[1.5px] border-line-strong bg-surface px-3 text-[13.5px] font-semibold">
      <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z" />
      </svg>
      {t('shopping.shareShort')}
    </button>
  )

  const catalogRow = (c: CatalogItem, first: boolean) => {
    const n = catalogNames(c, lang)
    const on = onListOf(c)
    // an amount typed with the name ("2 kg onion") goes to the item the name matches exactly, whether Enter or its Add button is used
    const typedHere = searching && typed.amount != null && matchCatalog(index, typed.name)?.key === c.key ? typed : undefined
    return (
      <div key={c.key} className={first ? '' : 'border-t border-line'}>
        <AddRow
          title={n.main}
          other={n.other}
          ours={c.source === 'ours'}
          caption={typedHere ? t('shopping.typedAmount', { amount: formatAmount(typedHere.amount!, typedHere.unit ?? c.usual_unit, lang) }) : t('shopping.usually', { amount: formatAmount(c.usual_amount, c.usual_unit, lang) })}
          onList={on ? { amount: on.amount, unit: on.unit } : null}
          lang={lang}
          busy={busy}
          onAdd={() => addFromCatalog(c, typedHere, true)}
          onLess={() => on && stepItem(on, -1, true)}
          onMore={() => on && stepItem(on, 1, false)}
        />
      </div>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-3 px-5 pb-8">
      <BackHeader title={t('shopping.title')} subtitle={items ? t('shopping.summary', { toBuy: toBuy.length, bought: bought.length }) : undefined} to={back} action={shareButton} />

      {isError ? (
        <p role="alert" className="rounded-2xl bg-alert-tint px-4 py-3.5 text-[14px] text-alert">{t('shopping.unavailable')}</p>
      ) : (
        <>
          {shareOpen && (
            <div className="flex gap-2 rounded-2xl border border-line bg-surface p-2">
              <button type="button" onClick={onShare} className="min-h-[48px] flex-[3] rounded-xl bg-ink px-3 text-center text-[14.5px] leading-snug font-semibold text-cream">{t('shopping.share')}</button>
              <button type="button" onClick={onCopy} className="min-h-[48px] flex-[2] rounded-xl border-[1.5px] border-line-strong bg-surface px-3 text-center text-[14px] leading-snug font-semibold">{copied ? t('shopping.copied') : t('shopping.copy')}</button>
            </div>
          )}

          <div role="tablist" aria-label={t('shopping.title')} className="sticky top-0 z-10 grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
            {(['buy', 'add'] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`min-h-[48px] rounded-xl px-2 text-center text-[15px] leading-snug font-semibold ${tab === id ? 'bg-surface shadow-sm' : 'text-ink-soft'}`}
              >
                {id === 'buy' ? t('shopping.tabBuy', { count: toBuy.length }) : t('shopping.tabAdd')}
              </button>
            ))}
          </div>

          {added ? <p role="status" className="rounded-2xl bg-leaf-tint px-3.5 py-2.5 text-[13.5px] font-semibold text-leaf">{t('shopping.planAdded', { count: added })}</p> : null}
          {message && <p role="status" className="rounded-2xl bg-sand px-3.5 py-2.5 text-[13.5px] text-ink-soft">{message}</p>}

          {tab === 'buy' ? (
            <div role="tabpanel" aria-label={t('shopping.tabBuy', { count: toBuy.length })} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onRegulars} className="flex min-h-[44px] items-center gap-2 rounded-full border-[1.5px] border-line-strong bg-surface px-4 text-[13.5px] leading-snug font-semibold">
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                  </svg>
                  {t('shopping.addRegulars', { count: regularsWaiting.length })}
                </button>
                <button type="button" onClick={() => navigate('/shopping/plan')} className="flex min-h-[44px] items-center gap-2 rounded-full border-[1.5px] border-line-strong bg-surface px-4 text-[13.5px] leading-snug font-semibold">
                  {t('shopping.weekMeals')}
                </button>
              </div>

              {isLoading ? (
                <p className="py-6 text-center text-muted">{t('common.loading')}</p>
              ) : groups.length === 0 ? (
                <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-sand px-4 py-4 text-center">
                  <p className="text-[14px] text-ink-soft">{t('shopping.emptyBuy')}</p>
                  <button type="button" onClick={() => setTab('add')} className="min-h-[44px] rounded-xl bg-ink px-5 text-[14px] font-semibold text-cream">{t('shopping.tabAdd')}</button>
                </div>
              ) : (
                groups.map((g) => (
                  <section key={g.section} className="flex flex-col gap-1.5" aria-label={t(`shopping.section.${g.section}`)}>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: SECTION_COLOR[g.section] }} aria-hidden="true" />
                      <h2 className="font-display text-[16px] font-semibold">
                        {t(`shopping.section.${g.section}`)}
                        <span lang={otherLang} className="ml-1.5 font-sans text-[12px] font-normal text-muted">{t(`shopping.section.${g.section}`, { lng: otherLang })}</span>
                      </h2>
                      <span className="ml-auto shrink-0 text-[12px] text-muted">{t('shopping.sectionCount', { count: g.items.length })}</span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                      {g.items.map((item, i) => (
                        <ListRow
                          key={item.id}
                          item={item}
                          first={i === 0}
                          lang={lang}
                          note={noteFor(item)}
                          onTick={() => void setBought(household.id, item.id, profile.id).catch(fail)}
                          onPatch={(patch: ItemPatch) => void updateShoppingItem(household.id, item.id, patch).catch(fail)}
                          onOpen={() => setEditing(item.id)}
                        />
                      ))}
                    </div>
                  </section>
                ))
              )}

              {bought.length > 0 && (
                <section className="rounded-2xl bg-sand px-3.5 py-1" aria-label={t('shopping.bought', { count: bought.length })}>
                  <div className="flex min-h-[44px] items-center justify-between gap-2">
                    <h2 className="text-[14px] font-semibold text-ink-soft">{t('shopping.bought', { count: bought.length })}</h2>
                    <span className="text-right text-[12px] text-muted">{t('shopping.tickAgain')}</span>
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
                      <span className="min-w-0 flex-1 break-words text-[14.5px] text-muted line-through">
                        {itemName(item, lang)}
                        {item.amount !== null && ` · ${formatAmount(item.amount, item.unit, lang)}`}
                      </span>
                      <span className="shrink-0 text-[12px] text-muted">{item.bought_by ? nameOf.get(item.bought_by) : ''}</span>
                    </button>
                  ))}
                </section>
              )}

              <div className="flex flex-col items-center gap-1 pt-2">
                <p className="text-center text-[12px] text-muted">{t('shopping.shareNote', { home: household.name })}</p>
                {isAdmin && (items?.length ?? 0) > 0 && (
                  <button type="button" onClick={() => setConfirmClear(true)} className="min-h-[44px] rounded-xl px-3 text-[13.5px] font-semibold text-alert">
                    {t('shopping.clearList')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div role="tabpanel" aria-label={t('shopping.tabAdd')} className="flex flex-col gap-3">
              <button type="button" onClick={() => navigate('/shopping/plan')} className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-saffron px-3 text-center text-[14.5px] leading-snug font-semibold text-on-saffron">
                <svg className="shrink-0" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="15" rx="2" />
                  <path d="M4 10h16M9 3v4M15 3v4" />
                </svg>
                {t('shopping.addWhatMealsNeed')}
              </button>

              <form onSubmit={onAdd} className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label={t('shopping.inputLabel')}
                  placeholder={t('shopping.searchPlaceholder')}
                  maxLength={80}
                  enterKeyHint="done"
                  autoComplete="off"
                  className="min-h-[48px] min-w-0 flex-1 rounded-2xl border-[1.5px] border-line-strong bg-surface px-4 text-[15px]"
                />
                <button type="submit" disabled={busy || !draft.trim()} aria-label={t('shopping.addItem')} className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-2xl bg-ink text-cream disabled:opacity-50">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </form>

              {!searching && (
                <div role="tablist" aria-label={t('shopping.tabAdd')} className="flex flex-wrap gap-1.5">
                  {ADD_TABS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={activeAddTab === id}
                      onClick={() => setAddTab(id)}
                      className={`min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold ${activeAddTab === id ? 'border-[1.5px] border-ink bg-ink text-cream' : 'border border-line-strong bg-surface text-ink'}`}
                    >
                      {id === 'regulars' ? `★ ${t('shopping.tab.regulars')}` : t(`shopping.tab.${id}`)}
                    </button>
                  ))}
                </div>
              )}

              {searching ? (
                results.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-line bg-surface">{results.map((c, i) => catalogRow(c, i === 0))}</div>
                ) : (
                  <p className="rounded-2xl bg-sand px-4 py-3 text-center text-[14px] text-ink-soft">{t('shopping.noMatch')}</p>
                )
              ) : activeAddTab === 'regulars' ? (
                regulars.length === 0 ? (
                  <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{t('shopping.regularsTabEmpty')}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {regularsWaiting.length > 0 && (
                      <button type="button" onClick={onRegulars} className="min-h-[44px] self-start rounded-xl border-[1.5px] border-line-strong bg-surface px-4 text-[13.5px] font-semibold">
                        {t('shopping.addAll', { count: regularsWaiting.length })}
                      </button>
                    )}
                    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                      {regulars.map((r, i) => {
                        const on = r.bought_at === null
                        return (
                          <div key={r.id} className={i === 0 ? '' : 'border-t border-line'}>
                            <AddRow
                              title={itemName(r, lang)}
                              other={secondName(r, lang)}
                              ours={false}
                              caption={r.amount !== null ? t('shopping.usually', { amount: formatAmount(r.amount, r.unit, lang) }) : t('shopping.noteRegular')}
                              onList={on ? { amount: r.amount, unit: r.unit } : null}
                              lang={lang}
                              busy={busy}
                              onAdd={() => void setBought(household.id, r.id, null).catch(fail)}
                              onLess={() => stepItem(r, -1, true)}
                              onMore={() => stepItem(r, 1, false)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              ) : (
                (() => {
                  const rows = itemsOfAddTab(catalog, activeAddTab)
                  return rows.length === 0 ? (
                    <p className="rounded-2xl bg-sand px-4 py-3.5 text-center text-[14px] text-ink-soft">{activeAddTab === 'ours' ? t('shopping.oursEmptyTab') : t('shopping.noMatch')}</p>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-line bg-surface">{rows.map((c, i) => catalogRow(c, i === 0))}</div>
                  )
                })()
              )}

              {newDraft ? (
                <NewItemForm draft={newDraft} lang={lang} busy={busy} onChange={(patch) => setNewDraft({ ...newDraft, ...patch })} onSubmit={onNewSubmit} onCancel={() => setNewDraft(null)} />
              ) : (
                <button type="button" onClick={() => openNewForm(knownName ? { name: '', amount: null, unit: null } : typed)} className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-saffron/60 px-4 text-center text-[14px] leading-snug font-semibold text-saffron-ink">
                  <span aria-hidden="true">+</span>
                  {t('shopping.notHere')}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {editingItem && (
        <AmountSheet
          item={editingItem}
          lang={lang}
          canSave={catalog.length > 0 && !matchCatalog(index, editingItem.name) && !(editingItem.name_ta && matchCatalog(index, editingItem.name_ta))}
          onSaveOurs={() => onSaveOurs(editingItem)}
          onPatch={(patch: ItemPatch) => void updateShoppingItem(household.id, editingItem.id, patch).catch(fail)}
          onRemove={() => {
            setEditing(null)
            void removeShoppingItem(household.id, editingItem.id).catch(fail)
          }}
          onClose={() => setEditing(null)}
        />
      )}

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
