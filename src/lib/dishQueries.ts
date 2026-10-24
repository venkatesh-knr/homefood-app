import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Cuisine, Dish, DishNameRow } from './dishes'
import { effectiveTags } from './dishTags'
import { fetchCorrections } from './dishTagQueries'

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
      // a home's own corrections of the diet tags are folded in, so every screen sees the same tags
      const corrections = await fetchCorrections(householdId!)
      return (data as DishWithNames[]).map((d) => (corrections.has(d.id) ? { ...d, tags: effectiveTags(d.tags, corrections.get(d.id)) } : d))
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

export type PhotoOverrideRow = { dish_id: string; household_id: string; photo_path: string; photo_credit?: string | null; updated_at: string }

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

/** `dishes.photo_path` / `dish_photo_overrides.photo_path` hold one of three things:
 * - `static/<file>`: a catalogue photo bundled with the app (public/dish-photos/, migration 0014), no network lookup;
 * - a plain http(s) URL: older stock photos, shown as-is;
 * - anything else: a private-bucket storage path (a household's own upload), always signed. */
const STATIC_PREFIX = 'static/'

function isExternalUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

/** The public link for a bundled catalogue photo (works under any base path, e.g. GitHub Pages). */
export function staticPhotoUrl(path: string): string | null {
  if (!path.startsWith(STATIC_PREFIX)) return null
  return `${import.meta.env.BASE_URL}dish-photos/${path.slice(STATIC_PREFIX.length)}`
}

/** Bundled and external photos are already public and used directly; the bucket is private, so every
 * uploaded photo is shown through a short-lived signed link. */
export function useSignedPhotoUrl(path: string | null | undefined) {
  const direct = path ? (staticPhotoUrl(path) ?? (isExternalUrl(path) ? path : null)) : null
  return useQuery({
    queryKey: ['dish-photo-url', path],
    enabled: Boolean(supabase && path && !direct),
    staleTime: 30 * 60 * 1000,
    initialData: direct ?? undefined,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase!.storage.from('dish-photos').createSignedUrl(path!, 3600)
      if (error) throw error
      return data.signedUrl
    },
  })
}
