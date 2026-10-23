import { describe, expect, it } from 'vitest'
import { SECTION_OF_TAB, TAB_OF_SECTION, canon, catalogIndex, isPerishableSection, itemsOfTab, matchCatalog, suggestItems, type CatalogItem } from './shopping'

const mk = (over: Partial<CatalogItem> & { name_en: string }): CatalogItem => ({
  key: over.name_en, source: 'common', id: over.name_en, name_ta: null, aliases: [], section: 'grocery', tab: 'groceries', usual_amount: 1, usual_unit: 'kg',
  perishable: false, staple: false, pack_sizes: null, g_per_cup: null, g_per_piece: null, created_by: null, ...over,
})

const items = [
  mk({ name_en: 'Tomato', name_ta: 'தக்காளி', aliases: ['tomatoes'], section: 'veg_fruit', tab: 'vegetables' }),
  mk({ name_en: 'Small onion', name_ta: 'சின்ன வெங்காயம்', aliases: ['shallots', 'sambar onion'], section: 'veg_fruit', tab: 'vegetables', usual_amount: 500, usual_unit: 'g' }),
  mk({ name_en: 'Onion', name_ta: 'வெங்காயம்', aliases: ['big onion'], section: 'veg_fruit', tab: 'vegetables' }),
  mk({ name_en: "Lady's finger", name_ta: 'வெண்டைக்காய்', aliases: ['okra', 'ladies finger'], section: 'veg_fruit', tab: 'vegetables' }),
  mk({ name_en: 'Toor dal', name_ta: 'துவரம் பருப்பு', aliases: ['tur dal'] }),
  mk({ name_en: 'Foxtail millet', name_ta: 'தினை', source: 'ours', usual_amount: 500, usual_unit: 'g' }),
]
const index = catalogIndex(items)

describe('the catalogue', () => {
  it('compares names ignoring capitals, plurals, brackets and hyphens', () => {
    expect(canon('Tomatoes')).toBe('tomato')
    expect(canon('Lady’s finger')).toBe('lady finger')
    expect(canon('Rava (semolina)')).toBe('rava')
    expect(canon('Ginger-garlic paste')).toBe('ginger garlic paste')
    expect(canon('Green chillies')).toBe('green chilly')
  })

  it('matches a typed name by English name, Tamil name or alias', () => {
    expect(matchCatalog(index, 'tomatoes')?.name_en).toBe('Tomato')
    expect(matchCatalog(index, 'தக்காளி')?.name_en).toBe('Tomato')
    expect(matchCatalog(index, 'Shallots')?.name_en).toBe('Small onion')
    expect(matchCatalog(index, 'okra')?.name_en).toBe("Lady's finger")
    expect(matchCatalog(index, 'foxtail millet')?.source).toBe('ours')
    expect(matchCatalog(index, 'banana stem')).toBeUndefined()
  })

  it('puts an own item ahead of a common one with the same name', () => {
    const both = catalogIndex([mk({ name_en: 'Tamarind', usual_amount: 250, usual_unit: 'g' }), mk({ name_en: 'Tamarind', source: 'ours', usual_amount: 1, usual_unit: 'kg', id: 'mine' })])
    expect(matchCatalog(both, 'tamarind')?.id).toBe('mine')
  })

  it('suggests items as the name is typed, best matches first', () => {
    expect(suggestItems(items, 'to').map((c) => c.name_en)).toEqual(['Tomato', 'Toor dal'])
    expect(suggestItems(items, 'onion').map((c) => c.name_en)).toEqual(['Onion', 'Small onion'])
    expect(suggestItems(items, 'தக்').map((c) => c.name_en)).toEqual(['Tomato'])
    expect(suggestItems(items, 'okra').map((c) => c.name_en)).toEqual(["Lady's finger"])
    expect(suggestItems(items, 'x')).toEqual([])
    expect(suggestItems(items, 'zzz')).toEqual([])
  })

  it("lists a browse tab with the home's own items last", () => {
    expect(itemsOfTab(items, 'groceries').map((c) => c.name_en)).toEqual(['Toor dal', 'Foxtail millet'])
    expect(itemsOfTab(items, 'fruits')).toEqual([])
  })

  it('maps tabs and sections both ways', () => {
    expect(SECTION_OF_TAB.fruits).toBe('veg_fruit')
    expect(TAB_OF_SECTION.dairy_eggs).toBe('dairy_eggs')
    expect(isPerishableSection('veg_fruit')).toBe(true)
    expect(isPerishableSection('grocery')).toBe(false)
  })
})
