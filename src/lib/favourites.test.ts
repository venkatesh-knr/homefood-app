import { describe, expect, it } from 'vitest'
import { countUsage, orderDishes } from './favourites'

const dish = (id: string, name: string) => ({ id, name })

describe('orderDishes', () => {
  const dishes = [dish('a', 'Appam'), dish('b', 'Biryani'), dish('c', 'Curd'), dish('d', 'Dosa')]
  const nameOf = (d: { name: string }) => d.name
  it('puts favourites first, then the most used, then alphabetical', () => {
    const out = orderDishes(dishes, new Set(['c']), new Map([['d', 5], ['b', 2]]), nameOf)
    expect(out.map((d) => d.id)).toEqual(['c', 'd', 'b', 'a'])
  })
  it('keeps alphabetical order when nothing is favourite or used', () => {
    expect(orderDishes([dish('x', 'Zeera'), dish('y', 'Aloo')], new Set(), new Map(), nameOf).map((d) => d.id)).toEqual(['y', 'x'])
  })
  it('orders favourites among themselves by use', () => {
    const out = orderDishes(dishes, new Set(['a', 'b']), new Map([['b', 3]]), nameOf)
    expect(out.map((d) => d.id)).toEqual(['b', 'a', 'c', 'd'])
  })
  it('does not change the list it was given', () => {
    const copy = [...dishes]
    orderDishes(dishes, new Set(['d']), new Map(), nameOf)
    expect(dishes).toEqual(copy)
  })
})

describe('countUsage and leftovers', () => {
  it('does not count a leftover side as the dish being planned again', () => {
    const counts = countUsage([{ main_dish_id: 'idli', meal_slot_sides: [{ dish_id: 'sambar', is_leftover: true }, { dish_id: 'chutney' }] }])
    expect(counts.get('sambar')).toBeUndefined()
    expect(counts.get('chutney')).toBe(1)
  })
})

describe('countUsage', () => {
  it('counts main dishes and sides', () => {
    const counts = countUsage([
      { main_dish_id: 'idli', meal_slot_sides: [{ dish_id: 'sambar' }, { dish_id: 'chutney' }] },
      { main_dish_id: 'idli', meal_slot_sides: [{ dish_id: 'sambar' }] },
      { main_dish_id: null, meal_slot_sides: [] },
    ])
    expect(counts.get('idli')).toBe(2)
    expect(counts.get('sambar')).toBe(2)
    expect(counts.get('chutney')).toBe(1)
  })
})
