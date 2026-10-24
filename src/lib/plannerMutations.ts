import { cleanGuestNote, hasGuests } from './guests'
import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { toISODate, weekDates, weekStartOf, type MealSource, type MealType, type OutsideMealSize, type TurnScope } from './planner'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function invalidateWeek(_weekPlanId: string, householdId: string) {
  await queryClient.invalidateQueries({ queryKey: ['week-slots', householdId] })
  await queryClient.invalidateQueries({ queryKey: ['week-plan', householdId] })
  await queryClient.invalidateQueries({ queryKey: ['history-slots', householdId] })
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
  /** Sides that are leftovers: side dish id -> the leftover it uses. Only these are written with the leftover marker (migration 0038). */
  leftover_by_dish?: Record<string, string>
  cook_profile_ids: string[]
  eater_profile_ids: string[]
  note: string
  /** Dine-out / order-in only; empty for "not sure". */
  outside_size?: OutsideMealSize | ''
  /** Diet plates (migration 0042): up to two, each with its people, dishes and the family sides it shares. */
  plates?: PlateInput[]
  /** Guests at a home meal (migration 0044). */
  guests?: { adults: number; children: number; note: string }
  /** "Staying longer": the last day (ISO date) the same guests are repeated on, for the home's other planned meals that have no guests yet. */
  guests_until?: string
}

export type PlateInput = { person_ids: string[]; main_dish_id: string | null; side_dish_ids: string[]; shared_sides: number[]; plans: string[] }

/** Leftovers used in a meal are marked used for it; one that is taken out of the meal (or the meal is cleared) is good to use again. Quiet when
 * migration 0038 has not been run: there is nothing to keep in step then. */
async function syncLeftovers(slotId: string, wanted: string[]): Promise<void> {
  const { data, error } = await client().from('leftovers').select('id').eq('used_slot_id', slotId).eq('status', 'used')
  if (error) return
  const freed = (data ?? []).map((r) => r.id as string).filter((id) => !wanted.includes(id))
  if (freed.length > 0) await client().from('leftovers').update({ status: 'active', used_slot_id: null }).in('id', freed)
  if (wanted.length > 0) await client().from('leftovers').update({ status: 'used', used_slot_id: slotId }).in('id', wanted)
  await queryClient.invalidateQueries({ queryKey: ['leftovers'] })
}

/** Upserts one meal slot and replaces its sides/cooks/eaters with exactly this list. */
export async function saveSlot(
  weekPlanId: string,
  householdId: string,
  date: string,
  meal: MealType,
  input: SlotInput,
): Promise<string> {
  const fields = {
    source: input.source,
    place_name: input.source === 'home' ? null : input.place_name.trim() || null,
    main_dish_id: input.source === 'home' ? input.main_dish_id : null,
    note: input.note.trim() || null,
  }
  // A meal planned before the home changed its first day of the week lives in an older week plan: edit it where it is.
  const { data: found, error: findError } = await client().from('meal_slots').select('id').eq('household_id', householdId).eq('date', date).eq('meal', meal).maybeSingle()
  if (findError) throw findError
  const write = (extra: Record<string, unknown>) =>
    found
      ? client().from('meal_slots').update({ ...fields, ...extra }).eq('id', found.id).select('id').single()
      : client()
          .from('meal_slots')
          .insert({ week_plan_id: weekPlanId, household_id: householdId, date, meal, ...fields, ...extra })
          .select('id')
          .single()
  // The size of a meal out is a column from migration 0026 and the guests are columns from migration 0044; until those have been run the slot is
  // saved without them (each retry leaves out whatever column the database named).
  const size = input.source === 'home' ? null : input.outside_size || null
  const g = input.source === 'home' ? input.guests : undefined
  const optional: Record<string, unknown> = { outside_meal_size: size, guest_adults: g?.adults ?? 0, guest_children: g?.children ?? 0, guest_note: cleanGuestNote(g?.note ?? '') }
  let { data: slot, error } = await write(optional)
  for (let tries = 0; error && tries < 2; tries++) {
    const message = error.message ?? ''
    const missing = Object.keys(optional).filter((c) => (c.startsWith('guest_') ? /guest_/ : /outside_meal_size/).test(message))
    if (missing.length === 0) break
    for (const c of missing) delete optional[c]
    ;({ data: slot, error } = await write(optional))
  }
  if (error || !slot) throw error ?? new Error('The meal was not saved')
  const slotId = slot.id as string

  await client().from('meal_slot_sides').delete().eq('slot_id', slotId)
  if (input.source === 'home' && input.side_dish_ids.length > 0) {
    const { error: sidesError } = await client()
      .from('meal_slot_sides')
      .insert(input.side_dish_ids.slice(0, 3).map((dish_id, i) => ({ slot_id: slotId, position: i + 1, dish_id, ...(input.leftover_by_dish?.[dish_id] ? { is_leftover: true, leftover_id: input.leftover_by_dish[dish_id] } : {}) })))
    if (sidesError) throw sidesError
  }
  await syncLeftovers(slotId, input.source === 'home' ? Object.values(input.leftover_by_dish ?? {}) : [])

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

  await savePlates(slotId, input.source === 'home' ? (input.plates ?? []) : [])
  if (input.source === 'home' && input.guests && hasGuests(input.guests) && input.guests_until && input.guests_until > date) await repeatGuests(householdId, date, input.guests_until, input.guests)

  await invalidateWeek(weekPlanId, householdId)
  return slotId
}

/** "Staying longer": the same guests on the home's other planned home-cooked meals after `date` up to `until`. Only meals that have no guests yet, so
 * nothing already set is overwritten; the database's own rules decide which days the person may change. Returns how many meals were changed. */
export async function repeatGuests(householdId: string, date: string, until: string, guests: { adults: number; children: number; note: string }): Promise<number> {
  const { data, error } = await client()
    .from('meal_slots')
    .update({ guest_adults: guests.adults, guest_children: guests.children, guest_note: cleanGuestNote(guests.note) })
    .eq('household_id', householdId)
    .eq('source', 'home')
    .eq('guest_adults', 0)
    .eq('guest_children', 0)
    .gt('date', date)
    .lte('date', until)
    .select('id')
  if (error) throw error
  return (data ?? []).length
}

/** Replaces the meal's diet plates with exactly this list. Quiet when migration 0042 has not been run and there is nothing to save. */
async function savePlates(slotId: string, plates: PlateInput[]): Promise<void> {
  const removed = await client().from('meal_slot_plates').delete().eq('slot_id', slotId)
  if (removed.error) {
    if (plates.length > 0) throw removed.error
    return
  }
  for (const [i, p] of plates.filter((x) => x.person_ids.length > 0).entries()) {
    const { data: plate, error } = await client().from('meal_slot_plates').insert({ slot_id: slotId, position: i + 1, main_dish_id: p.main_dish_id, plans: p.plans, shared_sides: p.shared_sides }).select('id').single()
    if (error || !plate) throw error ?? new Error('The diet plate was not saved')
    if (p.side_dish_ids.length > 0) {
      const { error: sideError } = await client().from('meal_slot_plate_sides').insert(p.side_dish_ids.slice(0, 2).map((dish_id, k) => ({ plate_id: plate.id, position: k + 1, dish_id })))
      if (sideError) throw sideError
    }
    const { error: eaterError } = await client().from('meal_slot_plate_eaters').insert(p.person_ids.map((profile_id) => ({ plate_id: plate.id, slot_id: slotId, profile_id })))
    if (eaterError) throw eaterError
  }
}

/** "Cook this again": puts a dish (and optionally the sides it had) into a meal that is still free. Looks again first, so a meal planned in
 * the meantime is never replaced; returns false in that case. */
export async function planDishInFreeSlot(args: {
  householdId: string
  weekStartsOn: number
  date: string
  meal: MealType
  dishId: string
  sideDishIds: string[]
  eaterProfileIds: string[]
}): Promise<boolean> {
  const { data: found, error } = await client().from('meal_slots').select('id, place_name, main_dish_id').eq('household_id', args.householdId).eq('date', args.date).eq('meal', args.meal).maybeSingle()
  if (error) throw error
  if (found && (found.main_dish_id || found.place_name)) return false
  const [y, m, d] = args.date.split('-').map(Number)
  const weekPlanId = await getOrCreateWeekPlan(args.householdId, toISODate(weekStartOf(new Date(y!, m! - 1, d!), args.weekStartsOn)))
  await saveSlot(weekPlanId, args.householdId, args.date, args.meal, {
    source: 'home',
    place_name: '',
    main_dish_id: args.dishId,
    side_dish_ids: args.sideDishIds,
    cook_profile_ids: [],
    eater_profile_ids: args.eaterProfileIds,
    note: '',
  })
  return true
}

export async function clearSlot(slotId: string, weekPlanId: string, householdId: string): Promise<void> {
  await syncLeftovers(slotId, [])
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
    .select('date, meal, source, place_name, main_dish_id, note, meal_slot_sides(*), meal_slot_cooks(profile_id)')
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
    // a leftover used in that meal was a one-off: it is not copied
    sides: (s.meal_slot_sides as { dish_id: string; is_leftover?: boolean }[]).filter((x) => !x.is_leftover).map((x) => x.dish_id),
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
