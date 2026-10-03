import { describe, expect, it } from 'vitest'
import { clampServings, formatQuantity, isPlural, scaleQuantity } from './recipes'

describe('scaleQuantity', () => {
  it('scales from the recipe\'s own servings to the people eating', () => {
    expect(scaleQuantity(1, 4, 5)).toBe(1.25)
    expect(scaleQuantity(300, 2, 5)).toBe(750)
    expect(scaleQuantity(3, 4, 4)).toBe(3)
  })
})

describe('formatQuantity', () => {
  it('writes cups and spoons with fractions a cook can measure', () => {
    expect(formatQuantity(1.25, 'cup')).toBe('1¼')
    expect(formatQuantity(0.75, 'tbsp')).toBe('¾')
    expect(formatQuantity(5.7, 'cup')).toBe('5¾')
    expect(formatQuantity(0.4, 'tsp')).toBe('⅜')
    expect(formatQuantity(0.01, 'tsp')).toBe('⅛')
  })
  it('keeps weights whole and rounds big ones to 5', () => {
    expect(formatQuantity(252, 'g')).toBe('250')
    expect(formatQuantity(37.4, 'g')).toBe('37')
    expect(formatQuantity(0.2, 'ml')).toBe('1')
  })
  it('counts things in halves, never less than a half', () => {
    expect(formatQuantity(1.2, 'piece')).toBe('1')
    expect(formatQuantity(1.4, 'clove')).toBe('1½')
    expect(formatQuantity(0.1, 'sprig')).toBe('½')
    expect(formatQuantity(13, 'piece')).toBe('13')
  })
})

describe('isPlural / clampServings', () => {
  it('only plurals above one', () => {
    expect(isPlural(1)).toBe(false)
    expect(isPlural(1.25)).toBe(true)
  })
  it('keeps servings between 1 and 30', () => {
    expect(clampServings(0)).toBe(1)
    expect(clampServings(4.4)).toBe(4)
    expect(clampServings(99)).toBe(30)
  })
})
