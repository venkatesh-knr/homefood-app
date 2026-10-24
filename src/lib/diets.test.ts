import { describe, expect, it } from 'vitest'
import { EMPTY_PREFERENCES, clashesHard, cookingNotes, dishClashes, mealClashes, preferenceParts, type Preferences } from './diets'

const pref = (id: string, over: Partial<Preferences> = {}): Preferences => ({ ...EMPTY_PREFERENCES(id), ...over })

describe('a dish against a person\'s preferences', () => {
  it('a vegetarian cannot have an egg or non-veg dish; an egg eater cannot have non-veg', () => {
    expect(dishClashes({ diet: 'non_veg' }, pref('p', { diet: 'veg' }))).toEqual([{ kind: 'diet', hard: true }])
    expect(dishClashes({ diet: 'egg' }, pref('p', { diet: 'veg' }))).toEqual([{ kind: 'diet', hard: true }])
    expect(dishClashes({ diet: 'egg' }, pref('p', { diet: 'egg' }))).toEqual([])
    expect(dishClashes({ diet: 'non_veg' }, pref('p', { diet: 'egg' }))).toEqual([{ kind: 'diet', hard: true }])
    expect(dishClashes({ diet: 'non_veg' }, pref('p', { diet: 'non_veg' }))).toEqual([])
    expect(dishClashes({ diet: 'non_veg' }, pref('p'))).toEqual([])
  })
  it('no onion or garlic is a hard clash with a tagged dish', () => {
    expect(dishClashes({ diet: 'veg', tags: ['onion_garlic'] }, pref('p', { no_onion_garlic: true }))).toEqual([{ kind: 'onion_garlic', hard: true }])
    expect(dishClashes({ diet: 'veg', tags: [] }, pref('p', { no_onion_garlic: true }))).toEqual([])
  })
  it('low salt, oil and sugar are gentle clashes with salty, oily and sweet dishes', () => {
    const p = pref('p', { low_salt: true, low_oil: true, low_sugar: true })
    expect(dishClashes({ diet: 'veg', tags: ['salty', 'sweet'] }, p)).toEqual([{ kind: 'salty', hard: false }, { kind: 'sweet', hard: false }])
    expect(dishClashes({ diet: 'veg', tags: ['oily'] }, p)).toEqual([{ kind: 'oily', hard: false }])
    expect(dishClashes({ diet: 'veg', tags: ['salty'] }, pref('p'))).toEqual([])
  })
  it('only hard clashes take a dish out of "Suits everyone eating"', () => {
    const prefs = [pref('a', { low_salt: true }), pref('b', { diet: 'veg' })]
    expect(clashesHard({ diet: 'veg', tags: ['salty'] }, prefs)).toBe(false)
    expect(clashesHard({ diet: 'non_veg', tags: [] }, prefs)).toBe(true)
  })
  it('a missing person or an untagged dish clashes with nothing', () => {
    expect(dishClashes({ diet: 'non_veg' }, undefined)).toEqual([])
    expect(clashesHard({ diet: 'non_veg' }, [])).toBe(false)
  })
})

describe('a whole meal', () => {
  const prefs = new Map([['paati', pref('paati', { diet: 'veg', low_salt: true })], ['kavi', pref('kavi')]])
  it('says who, which dish and what', () => {
    const dishes = [
      { id: 'a', name: 'Chicken curry', diet: 'non_veg' as const, tags: [] },
      { id: 'b', name: 'Appalam', diet: 'veg' as const, tags: ['salty'] },
    ]
    expect(mealClashes(dishes, [{ id: 'paati', name: 'Paati' }, { id: 'kavi', name: 'Kavi' }], prefs)).toEqual([
      { person: 'Paati', dish: 'Chicken curry', kind: 'diet', hard: true },
      { person: 'Paati', dish: 'Appalam', kind: 'salty', hard: false },
    ])
  })
})

describe('the cook\'s note', () => {
  const prefs = new Map([['paati', pref('paati', { low_salt: true, no_onion_garlic: true })], ['amma', pref('amma', { low_oil: true })], ['arun', pref('arun', { low_salt: true })]])
  const names = new Map([['paati', 'Paati'], ['amma', 'Amma'], ['arun', 'Arun']])
  it('counts each person once however many meals they are in', () => {
    const notes = cookingNotes([['paati', 'amma'], ['paati']], names, prefs)
    expect(notes.get('low_salt')).toEqual(['Paati'])
    expect(notes.get('low_oil')).toEqual(['Amma'])
    expect(notes.get('no_onion_garlic')).toEqual(['Paati'])
    expect(notes.has('low_sugar')).toBe(false)
  })
  it('leaves out people who are not eating', () => {
    expect(cookingNotes([['amma']], names, prefs).has('low_salt')).toBe(false)
  })
})

describe('the line under a name', () => {
  const label = (k: string) => k.split('.')[1]!.replace(/_/g, ' ')
  it('lists what is set, in order', () => {
    expect(preferenceParts(pref('p', { diet: 'non_veg', low_oil: true }), label)).toEqual(['non veg', 'low oil'])
    expect(preferenceParts(pref('p', { diet: 'veg', low_salt: true, no_onion_garlic: true }), label)).toEqual(['veg', 'no onion garlic', 'low salt'])
    expect(preferenceParts(pref('p'), label)).toEqual([])
    expect(preferenceParts(undefined, label)).toEqual([])
  })
})
