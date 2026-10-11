import { describe, expect, it } from 'vitest'
import catalogue from './catalogue.json'
import { buildDemoDb, DEMO_HOUSEHOLD_ID, DEMO_IDS, type Catalogue } from './demoData'
import { createDemoClient, parseSelect, type Db } from './fakeClient'
import { addDays, toISODate, weekStartOf } from '../lib/planner'
import en from '../i18n/en.json'

const text = {
  homeName: en.demo.data.homeName,
  helper: en.demo.data.helper,
  comments: { kaviSpicy: 'a', ammaSure: 'b', appaGood: 'c', appaBiryani: 'd', kaviBiryani: 'e' },
  notes: { saturday: '' },
}
const NOW = new Date(2026, 9, 11, 10, 0) // Sunday 11 Oct 2026
const fresh = () => {
  const db = buildDemoDb(catalogue as unknown as Catalogue, text, NOW)
  return { db, client: createDemoClient(db) }
}

describe('select strings', () => {
  it('reads columns and joined tables, with aliases and !inner', () => {
    const node = parseSelect('*, main_dish:dishes(id, name, dish_names(language, name)), meal_slots!inner(date)')
    expect(node.cols).toEqual(['*'])
    expect(node.embeds.map((e) => [e.alias, e.table, e.inner])).toEqual([
      ['main_dish', 'dishes', false],
      ['meal_slots', 'meal_slots', true],
    ])
    expect(node.embeds[0]!.embeds[0]!.table).toBe('dish_names')
  })
})

describe('demo data', () => {
  it('builds a published current week with every meal planned, using real catalogue dishes', () => {
    const { db } = fresh()
    const week = toISODate(weekStartOf(NOW, 1))
    expect(db.week_plans!.find((p) => p.week_start === week)?.status).toBe('published')
    const slots = db.meal_slots!.filter((s) => s.date >= week && s.date <= addDays(week, 6))
    expect(slots).toHaveLength(28)
    expect(slots.some((s) => s.source === 'dine_out')).toBe(true)
    expect(slots.some((s) => s.source === 'order_in')).toBe(true)
    const dishIds = new Set(db.dishes!.map((d) => d.id))
    for (const s of db.meal_slots!) if (s.main_dish_id) expect(dishIds.has(s.main_dish_id)).toBe(true)
    for (const s of db.meal_slot_sides!) expect(dishIds.has(s.dish_id)).toBe(true)
  })

  it('gives every dish used in the plan a recipe, nutrition and a Tamil name', () => {
    const { db } = fresh()
    for (const d of db.dishes!) {
      expect(db.recipes!.some((r) => r.dish_id === d.id), d.name).toBe(true)
      expect(db.dish_nutrition!.some((n) => n.dish_id === d.id), d.name).toBe(true)
      expect(db.dish_names!.find((n) => n.dish_id === d.id && n.language === 'ta')?.name, d.name).toBeTruthy()
    }
  })

  it('has the sample family: an Admin, a Planner turn, a helper who is only a cook, and Paati with a soy allergy', async () => {
    const { client } = fresh()
    const { data: people } = await client.from('profiles').select('*').eq('household_id', DEMO_HOUSEHOLD_ID).order('created_at')
    expect(people!.map((p: { display_name: string }) => p.display_name)).toEqual(['Amma', 'Appa', 'Paati', 'Kavi', 'Arun', 'Helper'])
    expect(people!.find((p: { id: string }) => p.id === DEMO_IDS.amma).role).toBe('admin')
    const helper = people!.find((p: { id: string }) => p.id === DEMO_IDS.helper)
    expect(helper.kind).toBe('helper')
    expect(helper.can_login).toBe(false)
    const { data: allergies } = await client.from('profile_allergies').select('*').eq('profile_id', DEMO_IDS.paati)
    expect(allergies).toEqual([{ profile_id: DEMO_IDS.paati, allergen: 'soy' }])
    const { data: turns } = await client.from('planner_turns').select('*').eq('profile_id', DEMO_IDS.appa)
    expect(turns).toHaveLength(1)
  })

  it('never lets the helper be an eater', () => {
    const { db } = fresh()
    expect(db.meal_slot_eaters!.some((e) => e.profile_id === DEMO_IDS.helper)).toBe(false)
  })
})

describe('fake client', () => {
  it('joins tables the way the planner queries do', async () => {
    const { client } = fresh()
    const { data } = await client
      .from('meal_slots')
      .select('*, main_dish:dishes(id, name, dish_names(language, name)), meal_slot_sides(position, dish:dishes(id, name)), meal_slot_cooks(profile_id)')
      .eq('household_id', DEMO_HOUSEHOLD_ID)
      .eq('date', '2026-10-05')
      .eq('meal', 'breakfast')
    expect(data).toHaveLength(1)
    expect(data![0].main_dish.name).toBe('Idli')
    expect(data![0].main_dish.dish_names.map((n: { language: string }) => n.language).sort()).toEqual(['en', 'ta'])
    expect(data![0].meal_slot_sides.map((s: { dish: { name: string } }) => s.dish.name)).toEqual(['Sambar', 'Coconut chutney'])
  })

  it('filters on a joined column and drops rows without a match for !inner', async () => {
    const { client } = fresh()
    const { data } = await client.from('meal_attendance').select('slot_id, profile_id, status, portion, meal_slots!inner(date)').gte('meal_slots.date', '2026-10-11').lte('meal_slots.date', '2026-10-11')
    expect(data!.length).toBeGreaterThan(0)
    for (const r of data!) expect((r as unknown as { meal_slots: { date: string } }).meal_slots.date).toBe('2026-10-11')
  })

  it('filters, orders, limits and counts', async () => {
    const { client } = fresh()
    const { data: list } = await client.from('dishes').select('id, name').or(`household_id.is.null,household_id.eq.${DEMO_HOUSEHOLD_ID}`).order('name').limit(3)
    expect(list).toHaveLength(3)
    expect(list![0].name <= list![1].name).toBe(true)
    const { count } = await client.from('meal_slots').select('id', { count: 'exact', head: true }).eq('household_id', DEMO_HOUSEHOLD_ID)
    expect(count).toBe(56)
    const { data: some } = await client.from('profiles').select('id').in('id', [DEMO_IDS.amma, DEMO_IDS.kavi])
    expect(some).toHaveLength(2)
  })

  it('single() fails on no rows and maybeSingle() does not', async () => {
    const { client } = fresh()
    const one = await client.from('households').select('*').eq('id', 'nope').single()
    expect(one.error?.code).toBe('PGRST116')
    const maybe = await client.from('households').select('*').eq('id', 'nope').maybeSingle()
    expect(maybe.error).toBeNull()
    expect(maybe.data).toBeNull()
  })

  it('inserts with defaults, refuses a second meal in the same slot, and upserts on the given key', async () => {
    const { client } = fresh()
    const week = toISODate(weekStartOf(NOW, 1))
    const dup = await client.from('meal_slots').insert({ week_plan_id: 'plan-this', household_id: DEMO_HOUSEHOLD_ID, date: week, meal: 'breakfast' })
    expect(dup.error?.code).toBe('23505')
    const made = await client.from('meal_slot_comments').insert({ slot_id: `slot-${week}-lunch`, profile_id: DEMO_IDS.amma, body: 'hello' }).select('id, body').single()
    expect(made.data?.body).toBe('hello')
    expect(made.data?.id).toBeTruthy()

    const vote = { slot_id: `slot-${week}-lunch`, profile_id: DEMO_IDS.amma, vote: 'agree' }
    await client.from('meal_slot_votes').upsert(vote, { onConflict: 'slot_id,profile_id' })
    await client.from('meal_slot_votes').upsert({ ...vote, vote: 'disagree' }, { onConflict: 'slot_id,profile_id' })
    const { data } = await client.from('meal_slot_votes').select('vote').eq('slot_id', `slot-${week}-lunch`).eq('profile_id', DEMO_IDS.amma)
    expect(data).toEqual([{ vote: 'disagree' }])
  })

  it('updates and deletes, and a deleted meal takes its sides, votes and comments with it', async () => {
    const { client, db } = fresh()
    const week = toISODate(weekStartOf(NOW, 1))
    const id = `slot-${week}-dinner`
    const upd = await client.from('meal_slots').update({ note: 'less oil' }).eq('id', id).select('id, note').single()
    expect(upd.data).toEqual({ id, note: 'less oil' })
    await client.from('meal_slots').delete().eq('id', id)
    expect(db.meal_slots!.some((s) => s.id === id)).toBe(false)
    expect(db.meal_slot_sides!.some((s) => s.slot_id === id)).toBe(false)
    expect(db.meal_slot_votes!.some((s) => s.slot_id === id)).toBe(false)
    expect(db.meal_slot_comments!.some((s) => s.slot_id === id)).toBe(false)
  })

  it('removing a dish clears it from the plan without deleting the meal', async () => {
    const { client, db } = fresh()
    const idli = 'dish-idli'
    await client.from('dishes').delete().eq('id', idli)
    const slot = db.meal_slots!.find((s) => s.date === '2026-10-05' && s.meal === 'breakfast')!
    expect(slot.main_dish_id).toBeNull()
  })

  it('saves the home own copy of a recipe in one go, replacing the earlier copy and leaving the standard one alone', async () => {
    const { client } = fresh()
    const save = (servings: number, ingredients: object[]) =>
      client.rpc('save_household_recipe', { p_dish: 'dish-idli', p_servings: servings, p_prep: null, p_cook: null, p_note: null, p_note_ta: null, p_ingredients: ingredients, p_steps: [{ body: 'Steam.', body_ta: null }] })
    expect((await save(3, [{ name: 'Rice', name_ta: null, quantity: 2, unit: 'cup' }, { name: 'Salt', name_ta: null, quantity: null, unit: 'to_taste' }])).error).toBeNull()
    expect((await save(2, [{ name: 'Rice flour', name_ta: null, quantity: 1, unit: 'cup' }])).error).toBeNull()
    const { data } = await client.from('recipes').select('*, recipe_ingredients(*), recipe_steps(*)').eq('dish_id', 'dish-idli')
    const own = data!.filter((r: { household_id: string | null }) => r.household_id === DEMO_HOUSEHOLD_ID)
    expect(own).toHaveLength(1)
    expect(own[0].servings).toBe(2)
    expect(own[0].recipe_ingredients.map((i: { name: string }) => i.name)).toEqual(['Rice flour'])
    expect(data!.filter((r: { household_id: string | null }) => r.household_id === null)).toHaveLength(1)
    // back to the original
    await client.from('recipes').delete().eq('dish_id', 'dish-idli').eq('household_id', DEMO_HOUSEHOLD_ID)
    const after = await client.from('recipes').select('*').eq('dish_id', 'dish-idli')
    expect(after.data).toHaveLength(1)
    expect((await client.rpc('save_household_recipe', { p_dish: 'dish-idli', p_ingredients: [], p_steps: [] })).error).not.toBeNull()
  })

  it('says plainly that things that need a server are not in the demo', async () => {
    const { client } = fresh()
    const res = await client.rpc('create_household', {})
    expect(res.error?.message).toMatch(/not available in the demo/i)
  })

  it('keeps every demo database separate', async () => {
    const a = fresh()
    const b = fresh()
    await a.client.from('dish_favourites').delete().eq('household_id', DEMO_HOUSEHOLD_ID)
    const { data } = await b.client.from('dish_favourites').select('dish_id').eq('household_id', DEMO_HOUSEHOLD_ID)
    expect(data!.length).toBeGreaterThan(0)
    expect((a.db as Db).dish_favourites).toHaveLength(0)
  })
})
