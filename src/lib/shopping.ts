// The shopping list: types and the pure logic (typed-text parsing, amounts, grouping, the WhatsApp text). No network here.
// Units are only ever g, kg, ml, L, pcs, bunch or pack: nothing finer, and never cups or spoons.

export type ShopSection = 'veg_fruit' | 'grocery' | 'dairy_eggs' | 'other'
export type ShopUnit = 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'bunch' | 'pack'
export type ShopSource = 'manual' | 'plan' | 'regular'

/** The order the sections are shown in (vegetables and fruit are bought most often, so they come first). */
export const SECTIONS: ShopSection[] = ['veg_fruit', 'grocery', 'dairy_eggs', 'other']
export const UNITS: ShopUnit[] = ['g', 'kg', 'ml', 'L', 'pcs', 'bunch', 'pack']

/** Colour of each section's dot (theme tokens, so they work in dark mode). */
export const SECTION_COLOR: Record<ShopSection, string> = {
  veg_fruit: 'var(--color-leaf)',
  grocery: 'var(--color-saffron)',
  dairy_eggs: 'var(--color-meal-dinner)',
  other: 'var(--color-muted)',
}

export type ShopItem = {
  id: string
  household_id: string
  name: string
  name_ta: string | null
  section: ShopSection
  amount: number | null
  unit: ShopUnit | null
  note: string | null
  source: ShopSource
  source_dishes: string[]
  is_regular: boolean
  added_by: string | null
  bought_at: string | null
  bought_by: string | null
  created_at: string
}

const DAY_MS = 24 * 60 * 60 * 1000

/** How far the − and + buttons move an amount. */
export const STEP: Record<ShopUnit, number> = { kg: 0.5, L: 0.5, g: 100, ml: 100, pcs: 1, bunch: 1, pack: 1 }

const UNIT_LABEL: Record<'en' | 'ta', Record<ShopUnit, [string, string]>> = {
  en: { g: ['g', 'g'], kg: ['kg', 'kg'], ml: ['ml', 'ml'], L: ['L', 'L'], pcs: ['pc', 'pcs'], bunch: ['bunch', 'bunches'], pack: ['pack', 'packs'] },
  ta: { g: ['கி', 'கி'], kg: ['கிலோ', 'கிலோ'], ml: ['மிலி', 'மிலி'], L: ['லி', 'லி'], pcs: ['எண்', 'எண்'], bunch: ['கட்டு', 'கட்டு'], pack: ['பாக்கெட்', 'பாக்கெட்'] },
}

export function unitLabel(unit: ShopUnit, lang: 'en' | 'ta', amount = 2): string {
  return UNIT_LABEL[lang][unit][amount === 1 ? 0 : 1]
}

/** Trims float noise ("0.30000000000000004") and drops a useless ".0". */
export function cleanNumber(n: number): number {
  return Math.round(n * 100) / 100
}

/** "1 kg", "500 g", "1 pc", "4 pcs", "1 bunch"; an item with no amount shows nothing. */
export function formatAmount(amount: number | null, unit: ShopUnit | null, lang: 'en' | 'ta' = 'en'): string {
  if (amount === null || unit === null) return ''
  return `${cleanNumber(amount)} ${unitLabel(unit, lang, amount)}`
}

/** One tap of − or +. Never goes below one step; starting from "no amount" a + gives one usual step. */
export function nudge(amount: number | null, unit: ShopUnit | null, direction: 1 | -1): { amount: number | null; unit: ShopUnit } {
  const u = unit ?? 'pcs'
  const step = STEP[u]
  if (amount === null) return direction === 1 ? { amount: step === 100 ? 250 : 1, unit: u } : { amount: null, unit: u }
  return { amount: Math.max(step, cleanNumber(amount + direction * step)), unit: u }
}

/** Picking another unit chip: g↔kg and ml↔L convert, and an amount that would look silly in the new unit is reset. */
export function changeUnit(amount: number | null, from: ShopUnit | null, to: ShopUnit): number | null {
  if (amount === null) return null
  if (from === to) return amount
  if (from === 'kg' && to === 'g') return cleanNumber(amount * 1000)
  if (from === 'g' && to === 'kg') return amount >= 100 ? cleanNumber(amount / 1000) : 1
  if (from === 'L' && to === 'ml') return cleanNumber(amount * 1000)
  if (from === 'ml' && to === 'L') return amount >= 100 ? cleanNumber(amount / 1000) : 1
  if ((to === 'g' || to === 'ml') && amount < 50) return 250
  if ((to === 'kg' || to === 'L') && amount >= 20) return 1
  if (STEP[to] >= 1 && amount < 1) return 1
  return amount
}

// ── Typed text ──
const UNIT_WORDS: Record<string, ShopUnit> = {
  g: 'g', gm: 'g', gms: 'g', gram: 'g', grams: 'g', 'கிராம்': 'g', 'கி': 'g',
  kg: 'kg', kgs: 'kg', kilo: 'kg', kilos: 'kg', 'கிலோ': 'kg',
  ml: 'ml', 'மிலி': 'ml', 'மில்லி': 'ml',
  l: 'L', ltr: 'L', ltrs: 'L', litre: 'L', litres: 'L', liter: 'L', liters: 'L', 'லிட்டர்': 'L', 'லி': 'L',
  pc: 'pcs', pcs: 'pcs', piece: 'pcs', pieces: 'pcs', no: 'pcs', nos: 'pcs', 'எண்': 'pcs',
  bunch: 'bunch', bunches: 'bunch', 'கட்டு': 'bunch',
  pack: 'pack', packs: 'pack', packet: 'pack', packets: 'pack', 'பாக்கெட்': 'pack',
}

const NUMBER = String.raw`(\d+(?:\.\d+)?)`
const UNIT_RE = String.raw`([\p{L}\p{M}.]+)?`
const AFTER = new RegExp(String.raw`^(.*?)\s+${NUMBER}\s*${UNIT_RE}$`, 'u')
const BEFORE = new RegExp(String.raw`^${NUMBER}\s*${UNIT_RE}\s+(.+)$`, 'u')

export function isTamil(text: string): boolean {
  return /[஀-௿]/.test(text)
}

export type TypedItem = { name: string; amount: number | null; unit: ShopUnit | null }

/** "tomato 1 kg", "tomato 500g", "milk 2 l", "eggs 12", "2 kg onion" → name + amount + unit. A number with no unit leaves the unit empty
 * (the caller picks the item's usual unit, or pieces). A trailing word that is not a unit stays part of the name ("curry leaves 2"). */
export function parseTyped(text: string): TypedItem {
  const t = text.trim().replace(/\s+/g, ' ')
  if (!t) return { name: '', amount: null, unit: null }
  const after = AFTER.exec(t)
  if (after) {
    const [, name, num, word] = after
    const unit = word ? UNIT_WORDS[word.toLowerCase().replace(/\.$/, '')] : undefined
    if (!word || unit) return { name: name!.trim(), amount: Number(num), unit: unit ?? null }
  }
  const before = BEFORE.exec(t)
  if (before) {
    const [, num, word, name] = before
    const unit = word ? UNIT_WORDS[word.toLowerCase().replace(/\.$/, '')] : undefined
    if (unit) return { name: name!.trim(), amount: Number(num), unit }
  }
  return { name: t, amount: null, unit: null }
}

// ── The list ──
export const nameKey = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ')

/** An item with this name already in the home's list (on the list, bought or asleep), if any: adding it again opens that one. */
export function findExisting(items: ShopItem[], name: string): ShopItem | undefined {
  const key = nameKey(name)
  if (!key) return undefined
  return items.find((i) => nameKey(i.name) === key || (i.name_ta !== null && nameKey(i.name_ta) === key))
}

/** Items still to buy (not ticked), and items ticked within the last day (newest first). Older ticked items are hidden. */
export function splitList(items: ShopItem[], now = Date.now()): { toBuy: ShopItem[]; bought: ShopItem[] } {
  const toBuy = items.filter((i) => i.bought_at === null)
  const bought = items
    .filter((i) => i.bought_at !== null && now - new Date(i.bought_at).getTime() < DAY_MS)
    .sort((a, b) => new Date(b.bought_at!).getTime() - new Date(a.bought_at!).getTime())
  return { toBuy, bought }
}

/** Sleeping regulars: starred items that are no longer on the list or under "Bought". */
export function sleepingRegulars(items: ShopItem[], now = Date.now()): ShopItem[] {
  return items.filter((i) => i.is_regular && i.bought_at !== null && now - new Date(i.bought_at).getTime() >= DAY_MS)
}

/** The items of each section, in the order they were added; empty sections are left out. */
export function groupBySection(items: ShopItem[]): { section: ShopSection; items: ShopItem[] }[] {
  return SECTIONS.map((section) => ({
    section,
    items: items.filter((i) => i.section === section).sort((a, b) => a.created_at.localeCompare(b.created_at)),
  })).filter((g) => g.items.length > 0)
}

export const itemName = (item: Pick<ShopItem, 'name' | 'name_ta'>, lang: 'en' | 'ta') => (lang === 'ta' && item.name_ta ? item.name_ta : item.name)

/** The "other language" name shown small beside the main one (nothing when it would repeat). */
export function secondName(item: Pick<ShopItem, 'name' | 'name_ta'>, lang: 'en' | 'ta'): string | null {
  const other = lang === 'ta' ? item.name : item.name_ta
  return other && other !== itemName(item, lang) ? other : null
}

/** The plain text sent on WhatsApp or copied: items and amounts only, grouped by section. Nothing else about the home or its people. */
export function shareText(items: ShopItem[], lang: 'en' | 'ta', labels: { title: string; section: Record<ShopSection, string> }): string {
  const lines = [labels.title]
  for (const g of groupBySection(items)) {
    lines.push('', labels.section[g.section])
    for (const i of g.items) {
      const amount = formatAmount(i.amount, i.unit, lang)
      lines.push(amount ? `• ${itemName(i, lang)} · ${amount}` : `• ${itemName(i, lang)}`)
    }
  }
  return lines.join('\n')
}

/** wa.me link that opens WhatsApp with the text ready to send (used when the phone has no share sheet). */
export const whatsappLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`
