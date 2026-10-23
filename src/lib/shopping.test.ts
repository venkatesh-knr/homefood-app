import { describe, expect, it } from 'vitest'
import { changeUnit, findExisting, formatAmount, groupBySection, itemName, nudge, parseTyped, secondName, shareText, sleepingRegulars, splitList, whatsappLink, type ShopItem } from './shopping'

const NOW = new Date('2026-10-23T12:00:00Z').getTime()
const ago = (hours: number) => new Date(NOW - hours * 3600e3).toISOString()

function item(over: Partial<ShopItem> & { name: string }): ShopItem {
  return {
    id: over.name, household_id: 'h', name_ta: null, section: 'other', amount: null, unit: null, note: null, source: 'manual', source_dishes: [],
    is_regular: false, added_by: null, bought_at: null, bought_by: null, created_at: '2026-10-23T08:00:00Z', ...over,
  }
}

describe('parseTyped', () => {
  it('reads a name followed by an amount and unit', () => {
    expect(parseTyped('tomato 1 kg')).toEqual({ name: 'tomato', amount: 1, unit: 'kg' })
    expect(parseTyped('Tomato 500g')).toEqual({ name: 'Tomato', amount: 500, unit: 'g' })
    expect(parseTyped('milk 2 l')).toEqual({ name: 'milk', amount: 2, unit: 'L' })
    expect(parseTyped('rice 2.5 KG')).toEqual({ name: 'rice', amount: 2.5, unit: 'kg' })
    expect(parseTyped('sugar 500 gm')).toEqual({ name: 'sugar', amount: 500, unit: 'g' })
    expect(parseTyped('coriander 2 bunches')).toEqual({ name: 'coriander', amount: 2, unit: 'bunch' })
    expect(parseTyped('soap 1 packet')).toEqual({ name: 'soap', amount: 1, unit: 'pack' })
  })
  it('reads an amount in front of the name', () => {
    expect(parseTyped('2 kg onion')).toEqual({ name: 'onion', amount: 2, unit: 'kg' })
  })
  it('leaves the unit empty when only a number is typed', () => {
    expect(parseTyped('eggs 12')).toEqual({ name: 'eggs', amount: 12, unit: null })
  })
  it('keeps the whole text as the name when there is no amount', () => {
    expect(parseTyped('  curry   leaves ')).toEqual({ name: 'curry leaves', amount: null, unit: null })
    expect(parseTyped('tomato 1 xyz')).toEqual({ name: 'tomato 1 xyz', amount: null, unit: null })
    expect(parseTyped('')).toEqual({ name: '', amount: null, unit: null })
  })
  it('understands Tamil names and units', () => {
    expect(parseTyped('தக்காளி 1 கிலோ')).toEqual({ name: 'தக்காளி', amount: 1, unit: 'kg' })
    expect(parseTyped('பால் 2 லிட்டர்')).toEqual({ name: 'பால்', amount: 2, unit: 'L' })
  })
})

describe('amounts', () => {
  it('formats in the list units only', () => {
    expect(formatAmount(1, 'kg')).toBe('1 kg')
    expect(formatAmount(500, 'g')).toBe('500 g')
    expect(formatAmount(1, 'pcs')).toBe('1 pc')
    expect(formatAmount(4, 'pcs')).toBe('4 pcs')
    expect(formatAmount(2, 'bunch')).toBe('2 bunches')
    expect(formatAmount(0.5, 'L')).toBe('0.5 L')
    expect(formatAmount(1, 'kg', 'ta')).toBe('1 கிலோ')
    expect(formatAmount(null, null)).toBe('')
  })
  it('steps by 0.5 kg or L, 100 g or ml, and 1 piece, bunch or pack', () => {
    expect(nudge(1, 'kg', 1)).toEqual({ amount: 1.5, unit: 'kg' })
    expect(nudge(500, 'g', -1)).toEqual({ amount: 400, unit: 'g' })
    expect(nudge(4, 'pcs', 1)).toEqual({ amount: 5, unit: 'pcs' })
  })
  it('never goes below one step', () => {
    expect(nudge(0.5, 'kg', -1)).toEqual({ amount: 0.5, unit: 'kg' })
    expect(nudge(100, 'g', -1)).toEqual({ amount: 100, unit: 'g' })
    expect(nudge(1, 'pcs', -1)).toEqual({ amount: 1, unit: 'pcs' })
  })
  it('starts from no amount with a sensible first step', () => {
    expect(nudge(null, null, 1)).toEqual({ amount: 1, unit: 'pcs' })
    expect(nudge(null, 'g', 1)).toEqual({ amount: 250, unit: 'g' })
    expect(nudge(null, 'kg', -1)).toEqual({ amount: null, unit: 'kg' })
  })
  it('converts when the unit changes', () => {
    expect(changeUnit(1, 'kg', 'g')).toBe(1000)
    expect(changeUnit(500, 'g', 'kg')).toBe(0.5)
    expect(changeUnit(50, 'g', 'kg')).toBe(1)
    expect(changeUnit(2, 'L', 'ml')).toBe(2000)
    expect(changeUnit(4, 'pcs', 'g')).toBe(250)
    expect(changeUnit(0.5, 'kg', 'pcs')).toBe(1)
    expect(changeUnit(null, null, 'kg')).toBeNull()
  })
})

describe('the list', () => {
  const items = [
    item({ name: 'Tomato', name_ta: 'தக்காளி', section: 'veg_fruit', amount: 1, unit: 'kg' }),
    item({ name: 'Milk', section: 'dairy_eggs', is_regular: true, bought_at: ago(2), bought_by: 'p' }),
    item({ name: 'Curry leaves', section: 'veg_fruit', bought_at: ago(30), bought_by: 'p' }),
    item({ name: 'Bread', section: 'other', is_regular: true, bought_at: ago(30), bought_by: 'p' }),
    item({ name: 'Eggs', section: 'dairy_eggs', amount: 12, unit: 'pcs', created_at: '2026-10-23T09:00:00Z' }),
  ]
  it('splits what is still to buy from what was ticked in the last day', () => {
    const { toBuy, bought } = splitList(items, NOW)
    expect(toBuy.map((i) => i.name)).toEqual(['Tomato', 'Eggs'])
    expect(bought.map((i) => i.name)).toEqual(['Milk'])
  })
  it('knows which regulars are asleep', () => {
    expect(sleepingRegulars(items, NOW).map((i) => i.name)).toEqual(['Bread'])
  })
  it('groups by section in the fixed order and skips empty ones', () => {
    const groups = groupBySection(splitList(items, NOW).toBuy)
    expect(groups.map((g) => g.section)).toEqual(['veg_fruit', 'dairy_eggs'])
  })
  it('finds an existing item by English or Tamil name, ignoring capitals and spaces', () => {
    expect(findExisting(items, '  TOMATO ')?.name).toBe('Tomato')
    expect(findExisting(items, 'தக்காளி')?.name).toBe('Tomato')
    expect(findExisting(items, 'curry  leaves')?.name).toBe('Curry leaves')
    expect(findExisting(items, 'onion')).toBeUndefined()
    expect(findExisting(items, '  ')).toBeUndefined()
  })
  it('shows names in the chosen language and the other one small', () => {
    const tomato = items[0]!
    expect(itemName(tomato, 'en')).toBe('Tomato')
    expect(itemName(tomato, 'ta')).toBe('தக்காளி')
    expect(secondName(tomato, 'en')).toBe('தக்காளி')
    expect(secondName(tomato, 'ta')).toBe('Tomato')
    expect(secondName(items[1]!, 'en')).toBeNull()
    expect(itemName(items[1]!, 'ta')).toBe('Milk')
  })
})

describe('share text', () => {
  const labels = { title: 'Shopping list · Fri 23 Oct', section: { veg_fruit: 'Vegetables & fruits', grocery: 'Groceries', dairy_eggs: 'Dairy & eggs', other: 'Other' } }
  const toBuy = [
    item({ name: 'Tomato', name_ta: 'தக்காளி', section: 'veg_fruit', amount: 1, unit: 'kg' }),
    item({ name: 'Salt', section: 'grocery' }),
    item({ name: 'Eggs', section: 'dairy_eggs', amount: 12, unit: 'pcs', added_by: 'secret-profile-id', note: 'free range' }),
  ]
  it('lists items and amounts grouped by section', () => {
    expect(shareText(toBuy, 'en', labels)).toBe(['Shopping list · Fri 23 Oct', '', 'Vegetables & fruits', '• Tomato · 1 kg', '', 'Groceries', '• Salt', '', 'Dairy & eggs', '• Eggs · 12 pcs'].join('\n'))
  })
  it('uses Tamil names and units in Tamil', () => {
    expect(shareText(toBuy, 'ta', labels)).toContain('• தக்காளி · 1 கிலோ')
  })
  it('carries nothing but items: no people, notes or ids', () => {
    const text = shareText(toBuy, 'en', labels)
    expect(text).not.toContain('secret')
    expect(text).not.toContain('free range')
  })
  it('builds a WhatsApp link', () => {
    expect(whatsappLink('a b\nc')).toBe('https://wa.me/?text=a%20b%0Ac')
  })
})
