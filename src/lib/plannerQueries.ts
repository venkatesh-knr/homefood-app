import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { MealSlot, PlannerTurn, WeekPlan } from './planner'
import type { DishNameRow, DietType } from './dishes'

export function useWeekPlan(householdId: string | undefined, weekStart: string | undefined) {
  return useQuery({
    queryKey: ['week-plan', householdId, weekStart],
    enabled: Boolean(supabase && householdId && weekStart),
    queryFn: async (): Promise<WeekPlan | null> => {
      const { data, error } = await supabase!
        .from('week_plans')
        .select('*')
        .eq('household_id', householdId)
        .eq('week_start', weekStart)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export type SlotDish = { id: string; name: string; diet: DietType; allergens: string[]; photo_path: string | null; cuisine_id: string | null; dish_names: DishNameRow[] }
export type SlotWithDetails = MealSlot & {
  main_dish: SlotDish | null
  meal_slot_sides: { position: number; dish: SlotDish }[]
  meal_slot_cooks: { profile_id: string }[]
  meal_slot_eaters: { profile_id: string }[]
}

const SLOT_SELECT = `*,
  main_dish:dishes(id, name, diet, allergens, photo_path, cuisine_id, dish_names(language, name)),
  meal_slot_sides(position, dish:dishes(id, name, diet, allergens, photo_path, cuisine_id, dish_names(language, name))),
  meal_slot_cooks(profile_id),
  meal_slot_eaters(profile_id)`

/** Every meal slot for a whole week — the planner list view and slot editor both read from this one cached query. */
export function useWeekSlots(weekPlanId: string | undefined) {
  return useQuery({
    queryKey: ['week-slots', weekPlanId],
    enabled: Boolean(supabase && weekPlanId),
    queryFn: async (): Promise<SlotWithDetails[]> => {
      const { data, error } = await supabase!.from('meal_slots').select(SLOT_SELECT).eq('week_plan_id', weekPlanId)
      if (error) throw error
      return data as unknown as SlotWithDetails[]
    },
  })
}

/** Meal slots across any date range (week, month or year) for the History screen — one query, newest first. */
export function useHistorySlots(householdId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ['history-slots', householdId, from, to],
    enabled: Boolean(supabase && householdId && from <= to),
    queryFn: async (): Promise<SlotWithDetails[]> => {
      const { data, error } = await supabase!
        .from('meal_slots')
        .select(SLOT_SELECT)
        .eq('household_id', householdId)
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: false })
      if (error) throw error
      return data as unknown as SlotWithDetails[]
    },
  })
}

export function usePlannerTurns(householdId: string | undefined) {
  return useQuery({
    queryKey: ['planner-turns', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<PlannerTurn[]> => {
      const { data, error } = await supabase!
        .from('planner_turns')
        .select('*')
        .eq('household_id', householdId)
        .order('start_date')
      if (error) throw error
      return data
    },
  })
}

/** Has this household planned any meal, ever (not just the current week)? For the getting-started checklist. */
export function useHasPlannedMeals(householdId: string | undefined) {
  return useQuery({
    queryKey: ['has-planned-meals', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<boolean> => {
      const { count, error } = await supabase!.from('meal_slots').select('id', { count: 'exact', head: true }).eq('household_id', householdId)
      if (error) throw error
      return (count ?? 0) > 0
    },
  })
}

/** Has this household published any week, ever? For the getting-started checklist. */
export function useHasPublishedWeek(householdId: string | undefined) {
  return useQuery({
    queryKey: ['has-published-week', householdId],
    enabled: Boolean(supabase && householdId),
    queryFn: async (): Promise<boolean> => {
      const { count, error } = await supabase!
        .from('week_plans')
        .select('id', { count: 'exact', head: true })
        .eq('household_id', householdId)
        .eq('status', 'published')
      if (error) throw error
      return (count ?? 0) > 0
    },
  })
}
