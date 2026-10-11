// The optional "Nutrition per serving" fields on Add / Edit dish: what a person types, how it is checked and what is saved.
// Always an estimate. Framework-free, so it is unit-tested without a database.
import type { NutritionRow } from './nutrition'

export type NutritionField = 'serving' | 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g' | 'fibre_g' | 'sugar_g' | 'sodium_mg'
export type NutritionForm = Record<NutritionField, string>

export const NUTRITION_NUMBER_FIELDS: NutritionField[] = ['kcal', 'protein_g', 'carbs_g', 'fat_g', 'fibre_g', 'sugar_g', 'sodium_mg']
/** Without these four there is nothing useful to add up; fibre, sugar and salt may be left out (counted as 0). */
export const REQUIRED_NUTRITION_FIELDS: NutritionField[] = ['kcal', 'protein_g', 'carbs_g', 'fat_g']

/** Sanity limits for one serving (well inside what the database can hold). */
const MAX: Record<Exclude<NutritionField, 'serving'>, number> = { kcal: 5000, protein_g: 500, carbs_g: 1000, fat_g: 500, fibre_g: 200, sugar_g: 500, sodium_mg: 20000 }

export function blankNutrition(): NutritionForm {
  return { serving: '', kcal: '', protein_g: '', carbs_g: '', fat_g: '', fibre_g: '', sugar_g: '', sodium_mg: '' }
}

const text = (n: number) => String(Math.round(n * 10) / 10)

export function formFromRow(row: NutritionRow | null | undefined): NutritionForm {
  if (!row) return blankNutrition()
  return {
    serving: row.serving,
    kcal: text(Number(row.kcal)),
    protein_g: text(Number(row.protein_g)),
    carbs_g: text(Number(row.carbs_g)),
    fat_g: text(Number(row.fat_g)),
    fibre_g: text(Number(row.fibre_g)),
    sugar_g: text(Number(row.sugar_g)),
    sodium_mg: String(Math.round(Number(row.sodium_mg))),
  }
}

export type NutritionPayload = { serving: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; fibre_g: number; sugar_g: number; sodium_mg: number }
export type ParsedNutrition = { kind: 'none' } | { kind: 'ok'; value: NutritionPayload } | { kind: 'invalid'; fields: NutritionField[] }

function number(s: string): number | null {
  const t = s.trim().replace(',', '.')
  if (t === '' || !/^\d+(\.\d+)?$/.test(t)) return null
  return Number(t)
}

/** Everything blank means "no estimate". Otherwise the four main numbers are needed; the rest default to 0. */
export function parseNutrition(form: NutritionForm): ParsedNutrition {
  if (Object.values(form).every((v) => v.trim() === '')) return { kind: 'none' }
  const bad: NutritionField[] = []
  const out: Partial<Record<Exclude<NutritionField, 'serving'>, number>> = {}
  for (const f of NUTRITION_NUMBER_FIELDS as Exclude<NutritionField, 'serving'>[]) {
    const raw = form[f]
    if (raw.trim() === '') {
      if (REQUIRED_NUTRITION_FIELDS.includes(f)) bad.push(f)
      out[f] = 0
      continue
    }
    const n = number(raw)
    if (n === null || n > MAX[f]) bad.push(f)
    else out[f] = f === 'sodium_mg' ? Math.round(n) : Math.round(n * 10) / 10
  }
  if (form.serving.trim().length > 60) bad.push('serving')
  if (bad.length > 0) return { kind: 'invalid', fields: bad }
  return { kind: 'ok', value: { ...(out as Omit<NutritionPayload, 'serving'>), serving: form.serving.trim() || '1 serving' } }
}
