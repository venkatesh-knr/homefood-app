import { afterEach, describe, expect, it } from 'vitest'
import catalogue from './catalogue.json'
import { buildDemoDb, DEMO_HOUSEHOLD_ID, DEMO_IDS, type Catalogue } from './demoData'
import { createDemoClient } from './fakeClient'
import { setDemoActive, setDemoRole } from './demoState'
import en from '../i18n/en.json'

const text = { homeName: en.demo.data.homeName, helper: en.demo.data.helper, comments: { kaviSpicy: 'a', ammaSure: 'b', appaGood: 'c', appaBiryani: 'd', kaviBiryani: 'e' }, notes: { saturday: '' } }
const fresh = () => createDemoClient(buildDemoDb(catalogue as unknown as Catalogue, text, new Date()))
const today = () => new Date().toISOString().slice(0, 10)

afterEach(() => setDemoActive(false))

describe('demo: My extras are private, like in the real database', () => {
  it('lets Kavi see only her own items', async () => {
    const client = fresh()
    setDemoRole('member') // Kavi
    const { data } = await client.from('personal_intake').select('profile_id')
    expect(data!.length).toBeGreaterThan(0)
    expect(new Set(data!.map((r: { profile_id: string }) => r.profile_id))).toEqual(new Set([DEMO_IDS.kavi]))
  })

  it('keeps the Admin out of a member\'s items, but lets her see the totals', async () => {
    const client = fresh()
    setDemoRole('admin')
    expect((await client.from('personal_intake').select('id').eq('profile_id', DEMO_IDS.kavi)).data).toEqual([])
    const totals = await client.rpc('family_extras_totals', { p_from: '2000-01-01', p_to: '2100-01-01' })
    const kavi = (totals.data as { profile_id: string; items: number; kcal: number }[]).filter((r) => r.profile_id === DEMO_IDS.kavi)
    expect(kavi.length).toBeGreaterThan(0)
    expect(kavi[0]).not.toHaveProperty('food_name')
  })

  it('lets the Admin log for Paati (no login) but not for Kavi, and nobody for the helper', async () => {
    const client = fresh()
    setDemoRole('admin')
    const row = (who: string) => ({ household_id: DEMO_HOUSEHOLD_ID, profile_id: who, eaten_on: today(), food_name: 'x', quantity: 1, unit: 'piece', common_food_id: 'food-banana' })
    expect((await client.from('personal_intake').insert(row(DEMO_IDS.paati))).error).toBeNull()
    expect((await client.from('personal_intake').select('id').eq('profile_id', DEMO_IDS.paati)).data).toHaveLength(1)
    expect((await client.from('personal_intake').insert(row(DEMO_IDS.kavi))).error?.code).toBe('42501')
    expect((await client.from('personal_intake').insert(row(DEMO_IDS.helper))).error?.code).toBe('42501')
    setDemoRole('member')
    expect((await client.from('personal_intake').select('id').eq('profile_id', DEMO_IDS.paati)).data).toEqual([])
  })

  it('refuses the family totals to an ordinary member', async () => {
    const client = fresh()
    setDemoRole('member')
    expect((await client.rpc('family_extras_totals', { p_from: today(), p_to: today() })).error).not.toBeNull()
  })

  it('has the shared foods, with Tamil names', async () => {
    const { data } = await fresh().from('common_foods').select('name_en, name_ta')
    expect(data!.length).toBeGreaterThanOrEqual(80)
    expect(data!.every((f: { name_ta: string }) => f.name_ta)).toBe(true)
  })
})
