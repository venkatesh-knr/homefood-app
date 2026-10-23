import { describe, expect, it } from 'vitest'
import { allergyNotes, buildCookSheet, dayLabel, type SheetMember, type SheetSlot } from './cookSheet'

const dish = (en: string, ta: string, allergens: string[] = []) => ({ name: en, allergens, dish_names: [{ language: 'en', name: en }, { language: 'ta', name: ta }] })
const members: SheetMember[] = [
  { id: 'amma', name: 'Amma', kind: 'family' },
  { id: 'appa', name: 'Appa', kind: 'family' },
  { id: 'paati', name: 'Paati', kind: 'family' },
  { id: 'kavi', name: 'Kavi', kind: 'family' },
  { id: 'arun', name: 'Arun', kind: 'family' },
  { id: 'helper', name: 'Helper', kind: 'helper' },
]
const eaters = (...ids: string[]) => ids.map((profile_id) => ({ profile_id }))
const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'] as const

const day: SheetSlot[] = [
  { meal: 'breakfast', source: 'home', main_dish: dish('Idli', 'இட்லி'), meal_slot_sides: [{ position: 2, dish: dish('Coconut chutney', 'தேங்காய் சட்னி') }, { position: 1, dish: dish('Sambar', 'சாம்பார்') }], meal_slot_cooks: [{ profile_id: 'helper' }], meal_slot_eaters: eaters('amma', 'appa', 'paati', 'kavi', 'arun') },
  { meal: 'lunch', source: 'home', main_dish: dish('Chana masala', 'சனா மசாலா'), meal_slot_sides: [{ position: 1, dish: dish('Jeera rice', 'ஜீரா சாதம்') }], meal_slot_cooks: [{ profile_id: 'helper' }, { profile_id: 'amma' }], meal_slot_eaters: eaters('amma', 'appa', 'paati', 'kavi', 'arun') },
  { meal: 'snacks', source: 'home', main_dish: dish('Sundal', 'சுண்டல்'), meal_slot_sides: [], meal_slot_cooks: [{ profile_id: 'paati' }], meal_slot_eaters: eaters('amma', 'appa', 'paati', 'kavi') },
  { meal: 'dinner', source: 'home', main_dish: dish('Chicken curry', 'சிக்கன் கறி', ['soy']), meal_slot_sides: [{ position: 1, dish: dish('Chapati', 'சப்பாத்தி') }], meal_slot_cooks: [{ profile_id: 'appa' }], meal_slot_eaters: eaters('amma', 'appa', 'paati', 'kavi', 'arun') },
]
const allergies = new Map([['paati', ['soy']]])

const build = (over: Partial<Parameters<typeof buildCookSheet>[0]> = {}) =>
  buildCookSheet({ date: '2026-10-01', lang: 'en', namesOn: false, meals: [...MEALS], slots: day, members, allergies, ...over })

describe('the cook\'s sheet', () => {
  it('lists each meal with its head count, dishes and cooks, and a note about who cannot eat what', () => {
    expect(build().text).toBe(
      [
        'HomeFood · Thursday 1 Oct',
        '',
        'Breakfast (5): Idli + Sambar, Coconut chutney · Helper',
        'Lunch (5): Chana masala + Jeera rice · Helper + Amma',
        'Snacks (4): Sundal · Paati',
        'Dinner (5): Chicken curry + Chapati · Appa',
        '',
        'Note: 1 person: no soy',
      ].join('\n'),
    )
  })

  it('can name who has the allergy', () => {
    expect(build({ namesOn: true }).text).toContain('Note: no soy for Paati')
    expect(build({ namesOn: true }).text).not.toContain('1 person')
  })

  it('does not name anyone by default', () => {
    expect(build().text).not.toMatch(/for Paati/)
  })

  it('writes the whole sheet in Tamil with Tamil dish names and head counts', () => {
    const text = build({ lang: 'ta' }).text
    expect(text).toContain('காலை உணவு (5 பேர்): இட்லி + சாம்பார், தேங்காய் சட்னி · உதவியாளர்')
    expect(text).toContain('சிற்றுண்டி (4 பேர்): சுண்டல் · Paati')
    expect(text).toContain('கவனிக்க: ஒருவருக்கு soy கூடாது')
    expect(text).not.toContain('Idli')
  })

  it('says "Eating out" or "Ordering in" for meals not cooked at home, with no place or cook', () => {
    const slots: SheetSlot[] = [
      { meal: 'lunch', source: 'dine_out', main_dish: null, meal_slot_sides: [], meal_slot_cooks: [], meal_slot_eaters: eaters('amma', 'appa') },
      { meal: 'dinner', source: 'order_in', main_dish: null, meal_slot_sides: [], meal_slot_cooks: [], meal_slot_eaters: [] },
    ]
    const text = build({ slots }).text
    expect(text).toContain('Lunch (2): Eating out')
    expect(text).toContain('Dinner (5): Ordering in') // no list of eaters: the family, helper not counted
    expect(build({ slots, lang: 'ta' }).text).toContain('மதிய உணவு (2 பேர்): வெளியில் சாப்பிடுகிறோம்')
  })

  it('leaves out a meal that is not planned, and a meal the home does not plan (no snacks)', () => {
    const text = build({ meals: ['breakfast', 'lunch', 'dinner'], slots: day.filter((s) => s.meal !== 'lunch') }).text
    expect(text).not.toContain('Snacks')
    expect(text).not.toContain('Lunch')
    expect(text).toContain('Breakfast')
  })

  it('mentions tonight\'s prep when there is some', () => {
    const text = build({ tonight: [{ text: { en: 'Grind the batter and leave it to ferment', ta: 'மாவு அரைத்துப் புளிக்க வைக்கவும்' }, dish: { en: 'Idli', ta: 'இட்லி' } }, { text: { en: 'Set the curd', ta: null }, dish: { en: 'Curd rice', ta: null } }] }).text
    expect(text).toContain('Tonight: Grind the batter and leave it to ferment (Idli); Set the curd (Curd rice)')
    expect(build({ lang: 'ta', tonight: [{ text: { en: 'Set the curd', ta: 'தயிர் உறை ஊற்றவும்' }, dish: { en: 'Curd rice', ta: 'தயிர் சாதம்' } }] }).text).toContain('இன்றிரவு: தயிர் உறை ஊற்றவும் (தயிர் சாதம்)')
  })

  it('is empty when nothing is planned', () => {
    expect(build({ slots: [] })).toEqual({ text: '', empty: true })
  })

  it('carries nothing but dishes, numbers and cooks: no ids, nutrition, votes, comments or notes', () => {
    const noisy = day.map((s) => ({ ...s, note: 'private note', votes: 3, comments: ['secret'] }))
    const text = build({ slots: noisy as unknown as SheetSlot[] }).text
    for (const word of ['private', 'secret', 'kcal', 'vote', 'comment']) expect(text.toLowerCase()).not.toContain(word)
  })
})

describe('the allergy note', () => {
  it('only counts people who eat a meal that contains what they cannot eat', () => {
    expect([...allergyNotes(day, members, allergies)]).toEqual([['soy', ['Paati']]])
    expect(allergyNotes(day.filter((s) => s.meal !== 'dinner'), members, allergies).size).toBe(0)
  })
  it('ignores someone who is not on the meal\'s eater list', () => {
    const slots = day.map((s) => (s.meal === 'dinner' ? { ...s, meal_slot_eaters: eaters('amma', 'appa') } : s))
    expect(allergyNotes(slots, members, allergies).size).toBe(0)
  })
  it('counts several people and several allergens, and never the helper', () => {
    const more = new Map([['paati', ['soy']], ['kavi', ['soy', 'peanut']], ['helper', ['soy']]])
    const slots = day.map((s) => (s.meal === 'dinner' ? { ...s, main_dish: dish('Satay', 'சதே', ['soy', 'peanut']) } : s))
    const text = build({ slots, allergies: more }).text
    expect(text).toContain('Note: 2 people: no soy; 1 person: no peanut')
    expect(build({ slots, allergies: more, namesOn: true }).text).toContain('Note: no soy for Paati, Kavi; no peanut for Kavi')
  })
})

describe('the day label', () => {
  it('writes the weekday, day and month', () => {
    expect(dayLabel('2026-10-01', 'en')).toBe('Thursday 1 Oct')
    expect(dayLabel('2026-10-01', 'ta')).toMatch(/1/)
  })
})
