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

/** The Admin, or whoever is the Planner today (on the home's own clock): who may add, edit and switch off prep reminders. */
export function useCanEditPrep(): boolean {
  const { household } = useHome()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: household.timezone })
  return useCanPlanDate(today)
}
