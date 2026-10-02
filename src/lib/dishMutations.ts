import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { stripPhotoMetadata } from './photo'
import type { DishCourse, DietType, MealType } from './dishes'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

/** A cuisine owned by this household (shown only to its members); the shared ones come from migration 0003. */
export async function addCuisine(householdId: string, name: string, nameTa: string): Promise<void> {
  const { error } = await client()
    .from('cuisines')
    .insert({ household_id: householdId, name: name.trim(), name_ta: nameTa.trim() || null, sort_order: 200 })
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['cuisines'] })
}

export type DishInput = {
  name_en: string
  name_ta: string
  cuisine_id: string | null
  meal_types: MealType[]
  course: DishCourse
  diet: DietType
  tags: string[]
  allergens: string[]
  prep_minutes: string
}

async function saveDishNames(dishId: string, input: DishInput): Promise<void> {
  const { error: clearError } = await client().from('dish_names').delete().eq('dish_id', dishId)
  if (clearError) throw clearError
  const names: { dish_id: string; language: 'en' | 'ta'; name: string }[] = [
    { dish_id: dishId, language: 'en', name: input.name_en.trim() },
  ]
  if (input.name_ta.trim()) names.push({ dish_id: dishId, language: 'ta', name: input.name_ta.trim() })
  const { error } = await client().from('dish_names').insert(names)
  if (error) throw error
}

export async function addDish(householdId: string, myProfileId: string, input: DishInput): Promise<string> {
  const { data, error } = await client()
    .from('dishes')
    .insert({
      household_id: householdId,
      cuisine_id: input.cuisine_id,
      name: input.name_en.trim(),
      meal_types: input.meal_types,
      course: input.course,
      diet: input.diet,
      tags: input.tags,
      allergens: input.allergens,
      prep_minutes: input.prep_minutes.trim() === '' ? null : Number(input.prep_minutes),
      created_by: myProfileId,
    })
    .select('id')
    .single()
  if (error) throw error
  await saveDishNames(data.id, input)
  await queryClient.invalidateQueries({ queryKey: ['dishes', householdId] })
  return data.id as string
}

export async function updateDish(dishId: string, householdId: string, input: DishInput): Promise<void> {
  const { error } = await client()
    .from('dishes')
    .update({
      cuisine_id: input.cuisine_id,
      name: input.name_en.trim(),
      meal_types: input.meal_types,
      course: input.course,
      diet: input.diet,
      tags: input.tags,
      allergens: input.allergens,
      prep_minutes: input.prep_minutes.trim() === '' ? null : Number(input.prep_minutes),
    })
    .eq('id', dishId)
  if (error) throw error
  await saveDishNames(dishId, input)
  await queryClient.invalidateQueries({ queryKey: ['dishes', householdId] })
  await queryClient.invalidateQueries({ queryKey: ['dish', dishId] })
}

export async function removeDish(dishId: string, householdId: string): Promise<void> {
  const { error } = await client().from('dishes').delete().eq('id', dishId)
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['dishes', householdId] })
}

/** Replaces this household's photo for a dish — the shared catalogue's own photo is untouched. */
export async function uploadDishPhoto(householdId: string, dishId: string, file: File): Promise<void> {
  const { data: existing } = await client()
    .from('dish_photo_overrides')
    .select('photo_path')
    .eq('household_id', householdId)
    .eq('dish_id', dishId)
    .maybeSingle()

  const blob = await stripPhotoMetadata(file)
  const path = `${householdId}/${dishId}-${Date.now()}.jpg`
  const { error: uploadError } = await client().storage.from('dish-photos').upload(path, blob, { contentType: 'image/jpeg' })
  if (uploadError) throw uploadError

  const { error: dbError } = await client()
    .from('dish_photo_overrides')
    .upsert({ dish_id: dishId, household_id: householdId, photo_path: path, updated_at: new Date().toISOString() })
  if (dbError) throw dbError

  if (existing?.photo_path) {
    await client().storage.from('dish-photos').remove([existing.photo_path]) // best-effort cleanup
  }
  await queryClient.invalidateQueries({ queryKey: ['dish-photo-overrides', householdId] })
}
