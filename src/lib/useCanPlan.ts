import { useHome } from './homeContext'
import { turnCoversDate } from './planner'
import { usePlannerTurns } from './plannerQueries'

/** Admins can always plan; anyone else only on days an approved Planner turn of theirs covers. */
export function useCanPlanDate(date: string | undefined): boolean {
  const { profile, household } = useHome()
  const { data: turns } = usePlannerTurns(household.id)
  if (!date) return false
  return profile.role === 'admin' || (turns ?? []).some((t) => t.profile_id === profile.id && turnCoversDate(t, date))
}
