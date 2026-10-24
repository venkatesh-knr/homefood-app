// Diet plans: which dishes fit each plan (read from the diet tags of migration 0040), who may follow which plan, and how followers are grouped.
// General guidance, never a diagnosis. Pure logic, no network.

export type PlanKey = 'low_carb' | 'paleo' | 'mediterranean' | 'high_protein' | 'vegan' | 'jain' | 'low_salt' | 'senior'
export const PLAN_KEYS: PlanKey[] = ['low_carb', 'paleo', 'mediterranean', 'high_protein', 'vegan', 'jain', 'low_salt', 'senior']
/** Plans that cut whole food groups: not for anyone under 18, and the birth year must be known. */
export const RESTRICTIVE_PLANS: PlanKey[] = ['low_carb', 'paleo']

export type Follow = { profile_id: string; plan: PlanKey; since: string; set_by: string | null }

/** What each plan keeps out of a dish (a dish fits when it has none of these tags), plus the one tag a plan asks for. */
const AVOID: Record<PlanKey, string[]> = {
  low_carb: ['grain', 'added_sugar', 'root_veg', 'sweet'],
  paleo: ['grain', 'pulse', 'dairy', 'added_sugar'],
  mediterranean: ['added_sugar', 'oily'],
  high_protein: [],
  vegan: ['meat', 'egg', 'dairy'],
  jain: ['meat', 'egg', 'onion_garlic', 'root_veg'],
  low_salt: ['salty'],
  senior: ['oily', 'spicy', 'fried'],
}
const REQUIRE: Partial<Record<PlanKey, string>> = { high_protein: 'high_protein' }

/** Whether a dish (by its tags) fits a plan. A dish with no tags at all fits every plan that only avoids things. */
export function planFits(plan: PlanKey, dish: { tags?: string[] }): boolean {
  const tags = dish.tags ?? []
  const need = REQUIRE[plan]
  if (need && !tags.includes(need)) return false
  return !AVOID[plan].some((t) => tags.includes(t))
}

/** Fits every one of these plans (the plate for a group that follows more than one). */
export const fitsAll = (plans: PlanKey[], dish: { tags?: string[] }): boolean => plans.every((p) => planFits(p, dish))

export type Eligibility = { ok: true } | { ok: false; reason: 'under18' | 'noBirthYear' }

/** Whether this person may follow this plan: the restrictive ones need a known birth year and age 18 or more (the database says the same). */
export function eligibility(plan: PlanKey, birthYear: number | null, thisYear: number): Eligibility {
  if (!RESTRICTIVE_PLANS.includes(plan)) return { ok: true }
  if (birthYear === null) return { ok: false, reason: 'noBirthYear' }
  return thisYear - birthYear < 18 ? { ok: false, reason: 'under18' } : { ok: true }
}

/** Followers by plan, the plan that started first first. */
export function groupByPlan(follows: Follow[]): { plan: PlanKey; follows: Follow[] }[] {
  const out = new Map<PlanKey, Follow[]>()
  for (const f of follows) out.set(f.plan, [...(out.get(f.plan) ?? []), f])
  return [...out.entries()]
    .map(([plan, list]) => ({ plan, follows: list.sort((a, b) => a.since.localeCompare(b.since)) }))
    .sort((a, b) => a.follows[0]!.since.localeCompare(b.follows[0]!.since) || PLAN_KEYS.indexOf(a.plan) - PLAN_KEYS.indexOf(b.plan))
}

/** The plans one person follows. */
export const plansOf = (follows: Follow[], profileId: string): PlanKey[] => follows.filter((f) => f.profile_id === profileId).map((f) => f.plan)
