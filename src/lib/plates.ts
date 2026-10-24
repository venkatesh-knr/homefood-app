// The diet plate: a second (or third) plate in one meal for the people whose diet plan the family meal does not suit. Who eats what, how many
// the family meal is cooked for, and which dishes each person actually eats. Pure logic, no network.
import type { SlotDish } from './plannerQueries'
import type { FitKey } from './dietPlans'
import type { SlotFasting } from './fasting'

export type SlotPlate = {
  id: string
  position: number
  plans: FitKey[]
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
  /** Who skips this meal (fasting) and who eats fasting foods only, from migration 0043. */
  fasting?: SlotFasting
}

/** Everyone who is on a plate of this meal. */
export function plateEaterIds(slot: { plates?: { eater_ids: string[] }[] }): Set<string> {
  return new Set((slot.plates ?? []).flatMap((p) => p.eater_ids))
}

/** The people eating the family meal: those marked as eating the meal, less the people on a plate. */
export function familyEaterIds(slot: Pick<SlotLike, 'meal_slot_eaters' | 'fasting'> & { plates?: { eater_ids: string[] }[] }): string[] {
  const onPlate = plateEaterIds(slot)
  const skip = new Set(slot.fasting?.skip ?? [])
  return slot.meal_slot_eaters.map((e) => e.profile_id).filter((id) => !onPlate.has(id) && !skip.has(id))
}

/** How many people are eating the meal at all: those marked as eating (or every family member when nobody is listed), less the people who skip it
 * because they are fasting. */
export function eatingTotal(slot: Pick<SlotLike, 'meal_slot_eaters' | 'fasting'>, familyCount: number): number {
  const skip = new Set(slot.fasting?.skip ?? [])
  const list = slot.meal_slot_eaters.map((e) => e.profile_id)
  return list.length > 0 ? list.filter((id) => !skip.has(id)).length : Math.max(0, familyCount - skip.size)
}

/** How many the family meal is cooked for (recipe amounts, shopping, the cook's sheet): the people eating the meal, or every family member when
 * nobody is listed, less the people on a plate. */
export function familyHeadcount(slot: Pick<SlotLike, 'meal_slot_eaters' | 'fasting'> & { plates?: { eater_ids: string[] }[] }, familyCount: number): number {
  const skip = new Set(slot.fasting?.skip ?? [])
  const onPlate = [...plateEaterIds(slot)].filter((id) => !skip.has(id))
  return Math.max(0, eatingTotal(slot, familyCount) - onPlate.length)
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
