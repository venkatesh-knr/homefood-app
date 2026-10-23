import { describe, expect, it } from 'vitest'
import { leadNote, prepByDish, prepTasks, taskDish, taskKey, taskText, zonedParts, type PrepRow, type PrepSlot } from './prep'

const row = (over: Partial<PrepRow> & { id: string; dish_id: string }): PrepRow => ({ recipe_id: `r-${over.dish_id}`, household_id: null, kind: 'soak', lead: 'night_before', hours: null, text_en: 'Soak', text_ta: 'ஊற வைக்கவும்', ...over })
const dish = (id: string, en: string, ta: string | null = null) => ({ id, name: en, dish_names: [{ language: 'en', name: en }, ...(ta ? [{ language: 'ta', name: ta }] : [])] })
const slot = (id: string, date: string, meal: string, main: string | null, sides: string[] = [], source = 'home'): PrepSlot => ({
  id, date, meal, source, main_dish: main ? dish(main, main) : null, meal_slot_sides: sides.map((s, i) => ({ position: i + 1, dish: dish(s, s) })),
})

const rows = [
  row({ id: 'p-idli', dish_id: 'Idli', kind: 'batter_ferment', hours: 8, text_en: 'Grind the batter' }),
  row({ id: 'p-chole', dish_id: 'Chole', kind: 'soak', text_en: 'Soak the chickpeas' }),
  row({ id: 'p-curd', dish_id: 'Curd rice', kind: 'set_curd', text_en: 'Set the curd' }),
  row({ id: 'p-vada', dish_id: 'Medu vada', kind: 'soak', lead: 'hours_before', hours: 3, text_en: 'Soak the dal' }),
]
const prep = prepByDish(rows, 'h')

// Wednesday 30 Sep 2026 at 7:40 pm in Kolkata (14:10 UTC) and at 10 am (04:30 UTC)
const EVENING = new Date('2026-09-30T14:10:00Z')
const MORNING = new Date('2026-09-30T04:30:00Z')

describe('the clock in the home\'s time zone', () => {
  it('gives the local date and hour', () => {
    expect(zonedParts(EVENING, 'Asia/Kolkata')).toEqual({ date: '2026-09-30', hour: 19 })
    expect(zonedParts(MORNING, 'Asia/Kolkata')).toEqual({ date: '2026-09-30', hour: 10 })
  })
  it('can differ from UTC across midnight', () => {
    expect(zonedParts(new Date('2026-09-30T20:00:00Z'), 'Asia/Kolkata')).toEqual({ date: '2026-10-01', hour: 1 })
  })
  it('falls back to the device clock for a bad time zone name', () => {
    expect(zonedParts(EVENING, 'Not/AZone').date).toMatch(/^2026-09-/)
  })
})

describe('whose tags apply', () => {
  it("uses a home's own recipe tags when it has any, else the standard ones", () => {
    const all = [
      row({ id: 'std', dish_id: 'Idli', text_en: 'Standard' }),
      row({ id: 'own', dish_id: 'Idli', household_id: 'h', text_en: 'Ours' }),
      row({ id: 'std2', dish_id: 'Dosa', text_en: 'Standard dosa' }),
      row({ id: 'other', dish_id: 'Dosa', household_id: 'someone-else', text_en: 'Not ours' }),
    ]
    const m = prepByDish(all, 'h')
    expect(m.get('Idli')!.map((r) => r.id)).toEqual(['own'])
    expect(m.get('Dosa')!.map((r) => r.id)).toEqual(['std2'])
  })
})

describe('what shows on Today', () => {
  const slots = [
    slot('t-b', '2026-10-01', 'breakfast', 'Idli', ['Sambar']),
    slot('t-l', '2026-10-01', 'lunch', 'Chole', ['Curd rice']),
    slot('t-d', '2026-10-01', 'dinner', null, [], 'dine_out'),
    slot('n-l', '2026-10-02', 'lunch', 'Idli'),
    slot('today-s', '2026-09-30', 'snacks', 'Medu vada'),
    slot('today-l', '2026-09-30', 'lunch', 'Medu vada'),
  ]

  it('in the evening lists tomorrow\'s night-before tasks, breakfast first, with the dish and meal', () => {
    const { tonight } = prepTasks({ now: EVENING, timeZone: 'Asia/Kolkata', slots, prep })
    expect(tonight.map((t) => [t.meal, t.dish.en, t.text.en])).toEqual([['breakfast', 'Idli', 'Grind the batter'], ['lunch', 'Chole', 'Soak the chickpeas'], ['lunch', 'Curd rice', 'Set the curd']])
    expect(tonight[0]).toMatchObject({ key: taskKey('t-b', 'p-idli'), lead: 'night_before', hours: 8 })
  })

  it('shows nothing for tomorrow before 4 pm', () => {
    expect(prepTasks({ now: MORNING, timeZone: 'Asia/Kolkata', slots, prep }).tonight).toEqual([])
  })

  it('skips dine-out and order-in meals and meals with no tagged dish', () => {
    const { tonight } = prepTasks({ now: EVENING, timeZone: 'Asia/Kolkata', slots: [slot('x', '2026-10-01', 'dinner', 'Idli', [], 'dine_out'), slot('y', '2026-10-01', 'lunch', 'Upma')], prep })
    expect(tonight).toEqual([])
  })

  it('in the morning lists today\'s same-day tasks until each meal\'s time', () => {
    const { today } = prepTasks({ now: MORNING, timeZone: 'Asia/Kolkata', slots, prep })
    expect(today.map((t) => [t.meal, t.text.en, t.hours])).toEqual([['lunch', 'Soak the dal', 3], ['snacks', 'Soak the dal', 3]])
  })

  it('drops a same-day task once its meal time has passed', () => {
    const { today } = prepTasks({ now: EVENING, timeZone: 'Asia/Kolkata', slots, prep })
    expect(today).toEqual([])
    const afternoon = new Date('2026-09-30T08:30:00Z') // 2 pm
    expect(prepTasks({ now: afternoon, timeZone: 'Asia/Kolkata', slots, prep }).today.map((t) => t.meal)).toEqual(['snacks'])
  })

  it('never lists a night-before task as same-day, or the reverse', () => {
    const { today, tonight } = prepTasks({ now: EVENING, timeZone: 'Asia/Kolkata', slots, prep })
    expect([...today, ...tonight].every((t) => (t.lead === 'night_before') === tonight.includes(t))).toBe(true)
  })

  it('can be told to treat the time as later (the demo home)', () => {
    expect(prepTasks({ now: MORNING, timeZone: 'Asia/Kolkata', slots, prep, minHour: 16 }).tonight.length).toBe(3)
  })

  it('lists a task once even if two dishes of a meal share a tag', () => {
    const shared = [row({ id: 'same', dish_id: 'A' }), row({ id: 'same', dish_id: 'B' })]
    const { tonight } = prepTasks({ now: EVENING, timeZone: 'Asia/Kolkata', slots: [slot('s', '2026-10-01', 'lunch', 'A', ['B'])], prep: prepByDish(shared, 'h') })
    expect(tonight).toHaveLength(1)
  })
})

describe('the line under a task', () => {
  it('says how long a task needs', () => {
    expect(leadNote({ kind: 'batter_ferment', lead: 'night_before', hours: 8 })).toEqual({ key: 'needs', hours: 8 })
    expect(leadNote({ kind: 'soak', lead: 'night_before', hours: null })).toEqual({ key: 'overnight', hours: 0 })
    expect(leadNote({ kind: 'thaw', lead: 'night_before', hours: null })).toBeNull()
    expect(leadNote({ kind: 'soak', lead: 'hours_before', hours: 3 })).toEqual({ key: 'hoursBefore', hours: 3 })
  })
  it('uses Tamil wording when there is some, else English', () => {
    const t = { text: { en: 'Soak', ta: 'ஊற வைக்கவும்' }, dish: { en: 'Chole', ta: null } }
    expect(taskText(t, 'ta')).toBe('ஊற வைக்கவும்')
    expect(taskText({ text: { en: 'Soak', ta: null } }, 'ta')).toBe('Soak')
    expect(taskDish(t, 'ta')).toBe('Chole')
  })
})
