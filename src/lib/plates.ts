// The diet plate: a second (or third) plate in one meal for the people whose diet plan the family meal does not suit. Who eats what, how many
// the family meal is cooked for, and which dishes each person actually eats. Pure logic, no network.
import type { SlotDish } from './plannerQueries'
import type { PlanKey } from './dietPlans'

export type SlotPlate = {
  id: string
  position: number
  plans: PlanKey[]
  /** Positions of the family meal's sides that are also on this plate (shared sides). */
  shared_sides: number[]
  main_dish: SlotDish | null
  sides: { position: number; dish: SlotDish }[]
  eater_ids: string[]
}

type SlotLike = {
  main_dish_id?: string | null
  main_dish?: SlotDish | null
  meal_slot_eaters: { profile_id: string }[]
  meal_slot_sides: { position: number; dish: SlotDish; is_leftover?: boolean }[]
  plates?: SlotPlate[]
}

/** Everyone who is on a plate of this meal. */
export function plateEaterIds(slot: Pick<SlotLike, 'plates'>): Set<string> {
  return new Set((slot.plates ?? []).flatMap((p) => p.eater_ids))
}

/** The people eating the family meal: those marked as eating the meal, less the people on a plate. */
export function familyEaterIds(slot: Pick<SlotLike, 'meal_slot_eaters' | 'plates'>): string[] {
  const onPlate = plateEaterIds(slot)
  return slot.meal_slot_eaters.map((e) => e.profile_id).filter((id) => !onPlate.has(id))
}

/** How many the family meal is cooked for (recipe amounts, shopping, the cook's sheet): the people eating the meal, or every family member when
 * nobody is listed, less the people on a plate. */
export function familyHeadcount(slot: Pick<SlotLike, 'meal_slot_eaters' | 'plates'>, familyCount: number): number {
  const total = slot.meal_slot_eaters.length || familyCount
  return Math.max(0, total - plateEaterIds(slot).size)
}

/** Positions of the family sides that are on at least one plate as well. */
export function sharedPositions(slot: Pick<SlotLike, 'plates'>): Set<number> {
  return new Set((slot.plates ?? []).flatMap((p) => p.shared_sides))
}

/** What one plate holds: its own main dish and sides, then the family sides it shares. */
export function plateDishes(slot: Pick<SlotLike, 'meal_slot_sides'>, plate: SlotPlate): SlotDish[] {
  const own = [...(plate.main_dish ? [plate.main_dish] : []), ...[...plate.sides].sort((a, b) => a.position - b.position).map((s) => s.dish)]
  const shared = [...slot.meal_slot_sides].sort((a, b) => a.position - b.position).filter((s) => plate.shared_sides.includes(s.position)).map((s) => s.dish)
  return [...own, ...shared]
}

/** The meal as ONE person eats it: the family meal, or their plate when they are on one (its main dish, its sides, and the shared family sides). */
export function mealFor<S extends { meal_slot_sides: { position?: number; dish: { id: string } }[]; plates?: SlotPlate[] }>(slot: S, profileId: string): S {
  const plate = (slot.plates ?? []).find((p) => p.eater_ids.includes(profileId))
  if (!plate) return slot
  const shared = slot.meal_slot_sides.filter((s) => s.position !== undefined && plate.shared_sides.includes(s.position))
  return {
    ...slot,
    main_dish: plate.main_dish,
    main_dish_id: plate.main_dish?.id ?? null,
    meal_slot_sides: [...[...plate.sides].sort((a, b) => a.position - b.position).map((s) => ({ position: s.position, dish: s.dish })), ...shared.map((s, i) => ({ ...s, position: 10 + i }))],
  }
}

/** The people on any plate of the meal, with the plans they follow, for the "Amma + Appa · Low-carb" lines. */
export function plateLabel(plate: SlotPlate, nameOf: (id: string) => string): string {
  return plate.eater_ids.map(nameOf).filter(Boolean).join(' + ')
}
