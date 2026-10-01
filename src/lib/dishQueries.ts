import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Cuisine, Dish, DishNameRow } from './dishes'

export function useCuisines() {
  return useQuery({
    queryKey: ['cuisines'],
    enabled: Boolean(supabase),
    queryFn: async (): Promise<Cuisine[]> => {
      const { data, error } = await supabase!.from('cuisines').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })
}

export type DishWithNames = Dish & { dish_names: DishNameRow[] }

/** Everyone sees the shared catalogue (household_id null) plus this household's own additions. */
export function useDishes(householdId: string | undefined) {
  return useQuery({
    queryKey: ['dishes', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<DishWithNames[]> => {
      const { data, error } = await supabase!
        .from('dishes')
        .select('*, dish_names(language, name)')
        .or(`household_id.is.null,household_id.eq.${householdId}`)
        .order('name')
      if (error) throw error
      return data as DishWithNames[]
    },
  })
}

export function useDish(dishId: string | undefined) {
  return useQuery({
    queryKey: ['dish', dishId],
    enabled: Boolean(supabase && dishId),
    queryFn: async (): Promise<DishWithNames> => {
      const { data, error } = await supabase!.from('dishes').select('*, dish_names(language, name)').eq('id', dishId).single()
      if (error) throw error
      return data as DishWithNames
    },
  })
}

export type PhotoOverrideRow = { dish_id: string; household_id: string; photo_path: string; updated_at: string }

export function useDishPhotoOverrides(householdId: string | undefined) {
  return useQuery({
    queryKey: ['dish-photo-overrides', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<PhotoOverrideRow[]> => {
      const { data, error } = await supabase!.from('dish_photo_overrides').select('*').eq('household_id', householdId)
      if (error) throw error
      return data
    },
  })
}

/** `dishes.photo_path` / `dish_photo_overrides.photo_path` hold either a private-bucket storage path
 * (any household upload, always signed) or a plain stock-photo URL (seed dishes' own catalogue photo,
 * shown as-is — see supabase/migrations/0007_dish_stock_photos.sql). */
function isExternalUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

/** The bucket is private, so every uploaded photo is shown through a short-lived signed link;
 * an external stock-photo URL is already public and used directly. */
export function useSignedPhotoUrl(path: string | null | undefined) {
  const external = Boolean(path && isExternalUrl(path))
  return useQuery({
    queryKey: ['dish-photo-url', path],
    enabled: Boolean(supabase && path && !external),
    staleTime: 30 * 60 * 1000,
    initialData: external ? (path as string) : undefined,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase!.storage.from('dish-photos').createSignedUrl(path!, 3600)
      if (error) throw error
      return data.signedUrl
    },
  })
}
