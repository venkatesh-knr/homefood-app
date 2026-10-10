import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { AttendanceRow } from './attendance'

/** Who skipped, ate elsewhere or ate a small / large portion, for meals between two dates. Empty (not an error) before migration 0019
 * is run, so the app keeps working and every meal simply counts as a normal portion. */
export function useAttendance(from: string, to: string) {
  return useQuery({
    queryKey: ['attendance', from, to],
    enabled: Boolean(supabase && from <= to),
    retry: false,
    queryFn: async (): Promise<AttendanceRow[]> => {
      const { data, error } = await supabase!
        .from('meal_attendance')
        .select('slot_id, profile_id, status, portion, meal_slots!inner(date)')
        .gte('meal_slots.date', from)
        .lte('meal_slots.date', to)
      if (error) return []
      return (data ?? []).map((r) => ({ slot_id: r.slot_id, profile_id: r.profile_id, status: r.status, portion: r.portion })) as AttendanceRow[]
    },
  })
}
