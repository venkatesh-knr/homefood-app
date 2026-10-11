import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { NUTRIENTS } from './nutrition'
import { nutritionFor, snapshotFor, type FoodOption, type FoodSource, type FoodUnit, type Goals, type IntakeDraft, type IntakeRow, type PerUnit } from './intake'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function refresh() {
  await queryClient.invalidateQueries({ queryKey: ['intake'] })
  await queryClient.invalidateQueries({ queryKey: ['family-extras'] })
}

const sourceColumns = (s: FoodSource | null) => ({ common_food_id: s?.kind === 'common' ? s.id : null, custom_food_id: s?.kind === 'custom' ? s.id : null, dish_id: s?.kind === 'dish' ? s.id : null })

/** Logs one item for a person (themselves, or a family member with no login when the Admin does it). The nutrition is copied in now. */
export async function logIntake(args: { householdId: string; profileId: string; byProfileId: string; date: string; time: string; food: FoodOption; quantity: number }): Promise<void> {
  const { error } = await client()
    .from('personal_intake')
    .insert({ household_id: args.householdId, profile_id: args.profileId, eaten_on: args.date, eaten_at: args.time, ...sourceColumns(args.food.source), ...snapshotFor(args.food, args.quantity), created_by: args.byProfileId })
  if (error) throw error
  await refresh()
}

/** A new amount for a logged item. The nutrition is rescaled from what was saved, so a later correction to the food never changes it. */
export async function changeIntakeAmount(row: IntakeRow, quantity: number): Promise<void> {
  const perUnit = {} as PerUnit
  for (const k of NUTRIENTS) perUnit[k] = row[k] === null ? null : row[k]! / row.quantity
  const { error } = await client().from('personal_intake').update({ quantity, ...nutritionFor(perUnit, quantity) }).eq('id', row.id)
  if (error) throw error
  await refresh()
}

export async function removeIntake(id: string): Promise<void> {
  const { error } = await client().from('personal_intake').delete().eq('id', id)
  if (error) throw error
  await refresh()
}

/** "Same as yesterday": inserts the copied items for today in one go. */
export async function copyIntake(drafts: IntakeDraft[], args: { householdId: string; date: string; byProfileId: string }): Promise<void> {
  if (drafts.length === 0) return
  const rows = drafts.map((d) => ({ ...d, household_id: args.householdId, eaten_on: args.date, created_by: args.byProfileId }))
  const { error } = await client().from('personal_intake').insert(rows)
  if (error) throw error
  await refresh()
}

/** Star or un-star a food in "My usuals". */
export async function setUsual(args: { householdId: string; profileId: string; source: FoodSource; on: boolean }): Promise<void> {
  const col = args.source.kind === 'common' ? 'common_food_id' : args.source.kind === 'custom' ? 'custom_food_id' : 'dish_id'
  if (args.on) {
    const { error } = await client().from('personal_usuals').insert({ household_id: args.householdId, profile_id: args.profileId, ...sourceColumns(args.source) })
    if (error && error.code !== '23505') throw error
  } else {
    const { error } = await client().from('personal_usuals').delete().eq('profile_id', args.profileId).eq(col, args.source.id)
    if (error) throw error
  }
  await queryClient.invalidateQueries({ queryKey: ['usuals', args.profileId] })
}

/** Saves a person's own goals; both empty removes them (back to the suggested targets). */
export async function saveGoals(profileId: string, householdId: string, goals: Goals): Promise<void> {
  if (goals.protein_goal_g === null && goals.kcal_goal === null) {
    const { error } = await client().from('personal_goals').delete().eq('profile_id', profileId)
    if (error) throw error
  } else {
    const { error } = await client().from('personal_goals').upsert({ profile_id: profileId, household_id: householdId, ...goals, updated_at: new Date().toISOString() }, { onConflict: 'profile_id' })
    if (error) throw error
  }
  await queryClient.invalidateQueries({ queryKey: ['goals', profileId] })
}

export type CustomFoodInput = { name: string; name_ta: string; unit: FoodUnit; kcal: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null }

/** "Something else…": a food of this home's own. Returns its id. */
export async function addCustomFood(householdId: string, byProfileId: string, input: CustomFoodInput): Promise<string> {
  const { data, error } = await client()
    .from('custom_foods')
    .insert({ household_id: householdId, created_by: byProfileId, name: input.name.trim(), name_ta: input.name_ta.trim() || null, unit: input.unit, kcal: input.kcal, protein_g: input.protein_g, carbs_g: input.carbs_g, fat_g: input.fat_g })
    .select('id')
    .single()
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['custom-foods', householdId] })
  return data.id as string
}
