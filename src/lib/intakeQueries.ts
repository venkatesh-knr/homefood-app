import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { useDishes } from './dishQueries'
import { useAllNutrition } from './nutritionQueries'
import { dishDisplayName } from './dishes'
import type { FoodCategory, FoodOption, FoodSource, FoodUnit, Goals, IntakeRow, PerUnit } from './intake'
import { foodKey } from './intake'

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v))

function perOf(r: Record<string, unknown>): PerUnit {
  return { kcal: num(r.kcal), protein_g: num(r.protein_g), carbs_g: num(r.carbs_g), fat_g: num(r.fat_g), fibre_g: num(r.fibre_g), sugar_g: num(r.sugar_g), sodium_mg: num(r.sodium_mg) }
}

/** The shared everyday foods. Empty (not an error) before migrations 0029 / 0030 are run, so the app keeps working without them. */
export function useCommonFoods() {
  return useQuery({
    queryKey: ['common-foods'],
    enabled: Boolean(supabase),
    staleTime: 60 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<FoodOption[]> => {
      const { data, error } = await supabase!.from('common_foods').select('*').order('name_en')
      if (error) return []
      return data.map((r) => ({
        key: foodKey({ kind: 'common', id: r.id }), source: { kind: 'common' as const, id: r.id as string }, name_en: r.name_en as string, name_ta: r.name_ta as string,
        category: r.category as FoodCategory, unit: r.unit as FoodUnit, usual: Number(r.default_quantity ?? 1), per: perOf(r),
      }))
    },
  })
}

export type CustomFoodRow = { id: string; name: string; name_ta: string | null; unit: FoodUnit; kcal: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null; created_by: string | null }

/** The home's own foods ("Something else…"). */
export function useCustomFoods(householdId: string | undefined) {
  return useQuery({
    queryKey: ['custom-foods', householdId],
    enabled: Boolean(supabase && householdId),
    retry: false,
    queryFn: async (): Promise<CustomFoodRow[]> => {
      const { data, error } = await supabase!.from('custom_foods').select('*').eq('household_id', householdId).order('name')
      if (error) return []
      return data.map((r) => ({ id: r.id, name: r.name, name_ta: r.name_ta, unit: r.unit, kcal: num(r.kcal), protein_g: num(r.protein_g), carbs_g: num(r.carbs_g), fat_g: num(r.fat_g), created_by: r.created_by }))
    },
  })
}

/** Everything that can be picked in the Add sheet: common foods, the home's own foods, and snack dishes from the catalogue that have an estimate. */
export function useFoodOptions(householdId: string | undefined, lang: 'en' | 'ta') {
  const { data: common } = useCommonFoods()
  const { data: custom } = useCustomFoods(householdId)
  const { data: dishes } = useDishes(householdId ?? '')
  const { data: nutrition } = useAllNutrition()

  return useMemo(() => {
    const own: FoodOption[] = (custom ?? []).map((c) => ({
      key: foodKey({ kind: 'custom', id: c.id }), source: { kind: 'custom', id: c.id }, name_en: c.name, name_ta: c.name_ta, category: null, unit: c.unit, usual: 1,
      per: { kcal: c.kcal, protein_g: c.protein_g, carbs_g: c.carbs_g, fat_g: c.fat_g, fibre_g: null, sugar_g: null, sodium_mg: null },
    }))
    // any dish with an estimate: a lunch eaten out or a missed dinner can be added afterwards, as well as a snack
    const dishOptions: FoodOption[] = (dishes ?? [])
      .filter((d) => nutrition?.has(d.id))
      .map((d) => {
        const t = nutrition!.get(d.id)!
        return {
          key: foodKey({ kind: 'dish', id: d.id }), source: { kind: 'dish', id: d.id }, name_en: d.name, name_ta: d.dish_names.find((n) => n.language === 'ta')?.name ?? null,
          category: null, unit: 'serving' as const, usual: 1, per: { ...t },
        }
      })
    const all = [...own, ...(common ?? []), ...dishOptions]
    const byKey = new Map(all.map((o) => [o.key, o]))
    return { options: all, byKey, label: (o: FoodOption) => (lang === 'ta' && o.name_ta ? o.name_ta : o.name_en), dishName: (d: Parameters<typeof dishDisplayName>[0], names: Parameters<typeof dishDisplayName>[1]) => dishDisplayName(d, names, lang) }
  }, [common, custom, dishes, nutrition, lang])
}

/** One person's logged items between two dates (inclusive). Empty before the migration is run. */
export function useIntake(profileId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ['intake', profileId, from, to],
    enabled: Boolean(supabase && profileId && from <= to),
    retry: false,
    queryFn: async (): Promise<IntakeRow[]> => {
      const { data, error } = await supabase!.from('personal_intake').select('*').eq('profile_id', profileId).gte('eaten_on', from).lte('eaten_on', to).order('eaten_on').order('eaten_at')
      if (error) return []
      return data.map((r) => ({
        id: r.id, profile_id: r.profile_id, eaten_on: r.eaten_on, eaten_at: r.eaten_at, common_food_id: r.common_food_id, custom_food_id: r.custom_food_id, dish_id: r.dish_id,
        food_name: r.food_name, quantity: Number(r.quantity), unit: r.unit, ...perOf(r),
      }))
    },
  })
}

/** The foods this person starred. */
export function useUsuals(profileId: string | undefined) {
  return useQuery({
    queryKey: ['usuals', profileId],
    enabled: Boolean(supabase && profileId),
    retry: false,
    queryFn: async (): Promise<FoodSource[]> => {
      const { data, error } = await supabase!.from('personal_usuals').select('*').eq('profile_id', profileId)
      if (error) return []
      return data.flatMap((r): FoodSource[] => (r.common_food_id ? [{ kind: 'common' as const, id: r.common_food_id as string }] : r.custom_food_id ? [{ kind: 'custom' as const, id: r.custom_food_id as string }] : r.dish_id ? [{ kind: 'dish' as const, id: r.dish_id as string }] : []))
    },
  })
}

export function usePersonalGoals(profileId: string | undefined) {
  return useQuery({
    queryKey: ['goals', profileId],
    enabled: Boolean(supabase && profileId),
    retry: false,
    queryFn: async (): Promise<Goals | null> => {
      const { data, error } = await supabase!.from('personal_goals').select('*').eq('profile_id', profileId).maybeSingle()
      if (error || !data) return null
      return { protein_goal_g: num(data.protein_goal_g), kcal_goal: num(data.kcal_goal) }
    },
  })
}

export type FamilyExtrasRow = { profile_id: string; eaten_on: string; totals: PerUnit; items: number; unknown_items: number }

/** Each person's daily TOTALS of extras (never the items), for an Admin or today's Planner. Empty if not allowed or before the migration. */
export function useFamilyExtras(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['family-extras', from, to],
    enabled: Boolean(supabase && enabled && from <= to),
    retry: false,
    queryFn: async (): Promise<FamilyExtrasRow[]> => {
      const { data, error } = await supabase!.rpc('family_extras_totals', { p_from: from, p_to: to })
      if (error || !data) return []
      return (data as Record<string, unknown>[]).map((r) => ({ profile_id: r.profile_id as string, eaten_on: r.eaten_on as string, totals: perOf(r), items: Number(r.items), unknown_items: Number(r.unknown_items) }))
    },
  })
}
