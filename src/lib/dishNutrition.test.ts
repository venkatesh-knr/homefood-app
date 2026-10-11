import { describe, expect, it } from 'vitest'
import { blankNutrition, formFromRow, parseNutrition } from './dishNutrition'
import type { NutritionRow } from './nutrition'

const filled = () => ({ ...blankNutrition(), serving: '1 plate', kcal: '450', protein_g: '20', carbs_g: '50', fat_g: '18', fibre_g: '5', sugar_g: '4', sodium_mg: '900' })

describe('parseNutrition', () => {
  it('means "no estimate" when every box is empty', () => {
    expect(parseNutrition(blankNutrition())).toEqual({ kind: 'none' })
    expect(parseNutrition({ ...blankNutrition(), serving: '  ' })).toEqual({ kind: 'none' })
  })

  it('accepts a full set of numbers', () => {
    expect(parseNutrition(filled())).toEqual({ kind: 'ok', value: { serving: '1 plate', kcal: 450, protein_g: 20, carbs_g: 50, fat_g: 18, fibre_g: 5, sugar_g: 4, sodium_mg: 900 } })
  })

  it('needs the four main numbers, and counts fibre, sugar and salt as 0 when left out', () => {
    const f = { ...blankNutrition(), kcal: '300', protein_g: '10', carbs_g: '40', fat_g: '9' }
    expect(parseNutrition(f)).toEqual({ kind: 'ok', value: { serving: '1 serving', kcal: 300, protein_g: 10, carbs_g: 40, fat_g: 9, fibre_g: 0, sugar_g: 0, sodium_mg: 0 } })
    expect(parseNutrition({ ...f, fat_g: '' })).toEqual({ kind: 'invalid', fields: ['fat_g'] })
    expect(parseNutrition({ ...blankNutrition(), serving: '1 cup' })).toEqual({ kind: 'invalid', fields: ['kcal', 'protein_g', 'carbs_g', 'fat_g'] })
  })

  it('refuses text, negatives and numbers no serving could have', () => {
    expect(parseNutrition({ ...filled(), kcal: 'lots' })).toEqual({ kind: 'invalid', fields: ['kcal'] })
    expect(parseNutrition({ ...filled(), protein_g: '-3' })).toEqual({ kind: 'invalid', fields: ['protein_g'] })
    expect(parseNutrition({ ...filled(), kcal: '99999' })).toEqual({ kind: 'invalid', fields: ['kcal'] })
  })

  it('reads a decimal comma and rounds to one decimal (whole milligrams for salt)', () => {
    const r = parseNutrition({ ...filled(), protein_g: '12,34', sodium_mg: '640.6' })
    expect(r).toMatchObject({ kind: 'ok', value: { protein_g: 12.3, sodium_mg: 641 } })
  })
})

describe('formFromRow', () => {
  it('writes a saved estimate back into the boxes', () => {
    const row = { dish_id: 'd', serving: '1 plate', kcal: 450, protein_g: 20.5, carbs_g: 50, fat_g: 18, fibre_g: 5, sugar_g: 4, sodium_mg: 900, is_estimate: true, source: '' } as NutritionRow
    expect(formFromRow(row)).toEqual({ serving: '1 plate', kcal: '450', protein_g: '20.5', carbs_g: '50', fat_g: '18', fibre_g: '5', sugar_g: '4', sodium_mg: '900' })
    expect(formFromRow(null)).toEqual(blankNutrition())
  })
})
