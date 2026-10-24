import { describe, expect, it } from 'vitest'
import { eligibility, fitsAll, groupByPlan, planFits, plansOf, proteinAim, type Follow } from './dietPlans'

describe('which dishes fit a plan', () => {
  it('low-carb keeps out grains, sugar, root vegetables and sweets', () => {
    expect(planFits('low_carb', { tags: ['low_carb', 'meat'] })).toBe(true)
    expect(planFits('low_carb', { tags: ['grain'] })).toBe(false)
    expect(planFits('low_carb', { tags: ['root_veg'] })).toBe(false)
    expect(planFits('low_carb', { tags: ['sweet'] })).toBe(false)
  })
  it('paleo keeps out grains, pulses, dairy and added sugar but allows meat', () => {
    expect(planFits('paleo', { tags: ['meat', 'egg', 'oily'] })).toBe(true)
    expect(planFits('paleo', { tags: ['pulse'] })).toBe(false)
    expect(planFits('paleo', { tags: ['dairy'] })).toBe(false)
  })
  it('vegan keeps out meat, egg and dairy; Jain also onion, garlic and roots', () => {
    expect(planFits('vegan', { tags: ['grain', 'pulse'] })).toBe(true)
    expect(planFits('vegan', { tags: ['dairy'] })).toBe(false)
    expect(planFits('jain', { tags: ['dairy', 'grain'] })).toBe(true)
    expect(planFits('jain', { tags: ['onion_garlic'] })).toBe(false)
    expect(planFits('jain', { tags: ['root_veg'] })).toBe(false)
    expect(planFits('jain', { tags: ['egg'] })).toBe(false)
  })
  it('high-protein asks for the tag; low-salt and senior-friendly keep things out', () => {
    expect(planFits('high_protein', { tags: ['high_protein'] })).toBe(true)
    expect(planFits('high_protein', { tags: [] })).toBe(false)
    expect(planFits('low_salt', { tags: ['salty'] })).toBe(false)
    expect(planFits('low_salt', { tags: ['oily'] })).toBe(true)
    expect(planFits('senior', { tags: ['spicy'] })).toBe(false)
    expect(planFits('senior', { tags: ['fried'] })).toBe(false)
    expect(planFits('senior', { tags: ['steamed'] })).toBe(true)
  })
  it('a dish with no tags fits every plan that only avoids things', () => {
    expect(planFits('paleo', {})).toBe(true)
    expect(planFits('high_protein', {})).toBe(false)
  })
  it('a group that follows more than one plan needs a dish that fits all of them', () => {
    expect(fitsAll(['low_carb', 'high_protein'], { tags: ['high_protein', 'meat'] })).toBe(true)
    expect(fitsAll(['low_carb', 'high_protein'], { tags: ['high_protein', 'grain'] })).toBe(false)
    expect(fitsAll([], { tags: ['grain'] })).toBe(true)
  })
})

describe('who may follow a plan', () => {
  it('anyone may follow the gentle plans', () => {
    expect(eligibility('vegan', null, 2026)).toEqual({ ok: true })
    expect(eligibility('senior', 2018, 2026)).toEqual({ ok: true })
  })
  it('the restrictive plans need a known birth year and 18 or more', () => {
    expect(eligibility('low_carb', null, 2026)).toEqual({ ok: false, reason: 'noBirthYear' })
    expect(eligibility('paleo', 2010, 2026)).toEqual({ ok: false, reason: 'under18' })
    expect(eligibility('paleo', 2008, 2026)).toEqual({ ok: true })
    expect(eligibility('low_carb', 1990, 2026)).toEqual({ ok: true })
  })
})

describe('followers', () => {
  const f = (profile_id: string, plan: Follow['plan'], since: string): Follow => ({ profile_id, plan, since, set_by: null })
  const list = [f('amma', 'low_carb', '2026-10-12'), f('appa', 'low_carb', '2026-10-13'), f('paati', 'senior', '2026-10-01')]
  it('groups by plan, the oldest plan first', () => {
    const g = groupByPlan(list)
    expect(g.map((x) => x.plan)).toEqual(['senior', 'low_carb'])
    expect(g[1]!.follows.map((x) => x.profile_id)).toEqual(['amma', 'appa'])
  })
  it('lists the plans of one person', () => {
    expect(plansOf(list, 'amma')).toEqual(['low_carb'])
    expect(plansOf(list, 'kavi')).toEqual([])
  })
})

describe('the protein aim', () => {
  it('is a quarter above the usual value for the protein-leaning plans, to the nearest 5 g', () => {
    expect(proteinAim(['high_protein'], 60)).toBe(75)
    expect(proteinAim(['low_carb'], 64)).toBe(80)
    expect(proteinAim(['mediterranean', 'high_protein'], 50)).toBe(65)
  })
  it('is nothing for other plans or no plan', () => {
    expect(proteinAim(['vegan', 'senior'], 60)).toBeNull()
    expect(proteinAim([], 60)).toBeNull()
    expect(proteinAim(['high_protein'], 0)).toBeNull()
  })
})
