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

export type SlotDish = { id: string; name: string; diet: DietType; allergens: string[]; dish_names: DishNameRow[] }
export type SlotWithDetails = MealSlot & {
  main_dish: SlotDish | null
  meal_slot_sides: { position: number; dish: SlotDish }[]
  meal_slot_cooks: { profile_id: string }[]
  meal_slot_eaters: { profile_id: string }[]
}

const SLOT_SELECT = `*,
  main_dish:dishes(id, name, diet, allergens, dish_names(language, name)),
  meal_slot_sides(position, dish:dishes(id, name, diet, allergens, dish_names(language, name))),
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
