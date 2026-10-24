import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { MealSlot, PlannerTurn, WeekPlan } from './planner'
import type { DishNameRow, DietType } from './dishes'
import { addDays } from './planner'
import type { SlotPlate } from './plates'
import type { PlanKey } from './dietPlans'

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

export type SlotDish = { id: string; name: string; diet: DietType; allergens: string[]; photo_path: string | null; cuisine_id: string | null; dish_names: DishNameRow[]; tags?: string[] }
export type SlotWithDetails = MealSlot & {
  main_dish: SlotDish | null
  /** `is_leftover` / `leftover_id` exist once migration 0038 is run (the select asks for every column, so nothing breaks before). */
  meal_slot_sides: { position: number; dish: SlotDish; is_leftover?: boolean; leftover_id?: string | null }[]
  meal_slot_cooks: { profile_id: string }[]
  meal_slot_eaters: { profile_id: string }[]
  /** Diet plates (migration 0042), added by `attachPlates`; missing before that migration is run. */
  plates?: SlotPlate[]
}

const DISH_FIELDS = 'id, name, diet, allergens, photo_path, cuisine_id, tags, dish_names(language, name)'

/** Adds each meal's diet plates (a separate read, so a missing table never breaks the planner). Quiet: no plates before migration 0042. */
export async function attachPlates(slots: SlotWithDetails[]): Promise<SlotWithDetails[]> {
  if (slots.length === 0) return slots
  const bySlot = new Map<string, SlotPlate[]>()
  for (let i = 0; i < slots.length; i += 100) {
    const ids = slots.slice(i, i + 100).map((s) => s.id)
    const { data, error } = await supabase!
      .from('meal_slot_plates')
      .select(`id, slot_id, position, plans, shared_sides, main_dish:dishes(${DISH_FIELDS}), meal_slot_plate_sides(position, dish:dishes(${DISH_FIELDS})), meal_slot_plate_eaters(profile_id)`)
      .in('slot_id', ids)
    if (error) return slots
    for (const r of data as unknown as (Omit<SlotPlate, 'sides' | 'eater_ids' | 'plans'> & { slot_id: string; plans: string[]; meal_slot_plate_sides: SlotPlate['sides']; meal_slot_plate_eaters: { profile_id: string }[] })[]) {
      const plate: SlotPlate = { id: r.id, position: r.position, plans: r.plans as PlanKey[], shared_sides: r.shared_sides ?? [], main_dish: r.main_dish, sides: r.meal_slot_plate_sides ?? [], eater_ids: (r.meal_slot_plate_eaters ?? []).map((e) => e.profile_id) }
      bySlot.set(r.slot_id, [...(bySlot.get(r.slot_id) ?? []), plate].sort((a, b) => a.position - b.position))
    }
  }
  if (bySlot.size === 0) return slots
  return slots.map((s) => (bySlot.has(s.id) ? { ...s, plates: bySlot.get(s.id) } : s))
}

const SLOT_SELECT = `*,
  main_dish:dishes(id, name, diet, allergens, photo_path, cuisine_id, tags, dish_names(language, name)),
  meal_slot_sides(*, dish:dishes(id, name, diet, allergens, photo_path, cuisine_id, tags, dish_names(language, name))),
  meal_slot_cooks(profile_id),
  meal_slot_eaters(profile_id)`

/** Every meal slot for the 7 days starting `weekStart` — the planner list view and slot editor both read from this one cached query.
 * It goes by date, not by week plan, so a home that changes its first day of the week still sees every meal it already planned. */
export function useWeekSlots(householdId: string | undefined, weekStart: string | undefined) {
  return useQuery({
    queryKey: ['week-slots', householdId, weekStart],
    enabled: Boolean(supabase && householdId && weekStart),
    queryFn: async (): Promise<SlotWithDetails[]> => {
      const { data, error } = await supabase!
        .from('meal_slots')
        .select(SLOT_SELECT)
        .eq('household_id', householdId)
        .gte('date', weekStart)
        .lte('date', addDays(weekStart!, 6))
      if (error) throw error
      return attachPlates(data as unknown as SlotWithDetails[])
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
      return attachPlates(data as unknown as SlotWithDetails[])
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
