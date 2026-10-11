// The made-up family for the demo home, built fresh every time the demo opens. Dishes, recipes, nutrition and photos
// are real entries from the shared catalogue (src/demo/catalogue.json, written by scripts/gen-demo-catalogue.py);
// the family, the planned weeks, votes, comments and attendance are invented and relative to today's date.
import { addDays, toISODate, weekStartOf } from '../lib/planner'
import type { Db, Row } from './fakeClient'

export type Catalogue = {
  cuisines: { id: string; parent_id: string | null; name: string; name_ta: string | null; sort_order: number }[]
  dishes: { id: string; name: string; ta: string; cuisine_id: string; meal_types: string[]; course: string; diet: string; tags: string[]; allergens: string[]; prep_minutes: number; photo: string | null; credit: string | null }[]
  nutrition: { dish_id: string; serving: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; fibre_g: number; sugar_g: number; sodium_mg: number }[]
  recipes: { dish_id: string; servings: number; prep: number; cook: number; note: string | null; note_ta: string | null; ingredients: { n: string; t: string; q: number | null; u: string }[]; steps: { e: string; t: string }[] }[]
  targets: Row[]
}

/** Wording that depends on the language the demo was opened in (the family's names stay as they are). */
export type DemoText = {
  homeName: string
  helper: string
  comments: { kaviSpicy: string; ammaSure: string; appaGood: string; appaBiryani: string; kaviBiryani: string }
  notes: { saturday: string }
}

export const DEMO_HOUSEHOLD_ID = 'demo-household'
export const DEMO_IDS = { amma: 'demo-amma', appa: 'demo-appa', paati: 'demo-paati', kavi: 'demo-kavi', arun: 'demo-arun', helper: 'demo-helper' } as const
const FAMILY = [DEMO_IDS.amma, DEMO_IDS.appa, DEMO_IDS.paati, DEMO_IDS.kavi, DEMO_IDS.arun]

type Plan = { main?: string; sides?: string[]; source?: 'dine_out' | 'order_in'; place?: string }
type Day = { breakfast: Plan; lunch: Plan; snacks: Plan; dinner: Plan }

/** One week of meals, Monday first. A dine-out lunch and an order-in dinner are in there on purpose. */
const WEEK: Day[] = [
  { breakfast: { main: 'Idli', sides: ['Sambar', 'Coconut chutney'] }, lunch: { main: 'Sambar rice', sides: ['Beans poriyal', 'Appalam'] }, snacks: { main: 'Kuzhi paniyaram', sides: ['Masala chai'] }, dinner: { main: 'Chapati', sides: ['Dal tadka', 'Cucumber raita'] } },
  { breakfast: { main: 'Dosa', sides: ['Tomato chutney', 'Sambar'] }, lunch: { main: 'Lemon rice', sides: ['Potato roast', 'Curd'] }, snacks: { main: 'Sundal', sides: ['Filter coffee'] }, dinner: { main: 'Parotta', sides: ['Veg kurma'] } },
  { breakfast: { main: 'Ven Pongal', sides: ['Coconut chutney', 'Sambar'] }, lunch: { main: 'Curd rice', sides: ['Vendakkai fry', 'Mango pickle'] }, snacks: { main: 'Murukku', sides: ['Masala chai'] }, dinner: { main: 'Idiyappam with stew', sides: ['Peanut chutney'] } },
  { breakfast: { main: 'Upma', sides: ['Coconut chutney'] }, lunch: { main: 'Tomato rice', sides: ['Cabbage kootu', 'Appalam'] }, snacks: { main: 'Dhokla', sides: ['Mint chutney'] }, dinner: { main: 'Chole', sides: ['Phulka', 'Kachumber salad'] } },
  { breakfast: { main: 'Poori', sides: ['Veg kurma'] }, lunch: { main: 'Bisi bele bath', sides: ['Boondi raita', 'Appalam'] }, snacks: { main: 'Mirchi bajji', sides: ['Filter coffee'] }, dinner: { source: 'order_in', place: 'Pizza night' } },
  { breakfast: { main: 'Masala dosa', sides: ['Coconut chutney', 'Sambar'] }, lunch: { source: 'dine_out', place: 'Udupi Grand' }, snacks: { main: 'Samosa', sides: ['Masala chai'] }, dinner: { main: 'Chicken biryani', sides: ['Cucumber raita', 'Kachumber salad'] } },
  { breakfast: { main: 'Aloo paratha', sides: ['Curd', 'Mango pickle'] }, lunch: { main: 'Chicken curry', sides: ['Jeera rice', 'Beetroot poriyal'] }, snacks: { main: 'Kozhukattai', sides: ['Filter coffee'] }, dinner: { main: 'Chicken teriyaki', sides: ['Miso soup', 'Jeera rice'] } },
]

const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'] as const

function minutesAgo(now: Date, m: number) {
  return new Date(now.getTime() - m * 60_000).toISOString()
}

export function buildDemoDb(cat: Catalogue, text: DemoText, now: Date = new Date()): Db {
  const db: Db = {}
  const put = (table: string, ...rows: Row[]) => {
    ;(db[table] ??= []).push(...rows)
  }
  const created = new Date(now.getTime() - 40 * 864e5).toISOString()
  const year = now.getFullYear()

  // ── the home and its people ──
  put('households', { id: DEMO_HOUSEHOLD_ID, name: text.homeName, week_start: 1, timezone: 'Asia/Kolkata', default_language: 'en', snacks_enabled: true, balance_same_main: 3, balance_fried: 4, balance_out_run: 3, created_at: created })
  const person = (key: keyof typeof DEMO_IDS, name: string, extra: Row): Row => ({
    id: DEMO_IDS[key], household_id: DEMO_HOUSEHOLD_ID, user_id: null, display_name: name, kind: 'family', role: 'member', can_login: false,
    birth_year: null, sex: null, activity: null, language: 'en', photo_path: null,
    created_at: new Date(new Date(created).getTime() + Object.keys(DEMO_IDS).indexOf(key) * 1000).toISOString(), ...extra,
  })
  put(
    'profiles',
    person('amma', 'Amma', { user_id: 'demo-user-amma', role: 'admin', can_login: true, birth_year: year - 41, sex: 'female', activity: 'moderate' }),
    person('appa', 'Appa', { user_id: 'demo-user-appa', can_login: true, birth_year: year - 44, sex: 'male', activity: 'light' }),
    person('paati', 'Paati', { birth_year: year - 74, sex: 'female', activity: 'light' }),
    person('kavi', 'Kavi', { user_id: 'demo-user-kavi', can_login: true, birth_year: year - 15, sex: 'female', activity: 'active' }),
    person('arun', 'Arun', { birth_year: year - 8, sex: 'male', activity: 'active' }),
    person('helper', text.helper, { kind: 'helper' }),
  )
  put('profile_allergies', { profile_id: DEMO_IDS.paati, allergen: 'soy' })

  // ── the shared catalogue (the real entries the demo uses) ──
  const byName = new Map(cat.dishes.map((d) => [d.name, d.id]))
  const dishId = (name: string) => {
    const id = byName.get(name)
    if (!id) throw new Error(`demo: dish "${name}" is not in the demo catalogue`)
    return id
  }
  for (const c of cat.cuisines) put('cuisines', { ...c, household_id: null })
  for (const d of cat.dishes) {
    put('dishes', {
      id: d.id, household_id: null, cuisine_id: d.cuisine_id, name: d.name, meal_types: d.meal_types, course: d.course, diet: d.diet, tags: d.tags, allergens: d.allergens,
      prep_minutes: d.prep_minutes, photo_path: d.photo, photo_credit: d.credit, recipe_search: null, where_seen: null, created_by: null, created_at: created,
    })
    put('dish_names', { dish_id: d.id, language: 'en', name: d.name }, { dish_id: d.id, language: 'ta', name: d.ta })
  }
  for (const n of cat.nutrition) put('dish_nutrition', { ...n, is_estimate: true, source: 'Estimate for a typical home recipe and portion.' })
  put('nutrition_targets', ...cat.targets)
  for (const r of cat.recipes) {
    const id = `recipe-${r.dish_id}`
    put('recipes', { id, dish_id: r.dish_id, household_id: null, servings: r.servings, prep_minutes: r.prep, cook_minutes: r.cook, credit: null, note: r.note, note_ta: r.note_ta, created_at: created })
    r.ingredients.forEach((i, k) => put('recipe_ingredients', { recipe_id: id, position: k + 1, name: i.n, name_ta: i.t, quantity: i.q, unit: i.u }))
    r.steps.forEach((s, k) => put('recipe_steps', { recipe_id: id, position: k + 1, body: s.e, body_ta: s.t }))
  }
  for (const name of ['Idli', 'Dosa', 'Masala dosa', 'Chicken biryani', 'Curd rice']) put('dish_favourites', { household_id: DEMO_HOUSEHOLD_ID, dish_id: dishId(name), created_at: created })

  // ── two weeks of meals: last week (done) and this one (published) ──
  const today = toISODate(now)
  const thisWeek = toISODate(weekStartOf(now, 1))
  const lastWeek = addDays(thisWeek, -7)
  const nextWeek = addDays(thisWeek, 7)
  put('week_plans',
    { id: 'plan-last', household_id: DEMO_HOUSEHOLD_ID, week_start: lastWeek, status: 'published', published_at: minutesAgo(now, 8 * 1440) },
    { id: 'plan-this', household_id: DEMO_HOUSEHOLD_ID, week_start: thisWeek, status: 'published', published_at: minutesAgo(now, 2 * 1440) },
  )

  const slotId = (date: string, meal: string) => `slot-${date}-${meal}`
  const lay = (weekStart: string, planId: string, days: Day[], status: 'done' | 'confirmed') => {
    days.forEach((day, di) => {
      const date = addDays(weekStart, di)
      for (const meal of MEALS) {
        const p = day[meal]
        const id = slotId(date, meal)
        put('meal_slots', {
          id, week_plan_id: planId, household_id: DEMO_HOUSEHOLD_ID, date, meal, source: p.source ?? 'home', place_name: p.place ?? null,
          main_dish_id: p.main ? dishId(p.main) : null, note: null, status, kept_despite_disagree: false, updated_at: minutesAgo(now, 3 * 1440),
        })
        ;(p.sides ?? []).forEach((s, k) => put('meal_slot_sides', { slot_id: id, position: k + 1, dish_id: dishId(s) }))
        const weekend = di >= 5
        const cook = meal === 'lunch' && !weekend ? DEMO_IDS.helper : meal === 'dinner' && di === 6 ? DEMO_IDS.appa : meal === 'breakfast' && di === 5 ? DEMO_IDS.appa : meal === 'snacks' && weekend ? DEMO_IDS.kavi : DEMO_IDS.amma
        if (!p.source) put('meal_slot_cooks', { slot_id: id, profile_id: cook })
        const eaters = meal === 'lunch' && !weekend ? [DEMO_IDS.amma, DEMO_IDS.paati, DEMO_IDS.arun] : FAMILY
        for (const e of eaters) put('meal_slot_eaters', { slot_id: id, profile_id: e })
      }
    })
  }
  lay(thisWeek, 'plan-this', WEEK, 'confirmed')
  lay(lastWeek, 'plan-last', [...WEEK.slice(3), ...WEEK.slice(0, 3)], 'done')

  // ── who may plan: Appa has this week, Kavi next week (Amma is the Admin and can always plan) ──
  put('planner_turns',
    { id: 'turn-appa', household_id: DEMO_HOUSEHOLD_ID, profile_id: DEMO_IDS.appa, scope: 'week', start_date: thisWeek, end_date: addDays(thisWeek, 6), status: 'approved', requested_by: DEMO_IDS.amma, created_at: minutesAgo(now, 5 * 1440) },
    { id: 'turn-kavi', household_id: DEMO_HOUSEHOLD_ID, profile_id: DEMO_IDS.kavi, scope: 'week', start_date: nextWeek, end_date: addDays(nextWeek, 6), status: 'approved', requested_by: DEMO_IDS.amma, created_at: minutesAgo(now, 4 * 1440) },
  )

  // ── what happened around the meals ──
  const yesterday = addDays(today, -1)
  put('meal_attendance',
    { slot_id: slotId(today, 'breakfast'), profile_id: DEMO_IDS.paati, status: 'ate', portion: 'small', updated_at: minutesAgo(now, 90) },
    { slot_id: slotId(today, 'snacks'), profile_id: DEMO_IDS.kavi, status: 'skipped', portion: 'normal', updated_at: minutesAgo(now, 30) },
    { slot_id: slotId(today, 'dinner'), profile_id: DEMO_IDS.appa, status: 'ate', portion: 'large', updated_at: minutesAgo(now, 10) },
    { slot_id: slotId(yesterday, 'dinner'), profile_id: DEMO_IDS.arun, status: 'skipped', portion: 'normal', updated_at: minutesAgo(now, 1500) },
    { slot_id: slotId(yesterday, 'lunch'), profile_id: DEMO_IDS.kavi, status: 'elsewhere', portion: 'normal', updated_at: minutesAgo(now, 1600) },
  )

  const vote = (date: string, meal: string, who: string, v: 'agree' | 'disagree', ago: number) => put('meal_slot_votes', { slot_id: slotId(date, meal), profile_id: who, vote: v, updated_at: minutesAgo(now, ago) })
  vote(today, 'lunch', DEMO_IDS.appa, 'agree', 300)
  vote(today, 'lunch', DEMO_IDS.kavi, 'agree', 280)
  vote(today, 'snacks', DEMO_IDS.kavi, 'agree', 200)
  vote(today, 'dinner', DEMO_IDS.amma, 'agree', 180)
  vote(today, 'dinner', DEMO_IDS.appa, 'agree', 170)
  vote(today, 'dinner', DEMO_IDS.kavi, 'disagree', 160)
  const sat = addDays(thisWeek, 5)
  vote(sat, 'dinner', DEMO_IDS.appa, 'agree', 600)
  vote(sat, 'dinner', DEMO_IDS.kavi, 'agree', 590)
  vote(sat, 'dinner', DEMO_IDS.amma, 'agree', 580)

  const comment = (date: string, meal: string, who: string, body: string, ago: number, k: number) =>
    put('meal_slot_comments', { id: `comment-${k}`, slot_id: slotId(date, meal), profile_id: who, body, created_at: minutesAgo(now, ago) })
  comment(today, 'dinner', DEMO_IDS.kavi, text.comments.kaviSpicy, 150, 1)
  comment(today, 'dinner', DEMO_IDS.amma, text.comments.ammaSure, 140, 2)
  comment(today, 'dinner', DEMO_IDS.appa, text.comments.appaGood, 120, 3)
  comment(sat, 'dinner', DEMO_IDS.appa, text.comments.appaBiryani, 560, 4)
  comment(sat, 'dinner', DEMO_IDS.kavi, text.comments.kaviBiryani, 550, 5)

  put('meal_slot_suggestions', { id: 'suggestion-1', slot_id: slotId(today, 'dinner'), profile_id: DEMO_IDS.kavi, dish_id: dishId('Margherita pizza'), free_text: null, status: 'open', created_at: minutesAgo(now, 155), resolved_at: null })

  // ── the bell ──
  const tonight = WEEK[weekStartIndex(now)]!.dinner
  const tonightDish = tonight.main ? cat.dishes.find((d) => d.id === dishId(tonight.main!)) : undefined
  const note = (id: string, to: string, type: string, slotKey: string | null, actor: string | null, data: Row, ago: number, read: boolean) =>
    put('notifications', { id, household_id: DEMO_HOUSEHOLD_ID, profile_id: to, type, slot_id: slotKey, actor_id: actor, data, created_at: minutesAgo(now, ago), read_at: read ? minutesAgo(now, ago - 5) : null })
  const todayDinner = { date: today, meal: 'dinner', source: tonight.source ?? 'home', place: tonight.place ?? null, dish_en: tonightDish?.name ?? null, dish_ta: tonightDish?.ta ?? null }
  note('n1', DEMO_IDS.appa, 'week_published', null, DEMO_IDS.amma, { week_start: thisWeek }, 2 * 1440, true)
  note('n2', DEMO_IDS.appa, 'suggestion_new', slotId(today, 'dinner'), DEMO_IDS.kavi, { ...todayDinner, suggested_en: 'Margherita pizza', suggested_ta: 'மார்கரிட்டா பீட்சா' }, 155, false)
  note('n3', DEMO_IDS.amma, 'suggestion_new', slotId(today, 'dinner'), DEMO_IDS.kavi, { ...todayDinner, suggested_en: 'Margherita pizza', suggested_ta: 'மார்கரிட்டா பீட்சா' }, 155, false)
  note('n4', DEMO_IDS.amma, 'comment_new', slotId(today, 'dinner'), DEMO_IDS.appa, todayDinner, 120, false)
  note('n5', DEMO_IDS.kavi, 'week_published', null, DEMO_IDS.amma, { week_start: thisWeek }, 2 * 1440, true)
  note('n6', DEMO_IDS.kavi, 'cook_assigned', slotId(addDays(thisWeek, 5), 'snacks'), DEMO_IDS.amma, { date: addDays(thisWeek, 5), meal: 'snacks', source: 'home', place: null, dish_en: 'Samosa', dish_ta: 'சமோசா' }, 1400, false)
  note('n7', DEMO_IDS.kavi, 'turn_assigned', null, DEMO_IDS.amma, { scope: 'week', start_date: nextWeek, end_date: addDays(nextWeek, 6) }, 4 * 1440, true)

  return db
}

function weekStartIndex(now: Date) {
  return (now.getDay() + 6) % 7 // Monday = 0
}
