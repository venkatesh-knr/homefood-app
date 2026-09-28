import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { weekDates, type MealSource, type MealType, type TurnScope } from './planner'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function invalidateWeek(weekPlanId: string, householdId: string) {
  await queryClient.invalidateQueries({ queryKey: ['week-slots', weekPlanId] })
  await queryClient.invalidateQueries({ queryKey: ['week-plan', householdId] })
}

/** Every week starts empty (no row) until the first save — this creates it on demand. */
export async function getOrCreateWeekPlan(householdId: string, weekStart: string): Promise<string> {
  const { data: existing, error: selectError } = await client()
    .from('week_plans')
    .select('id')
    .eq('household_id', householdId)
    .eq('week_start', weekStart)
    .maybeSingle()
  if (selectError) throw selectError
  if (existing) return existing.id

  const { data, error } = await client()
    .from('week_plans')
    .insert({ household_id: householdId, week_start: weekStart })
    .select('id')
    .single()
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['week-plan', householdId] })
  return data.id
}

export type SlotInput = {
  source: MealSource
  place_name: string
  main_dish_id: string | null
  side_dish_ids: string[]
  cook_profile_ids: string[]
  eater_profile_ids: string[]
  note: string
}

/** Upserts one meal slot and replaces its sides/cooks/eaters with exactly this list. */
export async function saveSlot(
  weekPlanId: string,
  householdId: string,
  date: string,
  meal: MealType,
  input: SlotInput,
): Promise<string> {
  const { data: slot, error } = await client()
    .from('meal_slots')
    .upsert(
      {
        week_plan_id: weekPlanId,
        household_id: householdId,
        date,
        meal,
        source: input.source,
        place_name: input.source === 'home' ? null : input.place_name.trim() || null,
        main_dish_id: input.source === 'home' ? input.main_dish_id : null,
        note: input.note.trim() || null,
      },
      { onConflict: 'week_plan_id,date,meal' },
    )
    .select('id')
    .single()
  if (error) throw error
  const slotId = slot.id as string

  await client().from('meal_slot_sides').delete().eq('slot_id', slotId)
  if (input.source === 'home' && input.side_dish_ids.length > 0) {
    const { error: sidesError } = await client()
      .from('meal_slot_sides')
      .insert(input.side_dish_ids.slice(0, 3).map((dish_id, i) => ({ slot_id: slotId, position: i + 1, dish_id })))
    if (sidesError) throw sidesError
  }

  await client().from('meal_slot_cooks').delete().eq('slot_id', slotId)
  if (input.source === 'home' && input.cook_profile_ids.length > 0) {
    const { error: cooksError } = await client()
      .from('meal_slot_cooks')
      .insert(input.cook_profile_ids.map((profile_id) => ({ slot_id: slotId, profile_id })))
    if (cooksError) throw cooksError
  }

  await client().from('meal_slot_eaters').delete().eq('slot_id', slotId)
  if (input.eater_profile_ids.length > 0) {
    const { error: eatersError } = await client()
      .from('meal_slot_eaters')
      .insert(input.eater_profile_ids.map((profile_id) => ({ slot_id: slotId, profile_id })))
    if (eatersError) throw eatersError
  }

  await invalidateWeek(weekPlanId, householdId)
  return slotId
}

export async function clearSlot(slotId: string, weekPlanId: string, householdId: string): Promise<void> {
  const { error } = await client().from('meal_slots').delete().eq('id', slotId)
  if (error) throw error
  await invalidateWeek(weekPlanId, householdId)
}

export async function publishWeek(weekPlanId: string, householdId: string): Promise<void> {
  const { error } = await client()
    .from('week_plans')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', weekPlanId)
  if (error) throw error
  await invalidateWeek(weekPlanId, householdId)
}

type CopySource = {
  date: string
  meal: MealType
  source: MealSource
  place_name: string | null
  main_dish_id: string | null
  note: string | null
  sides: string[]
  cooks: string[]
}

async function fetchSlotsForCopy(householdId: string, dates: string[]): Promise<CopySource[]> {
  const { data, error } = await client()
    .from('meal_slots')
    .select('date, meal, source, place_name, main_dish_id, note, meal_slot_sides(dish_id), meal_slot_cooks(profile_id)')
    .eq('household_id', householdId)
    .in('date', dates)
  if (error) throw error
  return (data ?? []).map((s) => ({
    date: s.date,
    meal: s.meal,
    source: s.source,
    place_name: s.place_name,
    main_dish_id: s.main_dish_id,
    note: s.note,
    sides: (s.meal_slot_sides as { dish_id: string }[]).map((x) => x.dish_id),
    cooks: (s.meal_slot_cooks as { profile_id: string }[]).map((x) => x.profile_id),
  }))
}

/** Fills empty slots in the target date range from the matching weekday in the source range. Never overwrites an existing slot. */
async function copyInto(householdId: string, sourceDates: string[], targetDates: string[]): Promise<number> {
  const [sourceSlots, targetWeekPlanId] = await Promise.all([
    fetchSlotsForCopy(householdId, sourceDates),
    getOrCreateWeekPlan(householdId, targetDates[0]!),
  ])
  const { data: existingTarget, error } = await client().from('meal_slots').select('date, meal').eq('household_id', householdId).in('date', targetDates)
  if (error) throw error
  const already = new Set((existingTarget ?? []).map((s) => `${s.date}:${s.meal}`))

  let copied = 0
  for (const src of sourceSlots) {
    const offset = sourceDates.indexOf(src.date)
    const targetDate = targetDates[offset]
    if (!targetDate || already.has(`${targetDate}:${src.meal}`)) continue

    const { data: newSlot, error: insertError } = await client()
      .from('meal_slots')
      .insert({
        week_plan_id: targetWeekPlanId,
        household_id: householdId,
        date: targetDate,
        meal: src.meal,
        source: src.source,
        place_name: src.place_name,
        main_dish_id: src.main_dish_id,
        note: src.note,
      })
      .select('id')
      .single()
    if (insertError) throw insertError

    if (src.sides.length > 0) {
      await client()
        .from('meal_slot_sides')
        .insert(src.sides.slice(0, 3).map((dish_id, i) => ({ slot_id: newSlot.id, position: i + 1, dish_id })))
    }
    if (src.cooks.length > 0) {
      await client()
        .from('meal_slot_cooks')
        .insert(src.cooks.map((profile_id) => ({ slot_id: newSlot.id, profile_id })))
    }
    copied += 1
  }

  await invalidateWeek(targetWeekPlanId, householdId)
  return copied
}

/** "Copy last week" — only fills meals the target week doesn't already have. */
export async function copyWeek(householdId: string, fromWeekStart: string, toWeekStart: string): Promise<number> {
  return copyInto(householdId, weekDates(fromWeekStart), weekDates(toWeekStart))
}

/** "Copy last Wed" — the same weekday from the previous week, one day only. */
export async function copyDay(householdId: string, fromDate: string, toDate: string): Promise<number> {
  return copyInto(householdId, [fromDate], [toDate])
}

export async function assignPlannerTurn(
  householdId: string,
  profileId: string,
  scope: TurnScope,
  startDate: string,
  endDate: string,
): Promise<void> {
  const { error } = await client()
    .from('planner_turns')
    .insert({ household_id: householdId, profile_id: profileId, scope, start_date: startDate, end_date: endDate })
  if (error) throw error
  await queryClient.invalidateQueries({ queryKey: ['planner-turns', householdId] })
}
