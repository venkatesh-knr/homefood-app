// Everyday food preferences (veg / egg / non-veg, no onion or garlic, low oil, salt and sugar): types and the pure logic that checks a dish
// against them. Preferences, never medical conditions. No network here.
import type { DietType } from './dishes'

export type Preferences = {
  profile_id: string
  diet: DietType | null
  no_onion_garlic: boolean
  low_oil: boolean
  low_salt: boolean
  low_sugar: boolean
}

export const EMPTY_PREFERENCES = (profile_id: string): Preferences => ({ profile_id, diet: null, no_onion_garlic: false, low_oil: false, low_salt: false, low_sugar: false })

/** The dish tags the clash checks read (set on the catalogue from each recipe's ingredients and nutrition, and correctable by a home on Dish detail). */
export const PREF_TAGS = { onionGarlic: 'onion_garlic', salty: 'salty', oily: 'oily', sweet: 'sweet' } as const

export type ClashKind = 'diet' | 'onion_garlic' | 'salty' | 'oily' | 'sweet'
/** `hard` clashes (diet, onion and garlic) take a dish out of "Suits everyone eating"; the soft ones (salt, oil, sugar) only show as a gentle note. */
export type Clash = { kind: ClashKind; hard: boolean }

/** What a person's preferences say about one dish. A dish with no tags and an unknown diet simply clashes with nothing. */
export function dishClashes(dish: { diet: DietType; tags?: string[] }, pref: Preferences | undefined): Clash[] {
  if (!pref) return []
  const tags = dish.tags ?? []
  const out: Clash[] = []
  if (pref.diet === 'veg' && dish.diet !== 'veg') out.push({ kind: 'diet', hard: true })
  else if (pref.diet === 'egg' && dish.diet === 'non_veg') out.push({ kind: 'diet', hard: true })
  if (pref.no_onion_garlic && tags.includes(PREF_TAGS.onionGarlic)) out.push({ kind: 'onion_garlic', hard: true })
  if (pref.low_salt && tags.includes(PREF_TAGS.salty)) out.push({ kind: 'salty', hard: false })
  if (pref.low_oil && tags.includes(PREF_TAGS.oily)) out.push({ kind: 'oily', hard: false })
  if (pref.low_sugar && tags.includes(PREF_TAGS.sweet)) out.push({ kind: 'sweet', hard: false })
  return out
}

/** True if any of these people could not eat the dish (a hard clash): used by "Suits everyone eating". */
export function clashesHard(dish: { diet: DietType; tags?: string[] }, prefs: Preferences[]): boolean {
  return prefs.some((p) => dishClashes(dish, p).some((c) => c.hard))
}

export type MealDish = { id: string; diet: DietType; tags?: string[]; name: string }
export type Eater = { id: string; name: string }
export type MealClash = { person: string; dish: string; kind: ClashKind; hard: boolean }

/** Every clash in a meal: who, which dish and what, so the editor can say "Paati: appalam is salty". */
export function mealClashes(dishes: MealDish[], eaters: Eater[], prefs: Map<string, Preferences>): MealClash[] {
  const out: MealClash[] = []
  for (const e of eaters) {
    for (const d of dishes) {
      for (const c of dishClashes(d, prefs.get(e.id))) out.push({ person: e.name, dish: d.name, kind: c.kind, hard: c.hard })
    }
  }
  return out
}

export type PrefFlag = 'low_salt' | 'low_oil' | 'low_sugar' | 'no_onion_garlic'
export const PREF_FLAGS: PrefFlag[] = ['low_salt', 'low_oil', 'low_sugar', 'no_onion_garlic']

/** For the cook's sheet: how many people (and who) eating the day's home meals ask for each of the four cooking preferences. */
export function cookingNotes(eaterIds: string[][], names: Map<string, string>, prefs: Map<string, Preferences>): Map<PrefFlag, string[]> {
  const out = new Map<PrefFlag, string[]>()
  const seen = new Set(eaterIds.flat())
  for (const id of seen) {
    const p = prefs.get(id)
    if (!p) continue
    for (const flag of PREF_FLAGS) {
      if (!p[flag]) continue
      out.set(flag, [...(out.get(flag) ?? []), names.get(id) ?? ''])
    }
  }
  return out
}

/** The one line under a person's name: "Non-veg · low oil" (the parts that are set, in order; nothing set gives an empty string). */
export function preferenceParts(pref: Preferences | undefined, label: (key: string) => string): string[] {
  if (!pref) return []
  const parts: string[] = []
  if (pref.diet) parts.push(label(`diet.${pref.diet}`))
  if (pref.no_onion_garlic) parts.push(label('flag.no_onion_garlic'))
  if (pref.low_oil) parts.push(label('flag.low_oil'))
  if (pref.low_salt) parts.push(label('flag.low_salt'))
  if (pref.low_sugar) parts.push(label('flag.low_sugar'))
  return parts
}
