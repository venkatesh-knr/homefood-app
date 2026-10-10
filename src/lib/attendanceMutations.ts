import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { rowFromOption, type AttendanceOption } from './attendance'

/** Record what a person actually did at a meal. "normal" is the default, so it removes the row instead of storing one. */
export async function setAttendance(slotId: string, profileId: string, option: AttendanceOption): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const row = rowFromOption(option)
  if (row === null) {
    const { error } = await supabase.from('meal_attendance').delete().eq('slot_id', slotId).eq('profile_id', profileId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('meal_attendance')
      .upsert({ slot_id: slotId, profile_id: profileId, ...row, updated_at: new Date().toISOString() }, { onConflict: 'slot_id,profile_id' })
    if (error) throw error
  }
  await queryClient.invalidateQueries({ queryKey: ['attendance'] })
}
