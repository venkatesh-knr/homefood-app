// The cook's sheet: one day's cooking as a plain message for the helper or whoever is cooking (WhatsApp, copy, print).
// Dishes, head counts and cooks only: no photos, nutrition, votes, comments or other household details. Pure logic, no network.
import en from '../i18n/en.json'
import ta from '../i18n/ta.json'
import type { MealType } from './planner'
import { PREF_FLAGS, cookingNotes, type PrefFlag, type Preferences } from './diets'

export type SheetLang = 'en' | 'ta'
export type SheetMember = { id: string; name: string; kind: 'family' | 'helper' }
type DishLike = { name: string; allergens?: string[]; dish_names: { language: string; name: string }[] }
export type SheetSlot = {
  meal: string
  source: string
  main_dish: DishLike | null
  meal_slot_sides: { position: number; dish: DishLike; is_leftover?: boolean }[]
  meal_slot_cooks: { profile_id: string }[]
  meal_slot_eaters: { profile_id: string }[]
}
/** A night-before task to mention at the end ("Tonight: …"). */
export type SheetPrep = { text: { en: string; ta: string | null }; dish: { en: string; ta: string | null } }

const WORDS = {
  en: { eating: 'Eating out', ordering: 'Ordering in', note: 'Note', tonight: 'Tonight', people: (n: number) => `${n}`, helper: null as string | null, leftover: (dish: string) => `use leftover ${dish}` },
  ta: { eating: 'வெளியில் சாப்பிடுகிறோம்', ordering: 'ஆர்டர் செய்கிறோம்', note: 'கவனிக்க', tonight: 'இன்றிரவு', people: (n: number) => `${n} பேர்`, helper: 'உதவியாளர்', leftover: (dish: string) => `மீதமுள்ள ${dish} (பயன்படுத்தவும்)` },
}

/** What each cooking preference says on the sheet ("less salt for 1 person"). */
const PREF_WORDS: Record<SheetLang, Record<PrefFlag, string>> = {
  en: { low_salt: 'less salt', low_oil: 'less oil', low_sugar: 'less sugar', no_onion_garlic: 'no onion or garlic' },
  ta: { low_salt: 'உப்பு குறைவாக', low_oil: 'எண்ணெய் குறைவாக', low_sugar: 'சர்க்கரை குறைவாக', no_onion_garlic: 'வெங்காயம், பூண்டு வேண்டாம்' },
}

const mealName = (meal: string, lang: SheetLang) => ((lang === 'ta' ? ta : en).meal as Record<string, string>)[meal] ?? meal
const dishName = (d: DishLike, lang: SheetLang) => d.dish_names.find((n) => n.language === lang)?.name ?? d.dish_names.find((n) => n.language === 'en')?.name ?? d.name

/** "Thursday 1 Oct" / "வியாழன், 1 அக்." (assembled by hand so the order is the same whatever the browser's locale data says) */
export function dayLabel(date: string, lang: SheetLang): string {
  const parts = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'short' }).formatToParts(new Date(`${date}T00:00:00`))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekday = get('weekday')
  const rest = `${get('day')} ${get('month')}`
  return lang === 'ta' ? `${weekday}, ${rest}` : `${weekday} ${rest}`
}

/** Who is affected, by what: the dishes of each home meal against the allergies of the people eating it (the same cross-check as the Week cards). */
export function allergyNotes(slots: SheetSlot[], members: SheetMember[], allergies: Map<string, string[]>): Map<string, string[]> {
  const family = members.filter((m) => m.kind === 'family')
  const byAllergen = new Map<string, string[]>()
  for (const s of slots) {
    if (s.source !== 'home') continue
    const dishes = [s.main_dish, ...s.meal_slot_sides.map((x) => x.dish)].filter((d): d is DishLike => d !== null)
    const contains = new Set(dishes.flatMap((d) => d.allergens ?? []))
    if (contains.size === 0) continue
    const eaters = s.meal_slot_eaters.length > 0 ? family.filter((m) => s.meal_slot_eaters.some((e) => e.profile_id === m.id)) : family
    for (const m of eaters) {
      for (const a of allergies.get(m.id) ?? []) {
        if (!contains.has(a)) continue
        const names = byAllergen.get(a) ?? []
        if (!names.includes(m.name)) byAllergen.set(a, [...names, m.name])
      }
    }
  }
  return byAllergen
}

function noteLine(notes: Map<string, string[]>, lang: SheetLang, namesOn: boolean): string {
  const parts = [...notes.entries()].map(([allergen, names]) => {
    if (lang === 'ta') {
      if (namesOn) return `${allergen} கூடாது — ${names.join(', ')}`
      return `${names.length === 1 ? 'ஒருவருக்கு' : `${names.length} பேருக்கு`} ${allergen} கூடாது`
    }
    if (namesOn) return `no ${allergen} for ${names.join(', ')}`
    return `${names.length} ${names.length === 1 ? 'person' : 'people'}: no ${allergen}`
  })
  return parts.join('; ')
}

/** The cooking preferences of the people eating the day's home meals, one phrase each: "less salt for 1 person" (or "less salt for Paati" when names are on). */
function preferenceLine(slots: SheetSlot[], meals: MealType[], members: SheetMember[], prefs: Map<string, Preferences> | undefined, lang: SheetLang, namesOn: boolean): string {
  if (!prefs || prefs.size === 0) return ''
  const family = members.filter((m) => m.kind === 'family')
  const eaterLists = slots
    .filter((s) => s.source === 'home' && (meals as string[]).includes(s.meal) && (s.main_dish || s.meal_slot_sides.length > 0))
    .map((s) => (s.meal_slot_eaters.length > 0 ? s.meal_slot_eaters.map((e) => e.profile_id) : family.map((m) => m.id)))
  const notes = cookingNotes(eaterLists, new Map(members.map((m) => [m.id, m.name])), prefs)
  const parts: string[] = []
  for (const flag of PREF_FLAGS) {
    const who = notes.get(flag)
    if (!who || who.length === 0) continue
    const word = PREF_WORDS[lang][flag]
    if (lang === 'ta') parts.push(namesOn ? `${word} — ${who.join(', ')}` : `${who.length === 1 ? 'ஒருவருக்கு' : `${who.length} பேருக்கு`} ${word}`)
    else parts.push(namesOn ? `${word} for ${who.join(', ')}` : `${word} for ${who.length} ${who.length === 1 ? 'person' : 'people'}`)
  }
  return parts.join('; ')
}

/** The message for one day. `meals` are the meal types the home plans (snacks may be off); `allergies` maps a person to their allergens. */
export function buildCookSheet(opts: {
  date: string
  lang: SheetLang
  namesOn: boolean
  meals: MealType[]
  slots: SheetSlot[]
  members: SheetMember[]
  allergies: Map<string, string[]>
  tonight?: SheetPrep[]
  /** Everyday preferences by person (low salt, low oil, low sugar, no onion or garlic show as notes). */
  prefs?: Map<string, Preferences>
}): { text: string; empty: boolean } {
  const { lang } = opts
  const w = WORDS[lang]
  const family = opts.members.filter((m) => m.kind === 'family')
  const nameOf = (id: string) => {
    const m = opts.members.find((x) => x.id === id)
    if (!m) return ''
    return lang === 'ta' && m.kind === 'helper' && m.name.trim().toLowerCase() === 'helper' ? (w.helper ?? m.name) : m.name
  }

  const meals: string[] = []
  for (const meal of opts.meals) {
    const s = opts.slots.find((x) => x.meal === meal)
    if (!s) continue
    const people = w.people(s.meal_slot_eaters.length || family.length)
    const head = `${mealName(meal, lang)} (${people}): `
    if (s.source === 'dine_out') meals.push(head + w.eating)
    else if (s.source === 'order_in') meals.push(head + w.ordering)
    else {
      const sides = [...s.meal_slot_sides].sort((a, b) => a.position - b.position).map((x) => (x.is_leftover ? w.leftover(dishName(x.dish, lang)) : dishName(x.dish, lang)))
      const food = s.main_dish ? dishName(s.main_dish, lang) + (sides.length > 0 ? ` + ${sides.join(', ')}` : '') : sides.join(', ')
      if (!food) continue
      const cooks = s.meal_slot_cooks.map((c) => nameOf(c.profile_id)).filter(Boolean)
      meals.push(head + food + (cooks.length > 0 ? ` · ${cooks.join(' + ')}` : ''))
    }
  }
  if (meals.length === 0) return { text: '', empty: true }

  const lines = [`HomeFood · ${dayLabel(opts.date, lang)}`, '', ...meals]
  const note = [noteLine(allergyNotes(opts.slots, opts.members, opts.allergies), lang, opts.namesOn), preferenceLine(opts.slots, opts.meals, opts.members, opts.prefs, lang, opts.namesOn)].filter(Boolean).join('; ')
  const tonight = (opts.tonight ?? []).map((p) => `${(lang === 'ta' && p.text.ta) || p.text.en} (${(lang === 'ta' && p.dish.ta) || p.dish.en})`)
  if (note || tonight.length > 0) lines.push('')
  if (note) lines.push(`${w.note}: ${note}`)
  if (tonight.length > 0) lines.push(`${w.tonight}: ${tonight.join('; ')}`)
  return { text: lines.join('\n'), empty: false }
}
